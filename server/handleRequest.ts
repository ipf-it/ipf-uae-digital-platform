import { randomUUID, randomInt, createHash } from "node:crypto";
import { extname } from "node:path";
import sharp from "sharp";
import type { User } from "@supabase/supabase-js";
import { ensureDatabase, getSupabase, uploadBucket } from "./db.js";
import { chapterDesks, eventRegistrationNo } from "./crypto.js";
import { header, json, readJson, type AppRequest, type AppResponse } from "./http.js";
import { mapEventRow, catalogSeedEvents, isUpcomingEvent, startOfToday, eventCategories, type PublicEvent } from "../src/data/eventCatalog.js";
import { rateLimit, clientIp } from "./rateLimit.js";
import { sendOtpSms } from "./sms.js";
import { autoTranslateMissingLocales } from "./translate.js";

const PUBLIC_CACHE_HEADERS = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };
const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;
const OTP_TTL_MS = 10 * 60 * 1000;
const VERIFIED_PHONE_TTL_MS = 30 * 60 * 1000;
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const MAX_UPLOAD_WIDTH = 1920;

// Every upload (event posters, committee photos, tenant galleries, media library) lands here
// before hitting storage, so a 5MB phone-camera photo doesn't become the file every site visitor
// downloads. Same resize/quality settings as scripts/optimize-images.mjs for consistency. Only
// touches the two formats browsers actually produce from a file picker/camera roll; anything else
// (webp, gif, svg) passes through untouched so content-type/extension never drift out of sync.
async function compressUploadImage(buffer: Buffer, contentType: string): Promise<Buffer> {
  const isJpeg = contentType === "image/jpeg" || contentType === "image/jpg";
  const isPng = contentType === "image/png";
  if (!isJpeg && !isPng) return buffer;
  try {
    const image = sharp(buffer, { failOn: "none" });
    const metadata = await image.metadata();
    let pipeline = image.rotate();
    if (metadata.width && metadata.width > MAX_UPLOAD_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_UPLOAD_WIDTH, withoutEnlargement: true });
    }
    const out = isJpeg
      ? await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer()
      : await pipeline.png({ quality: 80, compressionLevel: 9, palette: true }).toBuffer();
    return out.length < buffer.length ? out : buffer;
  } catch {
    return buffer;
  }
}

// The 10 locale ids from src/i18n/locales.ts — kept as a plain list here (rather than importing
// the frontend module) since this is the one place server code needs to validate a locale param.
const SUPPORTED_LOCALES = ["en", "hi", "ml", "ta", "te", "kn", "gu", "mr", "pa", "bn"];

function normalizeLocale(value: string | null) {
  return value && SUPPORTED_LOCALES.includes(value) ? value : "en";
}

/** Merges a base row with its translation rows for the requested locale, falling back to English
 * for any field the requested locale doesn't have a value for — same fallback semantics as the
 * frontend's LocaleProvider.t(). `rows` is one entity's full set of _i18n rows (all locales). */
function pickLocale<T extends Record<string, unknown>>(rows: T[], locale: string, fields: (keyof T)[]): Partial<T> {
  const en = rows.find((row) => row.locale === "en");
  const current = rows.find((row) => row.locale === locale);
  const merged: Partial<T> = {};
  for (const field of fields) {
    merged[field] = ((current?.[field] as string) || (en?.[field] as string) || "") as T[typeof field];
  }
  return merged;
}

/** Reshapes a flat array of _i18n rows into { en: {...}, hi: {...} } for admin editing UIs, which
 * need to see/edit every locale at once rather than just the one the current visitor is using. */
function translationsMap<T extends Record<string, unknown>>(rows: T[], fields: (keyof T)[]) {
  const map: Record<string, Partial<T>> = {};
  for (const row of rows) {
    const locale = row.locale as string;
    const entry: Partial<T> = {};
    for (const field of fields) entry[field] = row[field];
    map[locale] = entry;
  }
  return map;
}

type PersonRow = {
  id: string;
  membership_no: string;
  name: string;
  email: string;
  phone: string;
  emirate: string;
  chapter: string;
  home_state: string;
  is_volunteer: boolean;
  password_hash: string;
  created_at: string;
};

type HoursRow = { id: string; activity_date: string; hours: number | string; activity: string };

type AdminRole = "super_admin" | "central_content_admin" | "chapter_admin" | "council_admin" | "editor";
type AdminRow = { id: string; email: string; display_name: string; role: AdminRole; scope_type: "global" | "chapter" | "council"; scope_id: string | null; active: boolean; mfa_required: boolean; password_hash: string };

function publicPerson(row: PersonRow, hours: HoursRow[] = []) {
  return {
    id: row.id,
    membershipNo: row.membership_no,
    name: row.name,
    email: row.email,
    phone: row.phone,
    emirate: row.emirate,
    chapter: row.chapter,
    homeState: row.home_state,
    isVolunteer: row.is_volunteer,
    createdAt: row.created_at,
    volunteerHours: hours.map((item) => ({
      id: item.id,
      date: String(item.activity_date).slice(0, 10),
      hours: Number(item.hours),
      activity: item.activity,
    })),
  };
}

function hashOtp(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

function bearerToken(req: AppRequest) {
  const value = header(req, "authorization");
  return value.startsWith("Bearer ") ? value.slice(7).trim() : "";
}

// supabase.auth.getUser() makes a live network round-trip to the Auth server on every call — with
// no local verification path available (this project signs JWTs with the legacy symmetric secret,
// not the newer asymmetric keys getClaims() needs to verify offline). A warm serverless instance
// handling several admin requests back to back (dashboard load firing multiple API calls, a quick
// sequence of page navigations) was re-paying that round-trip every single time for the same
// still-valid token. Cached per-instance for a short window — short enough that revoking access
// (deactivating an admin) still takes effect within seconds, long enough to collapse the repeat
// lookups that actually happen during one person's active session.
const AUTH_CACHE_TTL_MS = 15_000;
const authCache = new Map<string, { user: User | null; expiresAt: number }>();

async function authenticatedUser(req: AppRequest) {
  const token = bearerToken(req);
  if (!token) return null;
  const cached = authCache.get(token);
  if (cached && cached.expiresAt > Date.now()) return cached.user;
  const { data, error } = await getSupabase().auth.getUser(token);
  const user = error ? null : data.user;
  if (authCache.size > 500) authCache.clear();
  authCache.set(token, { user, expiresAt: Date.now() + AUTH_CACHE_TTL_MS });
  return user;
}

async function ensureAdminSeed() {
  const email = process.env.IPF_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.IPF_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) return;
  const supabase = getSupabase();
  const { data } = await supabase.from("admin_users").select("id,auth_user_id").eq("email", email).maybeSingle();
  if (data?.auth_user_id) return;
  let authUserId = "";
  const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { admin_account: true } });
  if (created.data.user) authUserId = created.data.user.id;
  if (!authUserId && created.error) {
    const users = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    authUserId = users.data.users.find((user) => user.email?.toLowerCase() === email)?.id ?? "";
  }
  if (!authUserId) throw created.error ?? new Error("Could not create the initial administrator");
  if (data) await supabase.from("admin_users").update({ auth_user_id: authUserId, password_hash: "" }).eq("id", data.id);
  else await supabase.from("admin_users").insert({ auth_user_id: authUserId, email, display_name: "IPF Super Admin", role: "super_admin", scope_type: "global", active: true, mfa_required: true, password_hash: "" });
}

async function adminFromRequest(req: AppRequest) {
  const user = await authenticatedUser(req);
  if (!user) return null;
  const { data } = await getSupabase().from("admin_users").select("*").eq("auth_user_id", user.id).eq("active", true).maybeSingle();
  return (data as AdminRow | null) ?? null;
}

function isGlobalAdmin(admin: AdminRow) {
  return admin.scope_type === "global" && (admin.role === "super_admin" || admin.role === "central_content_admin");
}

function publicAdmin(admin: AdminRow) {
  return { id: admin.id, email: admin.email, name: admin.display_name, role: admin.role, scopeType: admin.scope_type, scopeId: admin.scope_id, mfaRequired: admin.mfa_required, isGlobalAdmin: isGlobalAdmin(admin) };
}

// Editors are scoped exactly like chapter/council admins, except they may only touch events they
// themselves created ("assigned drafts only" — the role's advertised restriction, now enforced
// instead of just described in the dashboard copy).
function eventInScope(admin: AdminRow, event: { scope_type?: string; scope_id?: string | null; created_by?: string | null }) {
  if (isGlobalAdmin(admin)) return true;
  if (event.scope_type !== admin.scope_type || event.scope_id !== admin.scope_id) return false;
  if (admin.role === "editor") return event.created_by === admin.id;
  return true;
}

async function personFromRequest(req: AppRequest) {
  const user = await authenticatedUser(req);
  if (!user) return null;
  const { data } = await getSupabase().from("people").select("*").eq("auth_user_id", user.id).maybeSingle();
  return (data as PersonRow | null) ?? null;
}

async function hoursFor(personId: string) {
  const { data } = await getSupabase()
    .from("volunteer_hours")
    .select("id, activity_date, hours, activity")
    .eq("person_id", personId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data as HoursRow[] | null) ?? [];
}

async function cmsFromRequest(req: AppRequest) {
  const admin = await adminFromRequest(req);
  if (admin) return {
    role: isGlobalAdmin(admin) ? ("central" as const) : ("chapter" as const),
    scopeType: admin.scope_type,
    scopeId: admin.scope_id ?? "",
    admin,
  };
  return null;
}

async function loadHoursAndPerson(person: PersonRow) {
  return publicPerson(person, await hoursFor(person.id));
}

async function ensureEvent(input: {
  id: string;
  title?: string;
  date?: string;
  location?: string;
  body?: string;
  slides?: unknown;
  category?: string;
  emirate?: string;
  startsAt?: string | null;
  isFree?: boolean;
  published?: boolean;
}) {
  const supabase = getSupabase();
  const extra = {
    title: input.title || input.id,
    event_date: input.date ?? "",
    location: input.location ?? "",
    body: input.body ?? "",
    slides: input.slides ?? [],
    category: input.category ?? "Community",
    emirate: input.emirate ?? "uae",
    starts_at: input.startsAt || null,
    is_free: input.isFree !== false,
    published: input.published !== false,
    updated_at: new Date().toISOString(),
  };
  const { data: existing } = await supabase.from("events").select("id").eq("id", input.id).maybeSingle();
  if (existing) {
    if (input.title) {
      const { error } = await supabase.from("events").update(extra).eq("id", input.id);
      if (error) {
        const fallback = await supabase
          .from("events")
          .update({
            title: extra.title,
            event_date: extra.event_date,
            location: extra.location,
            body: extra.body,
            slides: extra.slides,
            updated_at: extra.updated_at,
          })
          .eq("id", input.id);
        if (fallback.error) throw fallback.error;
      }
    }
    return;
  }
  const { error } = await supabase.from("events").insert({ id: input.id, ...extra });
  if (error && error.code !== "23505") {
    const basic = await supabase.from("events").insert({
      id: input.id,
      title: extra.title,
      event_date: extra.event_date,
      location: extra.location,
      body: extra.body,
      slides: extra.slides,
    });
    if (basic.error && basic.error.code !== "23505") throw basic.error;
  }
}

let standingSeeded = false;

async function seedStandingEvents() {
  if (standingSeeded) return;
  const supabase = getSupabase();
  const { data } = await supabase.from("events").select("id");
  const have = new Set((data ?? []).map((row) => String((row as { id: string }).id)));
  for (const event of catalogSeedEvents) {
    if (have.has(event.id)) continue;
    await ensureEvent({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
      body: event.body,
      slides: event.slides,
      category: event.category,
      emirate: event.emirate,
      startsAt: event.startsAt,
      isFree: event.isFree,
    });
  }
  standingSeeded = true;
}

function eventFromRow(row: Record<string, unknown>): PublicEvent {
  return mapEventRow(row);
}

async function loadPublicEvent(eventId: string): Promise<PublicEvent | null> {
  const supabase = getSupabase();
  const { data } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
  if (data) return eventFromRow(data as Record<string, unknown>);
  return catalogSeedEvents.find((event) => event.id === eventId) ?? null;
}

function route(req: AppRequest) {
  return { method: req.method.toUpperCase(), path: req.url.split("?")[0] ?? "" };
}

function normalizeUaeMobile(input: string) {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00971")) digits = digits.slice(2);
  if (digits.startsWith("05")) digits = `971${digits.slice(1)}`;
  const normalized = `+${digits}`;
  if (!/^\+9715[024568]\d{7}$/.test(normalized)) throw new Error("Enter a valid UAE mobile number");
  return normalized;
}

export async function handleRequest(req: AppRequest): Promise<AppResponse> {
  const { method, path } = route(req);
  if (!path.startsWith("/api/")) return json(404, { error: "Unknown API route" });

  try {
    await ensureDatabase();
    await seedStandingEvents();
    await ensureAdminSeed();
    const supabase = getSupabase();

    if (method === "GET" && path === "/api/health") {
      return json(200, { ok: true });
    }

    if (method === "GET" && path === "/api/cron/purge-audit-logs") {
      // Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically once CRON_SECRET is
      // set as a project env var — see vercel.json's `crons` entry for the schedule.
      const secret = process.env.CRON_SECRET;
      if (!secret || bearerToken(req) !== secret) return json(401, { error: "Unauthorized" });
      const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
      const { error, count } = await supabase.from("audit_logs").delete({ count: "exact" }).lt("created_at", cutoff);
      if (error) throw error;
      return json(200, { ok: true, deleted: count ?? 0 });
    }

    if (method === "POST" && path === "/api/members/check-phone") {
      const checkPhoneLimit = await rateLimit("members-check-phone", clientIp(req.headers), 20, 60);
      if (!checkPhoneLimit.allowed) return json(429, { error: "Too many attempts. Try again shortly." });
      const body = await readJson<{ phone?: string }>(req);
      let phone = "";
      try { phone = normalizeUaeMobile(body.phone ?? ""); }
      catch (error) { return json(400, { error: error instanceof Error ? error.message : "Invalid mobile number" }); }
      const { data } = await supabase.from("people").select("id").eq("phone", phone).maybeSingle();
      if (data) return json(409, { error: "An account with this mobile number already exists" });
      return json(200, { ok: true, phone });
    }

    if (method === "POST" && path === "/api/members/otp/request") {
      const otpRequestLimit = await rateLimit("otp-request", clientIp(req.headers), 5, 300);
      if (!otpRequestLimit.allowed) return json(429, { error: "Too many codes requested. Try again in a few minutes." });
      const body = await readJson<{ phone?: string }>(req);
      let phone = "";
      try { phone = normalizeUaeMobile(body.phone ?? ""); }
      catch (error) { return json(400, { error: error instanceof Error ? error.message : "Invalid mobile number" }); }
      const phoneLimit = await rateLimit("otp-request-phone", phone, 5, 3600);
      if (!phoneLimit.allowed) return json(429, { error: "Too many codes requested for this number. Try again later." });
      const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
      // Send before persisting: a failed send should never leave a valid, never-delivered code
      // sitting in the table, and the provider's raw error text should never reach the client.
      try {
        await sendOtpSms(phone, code);
      } catch {
        return json(502, { error: "Could not send the verification code. Try again shortly." });
      }
      const { error } = await supabase.from("phone_otp_codes").insert({
        phone,
        code_hash: hashOtp(phone, code),
        expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
      });
      if (error) throw error;
      return json(200, { ok: true, phone, expiresInSeconds: OTP_TTL_MS / 1000 });
    }

    if (method === "POST" && path === "/api/members/otp/verify") {
      const otpVerifyLimit = await rateLimit("otp-verify", clientIp(req.headers), 20, 300);
      if (!otpVerifyLimit.allowed) return json(429, { error: "Too many attempts. Try again shortly." });
      const body = await readJson<{ phone?: string; code?: string }>(req);
      let phone = "";
      try { phone = normalizeUaeMobile(body.phone ?? ""); }
      catch (error) { return json(400, { error: error instanceof Error ? error.message : "Invalid mobile number" }); }
      const code = (body.code ?? "").trim();
      if (!/^\d{6}$/.test(code)) return json(400, { error: "Enter the 6-digit code" });
      const { data: pending } = await supabase
        .from("phone_otp_codes")
        .select("id, code_hash, attempts, expires_at")
        .eq("phone", phone)
        .is("consumed_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!pending) return json(400, { error: "Request a new code — this one has expired or doesn't exist." });
      if (pending.attempts >= 5) return json(429, { error: "Too many incorrect attempts. Request a new code." });
      if (pending.code_hash !== hashOtp(phone, code)) {
        await supabase.from("phone_otp_codes").update({ attempts: pending.attempts + 1 }).eq("id", pending.id);
        return json(400, { error: "Incorrect code" });
      }
      await supabase.from("phone_otp_codes").update({ consumed_at: new Date().toISOString() }).eq("id", pending.id);
      await supabase.from("verified_phones").upsert({ phone, expires_at: new Date(Date.now() + VERIFIED_PHONE_TTL_MS).toISOString() });
      return json(200, { ok: true, phone });
    }

    if (method === "POST" && path === "/api/members/become-volunteer") {
      const becomeVolunteerLimit = await rateLimit("become-volunteer", clientIp(req.headers), 10, 300);
      if (!becomeVolunteerLimit.allowed) return json(429, { error: "Too many attempts. Try again shortly." });
      const person = await personFromRequest(req);
      if (!person) return json(401, { error: "Sign in required" });
      if (person.is_volunteer) return json(200, { ok: true, alreadyVolunteer: true });
      const { error } = await supabase.from("people").update({ is_volunteer: true }).eq("id", person.id);
      if (error) throw error;
      return json(200, { ok: true });
    }

    if (method === "POST" && path === "/api/cms/login") {
      return json(410, { error: "Password-only CMS login has been replaced by Supabase administrator authentication." });
    }

    if (method === "GET" && path === "/api/admin/session") {
      // The client signs in via Supabase Auth directly (supabaseAuth.auth.signInWithPassword) and
      // then calls this route to resolve the resulting session into an admin_users row — it never
      // uses a dedicated admin/login endpoint. Distinguish "not signed in at all" (401) from
      // "signed in, but this account has no administrator access" (403) so AdminProvider.signIn can
      // surface a real error instead of silently failing to navigate anywhere.
      const user = await authenticatedUser(req);
      if (!user) return json(401, { error: "Administrator sign-in required" });
      const { data } = await supabase.from("admin_users").select("*").eq("auth_user_id", user.id).eq("active", true).maybeSingle();
      const admin = data as AdminRow | null;
      if (!admin) return json(403, { error: "This account does not have administrator access" });
      return json(200, { admin: publicAdmin(admin) });
    }

    if (method === "POST" && path === "/api/admin/login-audit") {
      // Called once by AdminProvider.signIn right after a successful sign-in — kept separate from
      // /api/admin/session (which also runs on every page load and auth-state-change event) so the
      // audit log records real login events, not every session check.
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      await Promise.all([
        supabase.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", admin.id),
        supabase.from("audit_logs").insert({ actor_id: admin.id, action: "admin.login", entity_type: "admin_user", entity_id: admin.id, request_id: header(req, "x-request-id") || randomUUID() }),
      ]);
      return json(200, { ok: true });
    }

    if (method === "GET" && path === "/api/admin/dashboard") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const scope = admin.scope_id;
      let eventsQuery = supabase.from("events").select("*", { count: "exact", head: true });
      let peopleQuery = supabase.from("people").select("*", { count: "exact", head: true });
      let approvalsQuery = supabase.from("approval_requests").select("*", { count: "exact", head: true });
      let pendingQuery = supabase.from("approval_requests").select("id,entity_type,entity_id,status,scope_type,scope_id,created_at").in("status", ["submitted","under_review","changes_requested"]).order("created_at", { ascending: false }).limit(20);
      if (scope && admin.scope_type === "chapter") {
        eventsQuery = eventsQuery.eq("scope_type", "chapter").eq("scope_id", scope);
        peopleQuery = peopleQuery.eq("emirate", scope);
        approvalsQuery = approvalsQuery.eq("scope_type", "chapter").eq("scope_id", scope);
        pendingQuery = pendingQuery.eq("scope_type", "chapter").eq("scope_id", scope);
      } else if (scope && admin.scope_type === "council") {
        eventsQuery = eventsQuery.eq("scope_type", "council").eq("scope_id", scope);
        peopleQuery = peopleQuery.eq("home_state", scope);
        approvalsQuery = approvalsQuery.eq("scope_type", "council").eq("scope_id", scope);
        pendingQuery = pendingQuery.eq("scope_type", "council").eq("scope_id", scope);
      }
      // A scoped admin's own recent submissions, including the super admin's review note when a
      // submission was sent back for changes or rejected — previously saved but never shown
      // anywhere, so an admin had no way to see *why* their submission wasn't approved.
      const mySubmissionsQuery = isGlobalAdmin(admin)
        ? Promise.resolve({ data: [] })
        : supabase
            .from("approval_requests")
            .select("id,entity_type,entity_id,status,review_note,updated_at")
            .eq("submitted_by", admin.id)
            .order("updated_at", { ascending: false })
            .limit(10);
      const [eventsCount, peopleCount, approvalsCount, pending, mySubmissions] = await Promise.all([
        eventsQuery, peopleQuery, approvalsQuery,
        pendingQuery,
        mySubmissionsQuery,
      ]);
      return json(200, {
        counts: { events: eventsCount.count ?? 0, people: peopleCount.count ?? 0, approvals: approvalsCount.count ?? 0 },
        pending: pending.data ?? [],
        mySubmissions: mySubmissions.data ?? [],
        admin: publicAdmin(admin),
      });
    }

    if (method === "GET" && path === "/api/admin/events") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const url = new URL(req.url, "http://localhost");
      const after = url.searchParams.get("after") ?? "";
      const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
      let query = supabase.from("events").select("*").order("updated_at", { ascending: false }).limit(limit + 1);
      if (!isGlobalAdmin(admin)) query = query.eq("scope_type", admin.scope_type).eq("scope_id", admin.scope_id ?? "");
      if (admin.role === "editor") query = query.eq("created_by", admin.id);
      if (after) query = query.lt("updated_at", after);
      const { data, error } = await query;
      if (error) throw error;
      const rows = data ?? [];
      const hasMore = rows.length > limit;
      const events = rows.slice(0, limit);
      const nextCursor = hasMore ? events[events.length - 1]?.updated_at ?? null : null;
      type ParticipationCount = { event_id: string; member_count: number; volunteer_count: number };
      const { data: counts } = await supabase.rpc("event_participation_counts", { event_ids: events.map((e) => e.id) });
      const countsById = new Map<string, ParticipationCount>(((counts ?? []) as ParticipationCount[]).map((row) => [row.event_id, row]));
      const eventsWithCounts = events.map((event) => ({
        ...event,
        memberCount: countsById.get(event.id)?.member_count ?? 0,
        volunteerCount: countsById.get(event.id)?.volunteer_count ?? 0,
      }));
      return json(200, { events: eventsWithCounts, nextCursor });
    }

    if (method === "POST" && path === "/api/admin/events") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const body = await readJson<{ title?: string; eventDate?: string; location?: string; body?: string; category?: string; startsAt?: string; isFree?: boolean; slides?: unknown; registrationUrl?: string; capacity?: number | null; venueMapUrl?: string; eventContact?: string }>(req);
      if (!body.title?.trim()) return json(400, { error: "Event title is required" });
      const id = `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48)}-${randomUUID().slice(0, 8)}`;
      const scopeType = isGlobalAdmin(admin) ? "global" : admin.scope_type;
      const scopeId = isGlobalAdmin(admin) ? null : admin.scope_id;
      const { data, error } = await supabase.from("events").insert({
        id, title: body.title.trim(), event_date: body.eventDate ?? "", location: body.location ?? "", body: body.body ?? "",
        category: body.category ?? "Community", starts_at: body.startsAt || null, is_free: body.isFree !== false,
        slides: body.slides ?? [],
        registration_url: body.registrationUrl ?? "", capacity: body.capacity ?? null, venue_map_url: body.venueMapUrl ?? "", event_contact: body.eventContact ?? "",
        emirate: scopeType === "chapter" ? scopeId : "uae", scope_type: scopeType, scope_id: scopeId,
        workflow_status: isGlobalAdmin(admin) ? "published" : "draft", published: isGlobalAdmin(admin), created_by: admin.id,
      }).select("*").single();
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "event.create", entity_type: "event", entity_id: id, new_value: data });
      return json(200, { event: data });
    }

    const adminEvent = path.match(/^\/api\/admin\/events\/([^/]+)$/);
    if (method === "PUT" && adminEvent) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const id = decodeURIComponent(adminEvent[1]);
      const { data: current } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
      if (!current) return json(404, { error: "Event not found" });
      if (!eventInScope(admin, current)) return json(403, { error: "This event is outside your assigned scope" });
      const body = await readJson<{ title?: string; eventDate?: string; location?: string; body?: string; category?: string; startsAt?: string; isFree?: boolean; slides?: unknown; registrationUrl?: string; capacity?: number | null; venueMapUrl?: string; eventContact?: string }>(req);
      const update = {
        title: body.title?.trim() || current.title, event_date: body.eventDate ?? current.event_date, location: body.location ?? current.location, body: body.body ?? current.body, category: body.category ?? current.category, starts_at: body.startsAt || null, is_free: body.isFree ?? current.is_free, slides: body.slides ?? current.slides,
        registration_url: body.registrationUrl ?? current.registration_url, capacity: body.capacity !== undefined ? body.capacity : current.capacity, venue_map_url: body.venueMapUrl ?? current.venue_map_url, event_contact: body.eventContact ?? current.event_contact,
        updated_at: new Date().toISOString(), workflow_status: isGlobalAdmin(admin) ? current.workflow_status : "draft", published: isGlobalAdmin(admin) ? current.published : false,
      };
      const { data, error } = await supabase.from("events").update(update).eq("id", id).select("*").single();
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "event.update", entity_type: "event", entity_id: id, old_value: current, new_value: data });
      return json(200, { event: data });
    }

    const submitEvent = path.match(/^\/api\/admin\/events\/([^/]+)\/submit$/);
    if (method === "POST" && submitEvent) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const id = decodeURIComponent(submitEvent[1]);
      const { data: event } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
      if (!event) return json(404, { error: "Event not found" });
      if (!eventInScope(admin, event)) return json(403, { error: "This event is outside your assigned scope" });
      if (isGlobalAdmin(admin)) return json(400, { error: "Global administrators publish directly" });
      await supabase.from("events").update({ workflow_status: "submitted", published: false, updated_at: new Date().toISOString() }).eq("id", id);
      const { error } = await supabase.from("approval_requests").upsert({ entity_type: "event", entity_id: id, scope_type: admin.scope_type, scope_id: admin.scope_id, status: "submitted", submitted_by: admin.id, reviewed_by: null, review_note: "", updated_at: new Date().toISOString() }, { onConflict: "entity_type,entity_id" });
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "event.submit", entity_type: "event", entity_id: id });
      return json(200, { ok: true });
    }

    // Activities & Initiatives: recurring programmes/campaigns distinct from one-off Events — same
    // scoping/approval rules as events (eventInScope works unchanged since the shape matches), just
    // without RSVP/capacity/volunteer duty.
    if (method === "GET" && path === "/api/admin/activities") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      let query = supabase.from("activities").select("*").order("start_date", { ascending: false });
      if (!isGlobalAdmin(admin)) query = query.eq("scope_type", admin.scope_type).eq("scope_id", admin.scope_id ?? "");
      if (admin.role === "editor") query = query.eq("created_by", admin.id);
      const { data, error } = await query;
      if (error) throw error;
      return json(200, { activities: data ?? [] });
    }

    if (method === "POST" && path === "/api/admin/activities") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const body = await readJson<{ title?: string; summary?: string; body?: string; image?: string; startDate?: string | null; endDate?: string | null; featuredOnHomepage?: boolean }>(req);
      if (!body.title?.trim()) return json(400, { error: "Activity title is required" });
      const scopeType = isGlobalAdmin(admin) ? "global" : admin.scope_type;
      const scopeId = isGlobalAdmin(admin) ? null : admin.scope_id;
      const { data, error } = await supabase
        .from("activities")
        .insert({
          title: body.title.trim(), summary: body.summary ?? "", body: body.body ?? "", image: body.image ?? "",
          start_date: body.startDate || null, end_date: body.endDate || null, featured_on_homepage: body.featuredOnHomepage ?? false,
          scope_type: scopeType, scope_id: scopeId,
          workflow_status: isGlobalAdmin(admin) ? "published" : "draft", created_by: admin.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "activity.create", entity_type: "activity", entity_id: data.id });
      return json(200, { ok: true, id: data.id });
    }

    const adminActivity = path.match(/^\/api\/admin\/activities\/([^/]+)$/);
    if (method === "PUT" && adminActivity) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const id = decodeURIComponent(adminActivity[1]);
      const { data: current } = await supabase.from("activities").select("*").eq("id", id).maybeSingle();
      if (!current) return json(404, { error: "Activity not found" });
      if (!eventInScope(admin, current)) return json(403, { error: "This activity is outside your assigned scope" });
      const body = await readJson<{ title?: string; summary?: string; body?: string; image?: string; startDate?: string | null; endDate?: string | null; featuredOnHomepage?: boolean }>(req);
      const update = {
        title: body.title?.trim() || current.title, summary: body.summary ?? current.summary, body: body.body ?? current.body, image: body.image ?? current.image,
        start_date: body.startDate !== undefined ? body.startDate || null : current.start_date, end_date: body.endDate !== undefined ? body.endDate || null : current.end_date,
        featured_on_homepage: body.featuredOnHomepage ?? current.featured_on_homepage,
        updated_at: new Date().toISOString(), workflow_status: isGlobalAdmin(admin) ? current.workflow_status : "draft",
      };
      const { error } = await supabase.from("activities").update(update).eq("id", id);
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "activity.update", entity_type: "activity", entity_id: id });
      return json(200, { ok: true });
    }

    if (method === "DELETE" && adminActivity) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const id = decodeURIComponent(adminActivity[1]);
      const { data: current } = await supabase.from("activities").select("scope_type, scope_id, created_by").eq("id", id).maybeSingle();
      if (!current) return json(404, { error: "Activity not found" });
      if (!eventInScope(admin, current)) return json(403, { error: "This activity is outside your assigned scope" });
      const { error } = await supabase.from("activities").delete().eq("id", id);
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "activity.delete", entity_type: "activity", entity_id: id });
      return json(200, { ok: true });
    }

    const submitActivity = path.match(/^\/api\/admin\/activities\/([^/]+)\/submit$/);
    if (method === "POST" && submitActivity) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const id = decodeURIComponent(submitActivity[1]);
      const { data: activity } = await supabase.from("activities").select("*").eq("id", id).maybeSingle();
      if (!activity) return json(404, { error: "Activity not found" });
      if (!eventInScope(admin, activity)) return json(403, { error: "This activity is outside your assigned scope" });
      if (isGlobalAdmin(admin)) return json(400, { error: "Global administrators publish directly" });
      await supabase.from("activities").update({ workflow_status: "submitted", updated_at: new Date().toISOString() }).eq("id", id);
      const { error } = await supabase.from("approval_requests").upsert(
        { entity_type: "activity", entity_id: id, scope_type: admin.scope_type, scope_id: admin.scope_id, status: "submitted", submitted_by: admin.id, reviewed_by: null, review_note: "", updated_at: new Date().toISOString() },
        { onConflict: "entity_type,entity_id" },
      );
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "activity.submit", entity_type: "activity", entity_id: id });
      return json(200, { ok: true });
    }

    if (method === "GET" && path === "/api/activities") {
      const url = new URL(req.url, "http://localhost");
      const homepageOnly = url.searchParams.get("homepage") === "1";
      let query = supabase.from("activities").select("*").eq("workflow_status", "published").order("start_date", { ascending: false });
      if (homepageOnly) query = query.eq("featured_on_homepage", true);
      const { data, error } = await query;
      if (error) throw error;
      return json(200, { activities: data ?? [] }, undefined, PUBLIC_CACHE_HEADERS);
    }

    const approvalDecision = path.match(/^\/api\/admin\/approvals\/([^/]+)\/decision$/);
    if (method === "POST" && approvalDecision) {
      const admin = await adminFromRequest(req);
      if (!admin || admin.role !== "super_admin") return json(403, { error: "Super-admin access required" });
      const body = await readJson<{ decision?: "approved" | "rejected" | "changes_requested"; note?: string }>(req);
      if (!body.decision || !["approved", "rejected", "changes_requested"].includes(body.decision)) return json(400, { error: "A valid decision is required" });
      const requestId = decodeURIComponent(approvalDecision[1]);
      const { data: approval } = await supabase.from("approval_requests").select("*").eq("id", requestId).maybeSingle();
      if (!approval) return json(404, { error: "Approval request not found" });
      await supabase.from("approval_requests").update({ status: body.decision, reviewed_by: admin.id, review_note: body.note ?? "", updated_at: new Date().toISOString() }).eq("id", requestId);
      if (approval.entity_type === "event") {
        await supabase.from("events").update({ workflow_status: body.decision === "approved" ? "published" : body.decision, published: body.decision === "approved", updated_at: new Date().toISOString() }).eq("id", approval.entity_id);
      } else if (approval.entity_type === "tenant_content") {
        await supabase
          .from("tenant_content")
          .update({ workflow_status: body.decision === "approved" ? "published" : body.decision, updated_at: new Date().toISOString() })
          .eq("scope_type", approval.scope_type)
          .eq("scope_id", approval.scope_id);
      } else if (approval.entity_type === "page_section") {
        await supabase.from("page_sections").update({ workflow_status: body.decision === "approved" ? "published" : body.decision, updated_at: new Date().toISOString() }).eq("id", approval.entity_id);
      } else if (approval.entity_type === "activity") {
        await supabase.from("activities").update({ workflow_status: body.decision === "approved" ? "published" : body.decision, updated_at: new Date().toISOString() }).eq("id", approval.entity_id);
      } else if (approval.entity_type === "appointment") {
        await supabase.from("appointments").update({ workflow_status: body.decision === "approved" ? "published" : body.decision, updated_at: new Date().toISOString() }).eq("id", approval.entity_id);
      }
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: `approval.${body.decision}`, entity_type: approval.entity_type, entity_id: approval.entity_id, new_value: { note: body.note ?? "" } });
      return json(200, { ok: true });
    }

    // Every create/update/delete/approval/login across the app writes here, but nothing ever read
    // it back — a super admin had no way to see who did what. Cursor-paginated by id (monotonic,
    // collision-free, unlike paginating by created_at where two rows can share a timestamp).
    if (method === "GET" && path === "/api/admin/audit-logs") {
      const admin = await adminFromRequest(req);
      if (!admin || admin.role !== "super_admin") return json(403, { error: "Super-admin access required" });
      const url = new URL(req.url, "http://localhost");
      const after = url.searchParams.get("after") ?? "";
      const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
      let query = supabase
        .from("audit_logs")
        .select("id, action, entity_type, entity_id, created_at, admin_users(display_name, email)")
        .order("id", { ascending: false })
        .limit(limit + 1);
      if (after) query = query.lt("id", after);
      const { data, error } = await query;
      if (error) throw error;
      const rows = data ?? [];
      const hasMore = rows.length > limit;
      const page = rows.slice(0, limit);
      const logs = page.map((row) => {
        const actor = row.admin_users as { display_name?: string; email?: string } | null;
        return {
          id: row.id as number,
          action: row.action as string,
          entityType: row.entity_type as string,
          entityId: row.entity_id as string,
          createdAt: row.created_at as string,
          actorName: actor?.display_name ?? null,
          actorEmail: actor?.email ?? null,
        };
      });
      const nextCursor = hasMore ? String(page[page.length - 1]?.id ?? "") : null;
      return json(200, { logs, nextCursor });
    }

    if (method === "GET" && path === "/api/admin/tenant-content") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const url = new URL(req.url, "http://localhost");
      const scopeType = isGlobalAdmin(admin) ? (url.searchParams.get("scopeType") ?? "") : admin.scope_type;
      const scopeId = isGlobalAdmin(admin) ? (url.searchParams.get("scopeId") ?? "") : (admin.scope_id ?? "");
      if (scopeType !== "chapter" && scopeType !== "council") return json(400, { error: "A chapter or council scope is required" });
      if (!scopeId) return json(400, { error: "A scope id is required" });
      const { data } = await supabase.from("tenant_content").select("*").eq("scope_type", scopeType).eq("scope_id", scopeId).maybeSingle();
      return json(200, {
        content: data ?? { scope_type: scopeType, scope_id: scopeId, workflow_status: "draft", tagline: "", intro: "", highlights: [], hero_image: "", gallery: [] },
      });
    }

    if (method === "PUT" && path === "/api/admin/tenant-content") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const body = await readJson<{ scopeType?: string; scopeId?: string; tagline?: string; intro?: string; highlights?: unknown; heroImage?: string; gallery?: unknown }>(req);
      const scopeType = isGlobalAdmin(admin) ? body.scopeType : admin.scope_type;
      const scopeId = isGlobalAdmin(admin) ? body.scopeId : admin.scope_id;
      if (scopeType !== "chapter" && scopeType !== "council") return json(400, { error: "A chapter or council scope is required" });
      if (!scopeId) return json(400, { error: "A scope id is required" });
      // Non-global admins may only ever touch their own assigned scope; a global admin (who has
      // no scope of their own) may touch any chapter/council via the scopeType/scopeId body fields.
      if (!isGlobalAdmin(admin) && (admin.scope_type !== scopeType || admin.scope_id !== scopeId)) {
        return json(403, { error: "This page is outside your assigned scope" });
      }
      const { data: current } = await supabase.from("tenant_content").select("*").eq("scope_type", scopeType).eq("scope_id", scopeId).maybeSingle();
      const { data, error } = await supabase
        .from("tenant_content")
        .upsert(
          {
            scope_type: scopeType,
            scope_id: scopeId,
            tagline: body.tagline ?? current?.tagline ?? "",
            intro: body.intro ?? current?.intro ?? "",
            highlights: body.highlights ?? current?.highlights ?? [],
            hero_image: body.heroImage ?? current?.hero_image ?? "",
            gallery: body.gallery ?? current?.gallery ?? [],
            // A non-global admin's edit always reverts to draft (even if it was previously
            // approved/published) — mirrors PUT /api/admin/events/:id exactly.
            workflow_status: isGlobalAdmin(admin) ? "published" : "draft",
            updated_by: admin.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "scope_type,scope_id" },
        )
        .select("*")
        .single();
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        actor_id: admin.id,
        action: "tenant_content.update",
        entity_type: "tenant_content",
        entity_id: `${scopeType}:${scopeId}`,
        old_value: current ?? null,
        new_value: data,
      });
      return json(200, { content: data });
    }

    if (method === "POST" && path === "/api/admin/tenant-content/submit") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      if (isGlobalAdmin(admin)) return json(400, { error: "Global administrators publish directly" });
      const scopeType = admin.scope_type;
      const scopeId = admin.scope_id;
      if ((scopeType !== "chapter" && scopeType !== "council") || !scopeId) return json(400, { error: "A chapter or council scope is required" });
      const { data: current } = await supabase.from("tenant_content").select("id").eq("scope_type", scopeType).eq("scope_id", scopeId).maybeSingle();
      if (!current) return json(404, { error: "Save your page before submitting it for approval" });
      await supabase.from("tenant_content").update({ workflow_status: "submitted", updated_at: new Date().toISOString() }).eq("scope_type", scopeType).eq("scope_id", scopeId);
      const entityId = `${scopeType}:${scopeId}`;
      const { error } = await supabase.from("approval_requests").upsert(
        { entity_type: "tenant_content", entity_id: entityId, scope_type: scopeType, scope_id: scopeId, status: "submitted", submitted_by: admin.id, reviewed_by: null, review_note: "", updated_at: new Date().toISOString() },
        { onConflict: "entity_type,entity_id" },
      );
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "tenant_content.submit", entity_type: "tenant_content", entity_id: entityId });
      return json(200, { ok: true });
    }

    if (method === "POST" && path === "/api/admin/check-in") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const checkInLimit = await rateLimit("admin-check-in", clientIp(req.headers), 60, 300);
      if (!checkInLimit.allowed) return json(429, { error: "Too many lookups. Try again shortly." });
      const body = await readJson<{ code?: string; eventId?: string; markAttended?: boolean }>(req);
      const code = body.code?.trim();
      if (!code) return json(400, { error: "Enter a membership number or mobile number" });
      // A scoped (chapter/council) admin may only look up members in the context of one of their
      // own events — without that, this route would let any admin enumerate any member's PII by
      // guessing membership numbers. A global admin can look up anyone, with or without an event.
      if (!isGlobalAdmin(admin)) {
        if (!body.eventId) return json(403, { error: "Select an event to check members in against" });
        const { data: eventRow } = await supabase.from("events").select("scope_type, scope_id, created_by").eq("id", body.eventId).maybeSingle();
        if (!eventRow || !eventInScope(admin, eventRow as { scope_type?: string; scope_id?: string | null; created_by?: string | null })) {
          return json(403, { error: "This event is outside your assigned scope" });
        }
      }
      // Same dual lookup (and legacy IPFM-/IPFY- tolerant regex) as /api/events/:id/register.
      const column = /^IPF[A-Z]?-/i.test(code) ? "membership_no" : "phone";
      const { data: person } = await supabase.from("people").select("*").eq(column, code).maybeSingle();
      if (!person) return json(404, { error: "No member found for that ID or number" });
      let registration: { registration_no: string; participation_as: string; status: string } | null = null;
      let volunteer: { status: string } | null = null;
      if (body.eventId) {
        const [registrationRes, volunteerRes] = await Promise.all([
          supabase.from("event_registrations").select("registration_no, participation_as, status").eq("event_id", body.eventId).eq("person_id", person.id).maybeSingle(),
          supabase.from("event_volunteers").select("status").eq("event_id", body.eventId).eq("person_id", person.id).maybeSingle(),
        ]);
        registration = registrationRes.data ?? null;
        volunteer = volunteerRes.data ?? null;
        if (body.markAttended) {
          await Promise.all([
            registration ? supabase.from("event_registrations").update({ status: "attended" }).eq("event_id", body.eventId).eq("person_id", person.id) : null,
            volunteer ? supabase.from("event_volunteers").update({ status: "attended" }).eq("event_id", body.eventId).eq("person_id", person.id) : null,
          ]);
          if (registration) registration = { ...registration, status: "attended" };
          if (volunteer) volunteer = { ...volunteer, status: "attended" };
        }
      }
      return json(200, {
        member: { id: person.id, membershipNo: person.membership_no, name: person.name, emirate: person.emirate, homeState: person.home_state, isVolunteer: person.is_volunteer },
        registration,
        volunteer,
      });
    }

    if (method === "GET" && path === "/api/admin/org/chapters") {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const [{ data: chapters }, { data: i18n }] = await Promise.all([
        supabase.from("chapters").select("*").order("id"),
        supabase.from("chapters_i18n").select("*"),
      ]);
      const byChapter = new Map<string, Record<string, unknown>[]>();
      for (const row of i18n ?? []) {
        const list = byChapter.get(row.chapter_id as string) ?? [];
        list.push(row);
        byChapter.set(row.chapter_id as string, list);
      }
      return json(200, {
        chapters: (chapters ?? []).map((chapter) => ({ ...chapter, translations: translationsMap(byChapter.get(chapter.id) ?? [], ["name", "description"]) })),
      });
    }

    const adminChapter = path.match(/^\/api\/admin\/org\/chapters\/([^/]+)$/);
    if ((method === "PUT" || method === "POST") && (adminChapter || path === "/api/admin/org/chapters")) {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const body = await readJson<{
        id?: string;
        emirateCode?: string;
        establishedDate?: string | null;
        contactEmail?: string;
        contactPhone?: string;
        facebookUrl?: string;
        image?: string;
        active?: boolean;
        translations?: Record<string, { name?: string; description?: string }>;
      }>(req);
      const id = adminChapter ? decodeURIComponent(adminChapter[1]) : body.id?.trim();
      if (!id) return json(400, { error: "A chapter id is required" });
      const { error } = await supabase.from("chapters").upsert({
        id,
        emirate_code: body.emirateCode ?? "",
        established_date: body.establishedDate || null,
        contact_email: body.contactEmail ?? "",
        contact_phone: body.contactPhone ?? "",
        facebook_url: body.facebookUrl ?? "",
        image: body.image ?? "",
        active: body.active !== false,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      const chapterTranslations = await autoTranslateMissingLocales(body.translations ?? {}, ["name", "description"]);
      for (const [locale, fields] of Object.entries(chapterTranslations)) {
        if (!SUPPORTED_LOCALES.includes(locale)) continue;
        await supabase.from("chapters_i18n").upsert({ chapter_id: id, locale, name: fields.name ?? "", description: fields.description ?? "" });
      }
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "org.chapter.update", entity_type: "chapter", entity_id: id });
      return json(200, { ok: true });
    }

    if (method === "GET" && path === "/api/admin/org/councils") {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const [{ data: councils }, { data: i18n }] = await Promise.all([
        supabase.from("councils").select("*").order("id"),
        supabase.from("councils_i18n").select("*"),
      ]);
      const byCouncil = new Map<string, Record<string, unknown>[]>();
      for (const row of i18n ?? []) {
        const list = byCouncil.get(row.council_id as string) ?? [];
        list.push(row);
        byCouncil.set(row.council_id as string, list);
      }
      return json(200, {
        councils: (councils ?? []).map((council) => ({ ...council, translations: translationsMap(byCouncil.get(council.id) ?? [], ["name", "description"]) })),
      });
    }

    const adminCouncil = path.match(/^\/api\/admin\/org\/councils\/([^/]+)$/);
    if ((method === "PUT" || method === "POST") && (adminCouncil || path === "/api/admin/org/councils")) {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const body = await readJson<{
        id?: string;
        kind?: string;
        region?: string;
        contactEmail?: string;
        image?: string;
        active?: boolean;
        translations?: Record<string, { name?: string; description?: string }>;
      }>(req);
      const id = adminCouncil ? decodeURIComponent(adminCouncil[1]) : body.id?.trim();
      if (!id) return json(400, { error: "A council id is required" });
      if (body.kind && !["state", "special"].includes(body.kind)) return json(400, { error: "kind must be 'state' or 'special'" });
      const { error } = await supabase.from("councils").upsert({
        id,
        kind: body.kind ?? "state",
        region: body.region ?? "",
        contact_email: body.contactEmail ?? "",
        image: body.image ?? "",
        active: body.active !== false,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      const councilTranslations = await autoTranslateMissingLocales(body.translations ?? {}, ["name", "description"]);
      for (const [locale, fields] of Object.entries(councilTranslations)) {
        if (!SUPPORTED_LOCALES.includes(locale)) continue;
        await supabase.from("councils_i18n").upsert({ council_id: id, locale, name: fields.name ?? "", description: fields.description ?? "" });
      }
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "org.council.update", entity_type: "council", entity_id: id });
      return json(200, { ok: true });
    }

    if (method === "GET" && path === "/api/admin/org/positions") {
      const admin = await adminFromRequest(req);
      // Any signed-in admin can read the position list (a chapter/council admin needs it to pick a
      // role when adding their own committee member) — only creating/editing a position definition
      // itself is global-admin-only, enforced below.
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const [{ data: positions }, { data: i18n }] = await Promise.all([
        supabase.from("positions").select("*").order("display_order"),
        supabase.from("positions_i18n").select("*"),
      ]);
      const byPosition = new Map<string, Record<string, unknown>[]>();
      for (const row of i18n ?? []) {
        const list = byPosition.get(row.position_id as string) ?? [];
        list.push(row);
        byPosition.set(row.position_id as string, list);
      }
      return json(200, {
        positions: (positions ?? []).map((position) => ({ ...position, translations: translationsMap(byPosition.get(position.id) ?? [], ["title"]) })),
      });
    }

    const adminPosition = path.match(/^\/api\/admin\/org\/positions\/([^/]+)$/);
    if ((method === "PUT" || method === "POST") && (adminPosition || path === "/api/admin/org/positions")) {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const body = await readJson<{ slug?: string; level?: string; displayOrder?: number; translations?: Record<string, { title?: string }> }>(req);
      if (!body.level || !["central", "chapter", "council"].includes(body.level)) return json(400, { error: "A valid level is required" });
      let positionId = adminPosition ? decodeURIComponent(adminPosition[1]) : undefined;
      if (positionId) {
        const { error } = await supabase
          .from("positions")
          .update({ level: body.level, display_order: body.displayOrder ?? 0, slug: body.slug })
          .eq("id", positionId);
        if (error) throw error;
      } else {
        if (!body.slug?.trim()) return json(400, { error: "A slug is required" });
        const { data, error } = await supabase.from("positions").insert({ slug: body.slug.trim(), level: body.level, display_order: body.displayOrder ?? 0 }).select("id").single();
        if (error) throw error;
        positionId = data.id;
      }
      const positionTranslations = await autoTranslateMissingLocales(body.translations ?? {}, ["title"]);
      for (const [locale, fields] of Object.entries(positionTranslations)) {
        if (!SUPPORTED_LOCALES.includes(locale)) continue;
        await supabase.from("positions_i18n").upsert({ position_id: positionId, locale, title: fields.title ?? "" });
      }
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "org.position.update", entity_type: "position", entity_id: positionId ?? "" });
      return json(200, { ok: true, id: positionId });
    }

    // A chapter/council admin manages committee members for their own scope only; a global admin
    // manages any scope. Mirrors eventInScope()'s pattern but appointments have no created_by, so
    // there's no further per-editor restriction to apply.
    function appointmentInScope(admin: AdminRow, appointment: { scope_type: string; scope_id: string | null }) {
      if (isGlobalAdmin(admin)) return true;
      return appointment.scope_type === admin.scope_type && appointment.scope_id === admin.scope_id;
    }

    if (method === "GET" && path === "/api/admin/org/appointments") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const url = new URL(req.url, "http://localhost");
      const scopeType = url.searchParams.get("scopeType") ?? "";
      let query = supabase.from("appointments").select("*, positions(slug, level)").order("display_order");
      if (isGlobalAdmin(admin)) {
        if (scopeType) query = query.eq("scope_type", scopeType);
      } else {
        // Non-global admins only ever see their own chapter/council's committee, regardless of
        // what scopeType/scopeId query params are passed.
        query = query.eq("scope_type", admin.scope_type).eq("scope_id", admin.scope_id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return json(200, { appointments: data ?? [] });
    }

    const adminAppointment = path.match(/^\/api\/admin\/org\/appointments\/([^/]+)$/);
    if (method === "POST" && path === "/api/admin/org/appointments") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const body = await readJson<{
        personId?: string | null;
        personName?: string;
        personImage?: string;
        positionId?: string;
        scopeType?: string;
        scopeId?: string | null;
        startedAt?: string | null;
        displayOrder?: number;
        bio?: string;
        contactPhone?: string;
        contactEmail?: string;
        socialLinks?: unknown;
        showContact?: boolean;
        membershipNo?: string;
      }>(req);
      if (!body.positionId) return json(400, { error: "A position is required" });
      if (!body.personName?.trim() && !body.personId) return json(400, { error: "A person name or linked member is required" });
      if (!body.scopeType || !["global", "chapter", "council"].includes(body.scopeType)) return json(400, { error: "A valid scope is required" });
      const scopeId = body.scopeType === "global" ? null : body.scopeId ?? null;
      if (!appointmentInScope(admin, { scope_type: body.scopeType, scope_id: scopeId })) {
        return json(403, { error: "You can only add committee members to your own chapter or council" });
      }
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          person_id: body.personId || null,
          person_name: body.personName?.trim() ?? "",
          person_image: body.personImage ?? "",
          position_id: body.positionId,
          scope_type: body.scopeType,
          scope_id: scopeId,
          started_at: body.startedAt || new Date().toISOString().slice(0, 10),
          display_order: body.displayOrder ?? 0,
          bio: body.bio ?? "",
          contact_phone: body.contactPhone ?? "",
          contact_email: body.contactEmail ?? "",
          social_links: body.socialLinks ?? [],
          show_contact: body.showContact ?? false,
          membership_no: body.membershipNo ?? "",
          // A global admin's committee changes go live instantly (same as every other content
          // type); a chapter/council admin's go to draft and need central approval before they're
          // visible on the public site.
          workflow_status: isGlobalAdmin(admin) ? "published" : "draft",
        })
        .select("id")
        .single();
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "org.appointment.create", entity_type: "appointment", entity_id: data.id });
      return json(200, { ok: true, id: data.id });
    }

    if (method === "PUT" && adminAppointment) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const id = decodeURIComponent(adminAppointment[1]);
      const { data: existing } = await supabase.from("appointments").select("scope_type, scope_id").eq("id", id).maybeSingle();
      if (!existing) return json(404, { error: "Appointment not found" });
      if (!appointmentInScope(admin, existing as { scope_type: string; scope_id: string | null })) {
        return json(403, { error: "You can only edit committee members in your own chapter or council" });
      }
      const body = await readJson<{
        personName?: string;
        personImage?: string;
        positionId?: string;
        displayOrder?: number;
        status?: string;
        bio?: string;
        contactPhone?: string;
        contactEmail?: string;
        socialLinks?: unknown;
        showContact?: boolean;
        membershipNo?: string;
      }>(req);
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.personName !== undefined) update.person_name = body.personName;
      if (body.personImage !== undefined) update.person_image = body.personImage;
      if (body.positionId !== undefined) update.position_id = body.positionId;
      if (body.displayOrder !== undefined) update.display_order = body.displayOrder;
      if (body.bio !== undefined) update.bio = body.bio;
      if (body.contactPhone !== undefined) update.contact_phone = body.contactPhone;
      if (body.contactEmail !== undefined) update.contact_email = body.contactEmail;
      if (body.socialLinks !== undefined) update.social_links = body.socialLinks;
      if (body.showContact !== undefined) update.show_contact = body.showContact;
      if (body.membershipNo !== undefined) update.membership_no = body.membershipNo;
      if (body.status === "completed") {
        update.status = "completed";
        update.ended_at = new Date().toISOString().slice(0, 10);
      } else if (body.status === "active") {
        update.status = "active";
        update.ended_at = null;
      }
      // A non-global admin's edit always reverts to draft (even if it was previously
      // approved/published) — mirrors tenant_content's/page_sections' PUT exactly.
      update.workflow_status = isGlobalAdmin(admin) ? "published" : "draft";
      const { error } = await supabase.from("appointments").update(update).eq("id", id);
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "org.appointment.update", entity_type: "appointment", entity_id: id });
      return json(200, { ok: true });
    }

    const submitAppointment = path.match(/^\/api\/admin\/org\/appointments\/([^/]+)\/submit$/);
    if (method === "POST" && submitAppointment) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      if (isGlobalAdmin(admin)) return json(400, { error: "Global administrators publish directly" });
      const id = decodeURIComponent(submitAppointment[1]);
      const { data: appointment } = await supabase.from("appointments").select("scope_type, scope_id").eq("id", id).maybeSingle();
      if (!appointment) return json(404, { error: "Committee member not found" });
      if (!appointmentInScope(admin, appointment as { scope_type: string; scope_id: string | null })) {
        return json(403, { error: "This committee member is outside your assigned scope" });
      }
      await supabase.from("appointments").update({ workflow_status: "submitted", updated_at: new Date().toISOString() }).eq("id", id);
      const { error } = await supabase.from("approval_requests").upsert(
        { entity_type: "appointment", entity_id: id, scope_type: admin.scope_type, scope_id: admin.scope_id, status: "submitted", submitted_by: admin.id, reviewed_by: null, review_note: "", updated_at: new Date().toISOString() },
        { onConflict: "entity_type,entity_id" },
      );
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "org.appointment.submit", entity_type: "appointment", entity_id: id });
      return json(200, { ok: true });
    }

    if (method === "DELETE" && adminAppointment) {
      // Soft-delete: an appointment is institutional history, not disposable data — ending it
      // preserves the record (status='completed') rather than removing who held the position.
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const id = decodeURIComponent(adminAppointment[1]);
      const { data: existing } = await supabase.from("appointments").select("scope_type, scope_id").eq("id", id).maybeSingle();
      if (!existing) return json(404, { error: "Appointment not found" });
      if (!appointmentInScope(admin, existing as { scope_type: string; scope_id: string | null })) {
        return json(403, { error: "You can only remove committee members in your own chapter or council" });
      }
      const { error } = await supabase.from("appointments").update({ status: "completed", ended_at: new Date().toISOString().slice(0, 10) }).eq("id", id);
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "org.appointment.end", entity_type: "appointment", entity_id: id });
      return json(200, { ok: true });
    }

    // Generic, i18n-aware content blocks for every informational page (About, History, Governance,
    // etc.) — the relational generalisation of the old single-blob site_content.extras. Page
    // sections are central content: only a global admin or an editor (their own drafts only,
    // mirroring eventInScope's created_by restriction) may touch them — no chapter/council scope
    // applies here, unlike tenant_content.
    function pageSectionEditable(admin: AdminRow, section: { updated_by: string | null }) {
      if (isGlobalAdmin(admin)) return true;
      return admin.role === "editor" && section.updated_by === admin.id;
    }

    const adminPageSections = path.match(/^\/api\/admin\/pages\/([^/]+)\/sections$/);
    if (method === "GET" && adminPageSections) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      // Page content is central-only: a chapter/council admin has no business here at all (unlike
      // tenant_content, which is their own scope). Only a global admin, or an editor restricted to
      // sections they themselves authored, may read this.
      if (!isGlobalAdmin(admin) && admin.role !== "editor") return json(403, { error: "You don't have permission to view page content" });
      const pageId = decodeURIComponent(adminPageSections[1]);
      const [{ data: sections }, { data: i18n }] = await Promise.all([
        supabase.from("page_sections").select("*").eq("page_id", pageId).order("position"),
        supabase.from("page_sections_i18n").select("*"),
      ]);
      const bySection = new Map<string, Record<string, unknown>[]>();
      for (const row of i18n ?? []) {
        const list = bySection.get(row.section_id as string) ?? [];
        list.push(row);
        bySection.set(row.section_id as string, list);
      }
      const visible = (sections ?? []).filter((section) => isGlobalAdmin(admin) || section.updated_by === admin.id);
      return json(200, {
        sections: visible.map((section) => ({ ...section, translations: translationsMap(bySection.get(section.id) ?? [], ["eyebrow", "title", "description", "body"]) })),
      });
    }

    if (method === "POST" && adminPageSections) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      if (!isGlobalAdmin(admin) && admin.role !== "editor") return json(403, { error: "You don't have permission to edit page content" });
      const pageId = decodeURIComponent(adminPageSections[1]);
      const body = await readJson<{
        type?: string;
        position?: number;
        image?: string;
        slides?: unknown;
        buttons?: unknown;
        stats?: unknown;
        startsAt?: string | null;
        endsAt?: string | null;
        priority?: number;
        translations?: Record<string, { eyebrow?: string; title?: string; description?: string; body?: string }>;
      }>(req);
      if (!body.type || !["richText", "photoGrid", "carousel", "cta", "statList", "imageText"].includes(body.type)) {
        return json(400, { error: "A valid section type is required" });
      }
      const { data, error } = await supabase
        .from("page_sections")
        .insert({
          page_id: pageId,
          type: body.type,
          position: body.position ?? 0,
          image: body.image ?? "",
          slides: body.slides ?? [],
          buttons: body.buttons ?? [],
          stats: body.stats ?? [],
          starts_at: body.startsAt || null,
          ends_at: body.endsAt || null,
          priority: body.priority ?? 0,
          workflow_status: isGlobalAdmin(admin) ? "published" : "draft",
          updated_by: admin.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      const sectionTranslations = await autoTranslateMissingLocales(body.translations ?? {}, ["eyebrow", "title", "description", "body"]);
      for (const [locale, fields] of Object.entries(sectionTranslations)) {
        if (!SUPPORTED_LOCALES.includes(locale)) continue;
        await supabase.from("page_sections_i18n").upsert({
          section_id: data.id,
          locale,
          eyebrow: fields.eyebrow ?? "",
          title: fields.title ?? "",
          description: fields.description ?? "",
          body: fields.body ?? "",
        });
      }
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "page_section.create", entity_type: "page_section", entity_id: data.id });
      return json(200, { ok: true, id: data.id });
    }

    const adminPageSectionOne = path.match(/^\/api\/admin\/pages\/[^/]+\/sections\/([^/]+)$/);
    if (method === "PUT" && adminPageSectionOne) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const id = decodeURIComponent(adminPageSectionOne[1]);
      const { data: existing } = await supabase.from("page_sections").select("updated_by").eq("id", id).maybeSingle();
      if (!existing) return json(404, { error: "Section not found" });
      if (!pageSectionEditable(admin, existing as { updated_by: string | null })) {
        return json(403, { error: "You can only edit your own draft sections" });
      }
      const body = await readJson<{
        position?: number;
        image?: string;
        slides?: unknown;
        buttons?: unknown;
        stats?: unknown;
        startsAt?: string | null;
        endsAt?: string | null;
        priority?: number;
        translations?: Record<string, { eyebrow?: string; title?: string; description?: string; body?: string }>;
      }>(req);
      const update: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: admin.id };
      if (body.position !== undefined) update.position = body.position;
      if (body.image !== undefined) update.image = body.image;
      if (body.slides !== undefined) update.slides = body.slides;
      if (body.buttons !== undefined) update.buttons = body.buttons;
      if (body.stats !== undefined) update.stats = body.stats;
      if (body.startsAt !== undefined) update.starts_at = body.startsAt || null;
      if (body.endsAt !== undefined) update.ends_at = body.endsAt || null;
      if (body.priority !== undefined) update.priority = body.priority;
      // A non-global admin's edit always reverts to draft (even if it was previously
      // approved/published) — mirrors tenant_content's PUT exactly.
      update.workflow_status = isGlobalAdmin(admin) ? "published" : "draft";
      const { error } = await supabase.from("page_sections").update(update).eq("id", id);
      if (error) throw error;
      const sectionUpdateTranslations = await autoTranslateMissingLocales(body.translations ?? {}, ["eyebrow", "title", "description", "body"]);
      for (const [locale, fields] of Object.entries(sectionUpdateTranslations)) {
        if (!SUPPORTED_LOCALES.includes(locale)) continue;
        await supabase.from("page_sections_i18n").upsert({
          section_id: id,
          locale,
          eyebrow: fields.eyebrow ?? "",
          title: fields.title ?? "",
          description: fields.description ?? "",
          body: fields.body ?? "",
        });
      }
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "page_section.update", entity_type: "page_section", entity_id: id });
      return json(200, { ok: true });
    }

    if (method === "DELETE" && adminPageSectionOne) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const id = decodeURIComponent(adminPageSectionOne[1]);
      const { data: existing } = await supabase.from("page_sections").select("updated_by").eq("id", id).maybeSingle();
      if (!existing) return json(404, { error: "Section not found" });
      if (!pageSectionEditable(admin, existing as { updated_by: string | null })) {
        return json(403, { error: "You can only remove your own draft sections" });
      }
      const { error } = await supabase.from("page_sections").delete().eq("id", id);
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "page_section.delete", entity_type: "page_section", entity_id: id });
      return json(200, { ok: true });
    }

    const adminPageSectionSubmit = path.match(/^\/api\/admin\/pages\/[^/]+\/sections\/([^/]+)\/submit$/);
    if (method === "POST" && adminPageSectionSubmit) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      if (isGlobalAdmin(admin)) return json(400, { error: "Global administrators publish directly" });
      const id = decodeURIComponent(adminPageSectionSubmit[1]);
      const { data: existing } = await supabase.from("page_sections").select("updated_by").eq("id", id).maybeSingle();
      if (!existing) return json(404, { error: "Section not found" });
      if (!pageSectionEditable(admin, existing as { updated_by: string | null })) {
        return json(403, { error: "You can only submit your own draft sections" });
      }
      await supabase.from("page_sections").update({ workflow_status: "submitted" }).eq("id", id);
      const { error } = await supabase.from("approval_requests").upsert(
        { entity_type: "page_section", entity_id: id, scope_type: "global", scope_id: null, status: "submitted", submitted_by: admin.id, reviewed_by: null, review_note: "", updated_at: new Date().toISOString() },
        { onConflict: "entity_type,entity_id" },
      );
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "page_section.submit", entity_type: "page_section", entity_id: id });
      return json(200, { ok: true });
    }

    const publicPageSections = path.match(/^\/api\/pages\/([^/]+)\/sections$/);
    if (method === "GET" && publicPageSections) {
      const pageId = decodeURIComponent(publicPageSections[1]);
      const locale = normalizeLocale(new URL(req.url, "http://localhost").searchParams.get("locale"));
      const [{ data: sections }, { data: i18n }] = await Promise.all([
        supabase.from("page_sections").select("*").eq("page_id", pageId).eq("workflow_status", "published").order("position"),
        supabase.from("page_sections_i18n").select("*"),
      ]);
      const bySection = new Map<string, Record<string, unknown>[]>();
      for (const row of i18n ?? []) {
        const list = bySection.get(row.section_id as string) ?? [];
        list.push(row);
        bySection.set(row.section_id as string, list);
      }
      const now = Date.now();
      // A scheduled section (starts_at/ends_at set — typically a homepage announcement/banner)
      // only shows inside its window; most sections have neither set and always show.
      const visible = (sections ?? []).filter((section) => {
        if (section.starts_at && new Date(section.starts_at as string).getTime() > now) return false;
        if (section.ends_at && new Date(section.ends_at as string).getTime() < now) return false;
        return true;
      });
      visible.sort((a, b) => (b.priority as number) - (a.priority as number) || (a.position as number) - (b.position as number));
      const result = visible.map((section) => ({
        id: section.id,
        type: section.type,
        image: section.image,
        slides: section.slides,
        buttons: section.buttons,
        stats: section.stats,
        ...pickLocale(bySection.get(section.id) ?? [], locale, ["eyebrow", "title", "description", "body"]),
      }));
      return json(200, { sections: result }, undefined, PUBLIC_CACHE_HEADERS);
    }

    // Sponsors are a central relationship (organisation-level sponsors plus per-event linkage),
    // not chapter/council-scoped — global-admin managed, same as chapters/councils/positions.
    if (method === "GET" && path === "/api/admin/sponsors") {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const { data, error } = await supabase.from("sponsors").select("*").order("display_order");
      if (error) throw error;
      return json(200, { sponsors: data ?? [] });
    }

    const adminSponsor = path.match(/^\/api\/admin\/sponsors\/([^/]+)$/);
    if ((method === "PUT" || method === "POST") && (adminSponsor || path === "/api/admin/sponsors")) {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const body = await readJson<{
        name?: string;
        logo?: string;
        website?: string;
        tier?: string;
        contactPerson?: string;
        contactPhone?: string;
        contactEmail?: string;
        description?: string;
        active?: boolean;
        displayOrder?: number;
      }>(req);
      if (!body.name?.trim()) return json(400, { error: "A sponsor name is required" });
      const payload = {
        name: body.name.trim(),
        logo: body.logo ?? "",
        website: body.website ?? "",
        tier: body.tier ?? "",
        contact_person: body.contactPerson ?? "",
        contact_phone: body.contactPhone ?? "",
        contact_email: body.contactEmail ?? "",
        description: body.description ?? "",
        active: body.active !== false,
        display_order: body.displayOrder ?? 0,
        updated_at: new Date().toISOString(),
      };
      const sponsorId = adminSponsor ? decodeURIComponent(adminSponsor[1]) : undefined;
      const { data, error } = sponsorId
        ? await supabase.from("sponsors").update(payload).eq("id", sponsorId).select("id").single()
        : await supabase.from("sponsors").insert(payload).select("id").single();
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: sponsorId ? "sponsor.update" : "sponsor.create", entity_type: "sponsor", entity_id: data.id });
      return json(200, { ok: true, id: data.id });
    }

    if (method === "DELETE" && adminSponsor) {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const id = decodeURIComponent(adminSponsor[1]);
      const { error } = await supabase.from("sponsors").delete().eq("id", id);
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "sponsor.delete", entity_type: "sponsor", entity_id: id });
      return json(200, { ok: true });
    }

    const adminEventSponsors = path.match(/^\/api\/admin\/events\/([^/]+)\/sponsors$/);
    if (method === "GET" && adminEventSponsors) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const eventId = decodeURIComponent(adminEventSponsors[1]);
      const { data, error } = await supabase.from("event_sponsors").select("sponsor_id, sponsors(*)").eq("event_id", eventId);
      if (error) throw error;
      return json(200, { sponsors: (data ?? []).map((row) => row.sponsors) });
    }

    if (method === "PUT" && adminEventSponsors) {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const eventId = decodeURIComponent(adminEventSponsors[1]);
      const { data: eventRow } = await supabase.from("events").select("scope_type, scope_id, created_by").eq("id", eventId).maybeSingle();
      if (!eventRow) return json(404, { error: "Event not found" });
      if (!eventInScope(admin, eventRow as { scope_type?: string; scope_id?: string | null; created_by?: string | null })) {
        return json(403, { error: "This event is outside your assigned scope" });
      }
      const body = await readJson<{ sponsorIds?: string[] }>(req);
      const sponsorIds = Array.isArray(body.sponsorIds) ? body.sponsorIds : [];
      await supabase.from("event_sponsors").delete().eq("event_id", eventId);
      if (sponsorIds.length > 0) {
        const { error } = await supabase.from("event_sponsors").insert(sponsorIds.map((sponsorId) => ({ event_id: eventId, sponsor_id: sponsorId })));
        if (error) throw error;
      }
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "event.sponsors.update", entity_type: "event", entity_id: eventId });
      return json(200, { ok: true });
    }

    if (method === "GET" && path === "/api/sponsors") {
      const { data, error } = await supabase.from("sponsors").select("*").eq("active", true).order("display_order");
      if (error) throw error;
      return json(200, { sponsors: data ?? [] }, undefined, PUBLIC_CACHE_HEADERS);
    }

    const publicEventSponsors = path.match(/^\/api\/events\/([^/]+)\/sponsors$/);
    if (method === "GET" && publicEventSponsors) {
      const eventId = decodeURIComponent(publicEventSponsors[1]);
      const { data, error } = await supabase.from("event_sponsors").select("sponsors(*)").eq("event_id", eventId);
      if (error) throw error;
      const rows = (data ?? []) as unknown as { sponsors: Record<string, unknown> | null }[];
      const sponsors = rows.map((row) => row.sponsors).filter((sponsor): sponsor is Record<string, unknown> => Boolean(sponsor?.active));
      return json(200, { sponsors }, undefined, PUBLIC_CACHE_HEADERS);
    }

    // Publications (Drishti e-Magazine and any future publication type) — central content, same
    // global-admin-managed pattern as sponsors/chapters/positions.
    if (method === "GET" && path === "/api/admin/publications") {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const { data, error } = await supabase.from("publications").select("*").order("display_order");
      if (error) throw error;
      return json(200, { publications: data ?? [] });
    }

    const adminPublication = path.match(/^\/api\/admin\/publications\/([^/]+)$/);
    if ((method === "PUT" || method === "POST") && (adminPublication || path === "/api/admin/publications")) {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const body = await readJson<{
        publicationType?: string;
        title?: string;
        edition?: string;
        description?: string;
        coverImage?: string;
        fileUrl?: string;
        featuredOnHomepage?: boolean;
        displayOrder?: number;
        active?: boolean;
      }>(req);
      if (!body.title?.trim()) return json(400, { error: "A title is required" });
      const payload = {
        publication_type: body.publicationType ?? "Drishti",
        title: body.title.trim(),
        edition: body.edition ?? "",
        description: body.description ?? "",
        cover_image: body.coverImage ?? "",
        file_url: body.fileUrl ?? "",
        featured_on_homepage: body.featuredOnHomepage ?? false,
        display_order: body.displayOrder ?? 0,
        active: body.active !== false,
        updated_at: new Date().toISOString(),
      };
      const id = adminPublication ? decodeURIComponent(adminPublication[1]) : undefined;
      const { data, error } = id
        ? await supabase.from("publications").update(payload).eq("id", id).select("id").single()
        : await supabase.from("publications").insert(payload).select("id").single();
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: id ? "publication.update" : "publication.create", entity_type: "publication", entity_id: data.id });
      return json(200, { ok: true, id: data.id });
    }

    if (method === "DELETE" && adminPublication) {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const id = decodeURIComponent(adminPublication[1]);
      const { error } = await supabase.from("publications").delete().eq("id", id);
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "publication.delete", entity_type: "publication", entity_id: id });
      return json(200, { ok: true });
    }

    if (method === "GET" && path === "/api/publications") {
      const { data, error } = await supabase.from("publications").select("*").eq("active", true).order("display_order");
      if (error) throw error;
      return json(200, { publications: data ?? [] }, undefined, PUBLIC_CACHE_HEADERS);
    }

    // Site navigation hierarchy — central content, global-admin only. One flat table with
    // parent_id backs all four menus (primary/footer/mobile/utility); the public route reshapes
    // it into exactly the NavGroup[]/NavLinkItem[]/footerGroups[] shapes the frontend already used
    // when this was a hardcoded file, so Header/Footer only need to change their data source.
    if (method === "GET" && path === "/api/admin/nav-items") {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const { data, error } = await supabase.from("nav_items").select("*").order("menu").order("position");
      if (error) throw error;
      return json(200, { navItems: data ?? [] });
    }

    const adminNavItem = path.match(/^\/api\/admin\/nav-items\/([^/]+)$/);
    if ((method === "PUT" || method === "POST") && (adminNavItem || path === "/api/admin/nav-items")) {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const body = await readJson<{ menu?: string; parentId?: string | null; label?: string; toPath?: string; mega?: string | null; position?: number; active?: boolean }>(req);
      if (!body.menu || !["primary", "footer", "mobile", "utility"].includes(body.menu)) return json(400, { error: "A valid menu is required" });
      if (!body.label?.trim()) return json(400, { error: "A label is required" });
      const payload = {
        menu: body.menu,
        parent_id: body.parentId || null,
        label: body.label.trim(),
        to_path: body.toPath ?? "",
        mega: body.mega || null,
        position: body.position ?? 0,
        active: body.active !== false,
      };
      const id = adminNavItem ? decodeURIComponent(adminNavItem[1]) : undefined;
      const { data, error } = id
        ? await supabase.from("nav_items").update(payload).eq("id", id).select("id").single()
        : await supabase.from("nav_items").insert(payload).select("id").single();
      if (error) throw error;
      // The label is auto-translated into every supported language, same as every other CMS
      // content type — an admin only ever types the one label, every language stays in sync.
      const navTranslations = await autoTranslateMissingLocales({ en: { label: payload.label } }, ["label"]);
      for (const [locale, fields] of Object.entries(navTranslations)) {
        if (!SUPPORTED_LOCALES.includes(locale)) continue;
        await supabase.from("nav_items_i18n").upsert({ nav_item_id: data.id, locale, label: fields.label ?? "" });
      }
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: id ? "nav_item.update" : "nav_item.create", entity_type: "nav_item", entity_id: data.id });
      return json(200, { ok: true, id: data.id });
    }

    if (method === "DELETE" && adminNavItem) {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const id = decodeURIComponent(adminNavItem[1]);
      const { error } = await supabase.from("nav_items").delete().eq("id", id);
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "nav_item.delete", entity_type: "nav_item", entity_id: id });
      return json(200, { ok: true });
    }

    if (method === "GET" && path === "/api/nav") {
      const locale = normalizeLocale(new URL(req.url, "http://localhost").searchParams.get("locale"));
      const [{ data, error }, { data: navI18n }] = await Promise.all([
        supabase.from("nav_items").select("*").eq("active", true).order("position"),
        supabase.from("nav_items_i18n").select("*").eq("locale", locale),
      ]);
      if (error) throw error;
      const translatedLabel = new Map((navI18n ?? []).map((row) => [row.nav_item_id as string, row.label as string]));
      const rows = (data ?? []) as { id: string; menu: string; parent_id: string | null; label: string; to_path: string; mega: string | null; position: number }[];
      const byParent = new Map<string, typeof rows>();
      for (const row of rows) {
        const key = row.parent_id ?? "";
        const list = byParent.get(key) ?? [];
        list.push(row);
        byParent.set(key, list);
      }
      const labelOf = (row: { id: string; label: string }) => translatedLabel.get(row.id) || row.label;
      const topLevel = (menu: string) => (byParent.get("") ?? []).filter((row) => row.menu === menu);
      const children = (parentId: string) => (byParent.get(parentId) ?? []).map((row) => ({ label: labelOf(row), to: row.to_path }));
      const primaryNav = topLevel("primary").map((row) => ({
        label: labelOf(row),
        to: row.to_path,
        mega: row.mega ?? undefined,
        children: children(row.id).length > 0 ? children(row.id) : undefined,
      }));
      const footerGroups = topLevel("footer").map((row) => ({ title: labelOf(row), links: children(row.id) }));
      const mobileTabs = topLevel("mobile").map((row) => ({ label: labelOf(row), to: row.to_path }));
      const utilityLinks = topLevel("utility").map((row) => ({ label: labelOf(row), to: row.to_path }));
      return json(200, { primaryNav, footerGroups, mobileTabs, utilityLinks }, undefined, PUBLIC_CACHE_HEADERS);
    }

    const HOME_CONTENT_FIELDS = ["hero_badge", "hero_title", "hero_subtitle", "hero_intro", "president_quote_title", "president_quote_body", "who_eyebrow", "who_title", "who_body", "join_eyebrow", "join_title", "join_desc"] as const;

    // The homepage's actual hero/key-section text — previously hardcoded i18n keys with no admin
    // edit path at all (only the bonus "home-extras" banners were editable). Central content,
    // global-admin only, highest visibility on the whole site.
    if (method === "GET" && path === "/api/admin/home-content") {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const { data: i18n } = await supabase.from("home_content_i18n").select("*").eq("home_id", "home");
      const translations: Record<string, Record<string, string>> = {};
      for (const row of i18n ?? []) {
        const { locale, ...fields } = row as Record<string, string>;
        translations[locale] = fields;
      }
      return json(200, { translations });
    }

    if (method === "PUT" && path === "/api/admin/home-content") {
      const admin = await adminFromRequest(req);
      if (!admin || !isGlobalAdmin(admin)) return json(403, { error: "Global administrator access required" });
      const body = await readJson<{ translations?: Record<string, Record<string, string>> }>(req);
      const translated = await autoTranslateMissingLocales(body.translations ?? {}, [...HOME_CONTENT_FIELDS]);
      for (const [locale, fields] of Object.entries(translated)) {
        if (!SUPPORTED_LOCALES.includes(locale)) continue;
        const row: Record<string, unknown> = { home_id: "home", locale };
        for (const key of HOME_CONTENT_FIELDS) row[key] = fields[key] ?? "";
        await supabase.from("home_content_i18n").upsert(row);
      }
      await supabase.from("home_content").update({ updated_at: new Date().toISOString() }).eq("id", "home");
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: "home_content.update", entity_type: "home_content", entity_id: "home" });
      return json(200, { ok: true });
    }

    if (method === "GET" && path === "/api/home-content") {
      const locale = normalizeLocale(new URL(req.url, "http://localhost").searchParams.get("locale"));
      const { data: i18n } = await supabase.from("home_content_i18n").select("*").eq("home_id", "home");
      const result = pickLocale((i18n ?? []) as Record<string, unknown>[], locale, [...HOME_CONTENT_FIELDS]);
      return json(200, { content: result }, undefined, PUBLIC_CACHE_HEADERS);
    }

    if (method === "POST" && path === "/api/admin/upload") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const type = header(req, "x-file-type") || "image/jpeg";
      if (!type.startsWith("image/") && type !== "application/pdf") return json(400, { error: "Only image or PDF uploads are allowed" });
      if (req.body.length > MAX_UPLOAD_BYTES) return json(400, { error: "File is too large (max 15MB)" });
      const name = header(req, "x-file-name") || `upload-${randomUUID()}`;
      const ext = extname(name) || (type === "application/pdf" ? ".pdf" : type.includes("png") ? ".png" : ".jpg");
      const fileName = `${admin.scope_type}/${admin.scope_id ?? "global"}/${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
      const body = await compressUploadImage(req.body, type);
      const { error } = await supabase.storage.from(uploadBucket()).upload(fileName, body, { contentType: type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(uploadBucket()).getPublicUrl(fileName);
      return json(200, { src: data.publicUrl });
    }

    if (method === "POST" && path === "/api/cms/chapter-login") {
      return json(410, { error: "Shared chapter passwords have been replaced by individually assigned Supabase administrator accounts." });
    }

    if (method === "GET" && path === "/api/cms/content") {
      const { data } = await supabase.from("site_content").select("payload").eq("id", "site").maybeSingle();
      if (!data?.payload) return json(404, { error: "No CMS content yet" });
      return json(200, data.payload, undefined, PUBLIC_CACHE_HEADERS);
    }

    if (method === "GET" && path === "/api/stats") {
      const [members, volunteers, events] = await Promise.all([
        supabase.from("people").select("*", { count: "exact", head: true }),
        supabase.from("people").select("*", { count: "exact", head: true }).eq("is_volunteer", true),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("published", true),
      ]);
      return json(200, {
        members: members.count ?? 0,
        yuva: volunteers.count ?? 0,
        events: events.count ?? 0,
        chapters: chapterDesks.length,
      }, undefined, PUBLIC_CACHE_HEADERS);
    }

    const tenantContentPublic = path.match(/^\/api\/tenant-content\/(chapter|council)\/([^/]+)$/);
    if (method === "GET" && tenantContentPublic) {
      const scopeType = tenantContentPublic[1];
      const scopeId = decodeURIComponent(tenantContentPublic[2]);
      const { data } = await supabase
        .from("tenant_content")
        .select("tagline, intro, highlights, hero_image, gallery, updated_at")
        .eq("scope_type", scopeType)
        .eq("scope_id", scopeId)
        .eq("workflow_status", "published")
        .maybeSingle();
      return json(200, { content: data ?? null }, undefined, PUBLIC_CACHE_HEADERS);
    }

    if (method === "GET" && path === "/api/public/scope-stats") {
      const url = new URL(req.url, "http://localhost");
      const scopeType = url.searchParams.get("scopeType") ?? "";
      const scopeId = url.searchParams.get("scopeId")?.trim() ?? "";
      if ((scopeType !== "chapter" && scopeType !== "council") || !scopeId) return json(400, { error: "A chapter or council scope is required" });
      const peopleColumn = scopeType === "chapter" ? "emirate" : "home_state";
      const todayIso = startOfToday().toISOString();
      const [memberCount, volunteerCount, upcomingEventCount] = await Promise.all([
        supabase.from("people").select("*", { count: "exact", head: true }).eq(peopleColumn, scopeId),
        supabase.from("people").select("*", { count: "exact", head: true }).eq(peopleColumn, scopeId).eq("is_volunteer", true),
        scopeType === "chapter"
          ? supabase.from("events").select("*", { count: "exact", head: true }).eq("published", true).eq("emirate", scopeId).gte("starts_at", todayIso)
          : supabase.from("events").select("*", { count: "exact", head: true }).eq("published", true).eq("scope_type", "council").eq("scope_id", scopeId).gte("starts_at", todayIso),
      ]);
      return json(200, {
        memberCount: memberCount.count ?? 0,
        volunteerCount: volunteerCount.count ?? 0,
        upcomingEventCount: upcomingEventCount.count ?? 0,
      }, undefined, PUBLIC_CACHE_HEADERS);
    }

    if (method === "GET" && path === "/api/org/chapters") {
      const locale = normalizeLocale(new URL(req.url, "http://localhost").searchParams.get("locale"));
      const [{ data: chapters }, { data: i18n }] = await Promise.all([
        supabase.from("chapters").select("*").eq("active", true).order("id"),
        supabase.from("chapters_i18n").select("*"),
      ]);
      const byChapter = new Map<string, Record<string, unknown>[]>();
      for (const row of i18n ?? []) {
        const list = byChapter.get(row.chapter_id) ?? [];
        list.push(row);
        byChapter.set(row.chapter_id, list);
      }
      const result = (chapters ?? []).map((chapter) => ({
        id: chapter.id,
        emirateCode: chapter.emirate_code,
        establishedDate: chapter.established_date,
        contactEmail: chapter.contact_email,
        contactPhone: chapter.contact_phone,
        facebookUrl: chapter.facebook_url,
        image: chapter.image,
        ...pickLocale(byChapter.get(chapter.id) ?? [], locale, ["name", "description"]),
      }));
      return json(200, { chapters: result }, undefined, PUBLIC_CACHE_HEADERS);
    }

    if (method === "GET" && path === "/api/org/councils") {
      const locale = normalizeLocale(new URL(req.url, "http://localhost").searchParams.get("locale"));
      const [{ data: councils }, { data: i18n }] = await Promise.all([
        supabase.from("councils").select("*").eq("active", true).order("id"),
        supabase.from("councils_i18n").select("*"),
      ]);
      const byCouncil = new Map<string, Record<string, unknown>[]>();
      for (const row of i18n ?? []) {
        const list = byCouncil.get(row.council_id) ?? [];
        list.push(row);
        byCouncil.set(row.council_id, list);
      }
      const result = (councils ?? []).map((council) => ({
        id: council.id,
        kind: council.kind,
        region: council.region,
        contactEmail: council.contact_email,
        image: council.image,
        ...pickLocale(byCouncil.get(council.id) ?? [], locale, ["name", "description"]),
      }));
      return json(200, { councils: result }, undefined, PUBLIC_CACHE_HEADERS);
    }

    if (method === "GET" && path === "/api/org/leadership") {
      const url = new URL(req.url, "http://localhost");
      const locale = normalizeLocale(url.searchParams.get("locale"));
      const scopeType = url.searchParams.get("scopeType") || "global";
      const scopeId = url.searchParams.get("scopeId") ?? "";
      // Central Committee reads as a seniority hierarchy (President down to committee members), so
      // it stays ordered by display_order; a chapter/council's wider team roster is requested to
      // display alphabetically for now (membership-number sort is a planned future step, once every
      // office bearer has one on file) — ordering here, not client-side, keeps every consumer (this
      // API, the public pages, search) consistent without duplicating the sort logic.
      let query = supabase.from("appointments").select("*").eq("status", "active").eq("workflow_status", "published").eq("scope_type", scopeType);
      query = scopeType === "global" ? query.is("scope_id", null).order("display_order") : query.eq("scope_id", scopeId).order("person_name");
      const [{ data: appointments }, { data: positionsI18n }] = await Promise.all([
        query,
        supabase.from("positions_i18n").select("*"),
      ]);
      const byPosition = new Map<string, Record<string, unknown>[]>();
      for (const row of positionsI18n ?? []) {
        const list = byPosition.get(row.position_id) ?? [];
        list.push(row);
        byPosition.set(row.position_id, list);
      }
      const result = (appointments ?? []).map((item) => ({
        id: item.id,
        personId: item.person_id,
        personName: item.person_name,
        personImage: item.person_image,
        startedAt: item.started_at,
        bio: item.bio,
        membershipNo: item.membership_no,
        socialLinks: item.show_contact ? item.social_links : [],
        contactPhone: item.show_contact ? item.contact_phone : "",
        contactEmail: item.show_contact ? item.contact_email : "",
        positionTitle: pickLocale(byPosition.get(item.position_id) ?? [], locale, ["title"]).title || "",
      }));
      return json(200, { leadership: result }, undefined, PUBLIC_CACHE_HEADERS);
    }

    if (method === "GET" && path === "/api/events") {
      const url = new URL(req.url, "http://localhost");
      const tab = url.searchParams.get("tab") === "past" ? "past" : "upcoming";
      const category = url.searchParams.get("category")?.trim() ?? "";
      const emirate = url.searchParams.get("emirate")?.trim() ?? "";
      const free = url.searchParams.get("free") ?? "";
      const after = url.searchParams.get("after") ?? "";
      // Chapter-scoped events already carry their chapter as `emirate` (see POST
      // /api/admin/events), so chapter pages can keep using the `emirate` filter above.
      // Council-scoped events always have emirate="uae" and are only distinguishable by
      // scope_type/scope_id — this pair lets a council's public page find its own events.
      const scopeType = url.searchParams.get("scopeType")?.trim() ?? "";
      const scopeId = url.searchParams.get("scopeId")?.trim() ?? "";
      const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
      const upcoming = tab === "upcoming";

      let query = supabase.from("events").select("*").eq("published", true);
      const todayIso = startOfToday().toISOString();
      if (upcoming) {
        query = after ? query.gt("starts_at", after) : query.gte("starts_at", todayIso);
      } else {
        query = after ? query.lt("starts_at", after) : query.lt("starts_at", todayIso);
      }
      if (category && category !== "All" && (eventCategories as readonly string[]).includes(category)) query = query.eq("category", category);
      if (emirate) query = query.eq("emirate", emirate);
      if (scopeType === "chapter" || scopeType === "council") {
        query = query.eq("scope_type", scopeType);
        if (scopeId) query = query.eq("scope_id", scopeId);
      }
      if (free === "1" || free === "true") query = query.eq("is_free", true);
      query = query.order("starts_at", { ascending: upcoming }).limit(limit + 1);

      const { data, error } = await query;
      if (error) throw error;
      const rows = data ?? [];
      const hasMore = rows.length > limit;
      const events = rows.slice(0, limit).map((row) => eventFromRow(row as Record<string, unknown>));
      const nextCursor = hasMore ? events[events.length - 1]?.startsAt ?? null : null;
      return json(200, { events, nextCursor }, undefined, PUBLIC_CACHE_HEADERS);
    }

    const eventOne = path.match(/^\/api\/events\/([^/]+)$/);
    if (method === "GET" && eventOne && !["register", "volunteer", "mine"].includes(eventOne[1])) {
      const eventId = decodeURIComponent(eventOne[1]);
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
      if (error) throw error;
      if (!data) return json(404, { error: "Event not found" });
      const [memberCount, volunteerCount] = await Promise.all([
        supabase.from("event_registrations").select("*", { count: "exact", head: true }).eq("event_id", eventId).eq("participation_as", "member"),
        supabase.from("event_registrations").select("*", { count: "exact", head: true }).eq("event_id", eventId).eq("participation_as", "volunteer"),
      ]);
      return json(200, {
        event: eventFromRow(data as Record<string, unknown>),
        memberCount: memberCount.count ?? 0,
        volunteerCount: volunteerCount.count ?? 0,
      });
    }

    if (method === "PUT" && path === "/api/cms/content") {
      const session = await cmsFromRequest(req);
      if (session?.role !== "central") return json(401, { error: "Sign in required" });
      const payload = await readJson<Record<string, unknown>>(req);
      const { error } = await supabase.from("site_content").upsert({
        id: "site",
        payload,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      const highlights = Array.isArray(payload.eventHighlights) ? payload.eventHighlights : [];
      for (const event of highlights as Array<{
        id: string;
        title: string;
        date?: string;
        location?: string;
        body?: string;
        slides?: unknown;
        category?: string;
        emirate?: string;
        startsAt?: string;
        isFree?: boolean;
      }>) {
        if (!event?.id) continue;
        await ensureEvent(event);
      }
      return json(200, { ok: true });
    }

    if (method === "POST" && path === "/api/cms/upload") {
      const session = await cmsFromRequest(req);
      if (session?.role !== "central") return json(401, { error: "Sign in required" });
      const type = header(req, "x-file-type") || "image/jpeg";
      if (req.body.length > MAX_UPLOAD_BYTES) return json(400, { error: "File is too large (max 15MB)" });
      const name = header(req, "x-file-name") || `upload-${randomUUID()}`;
      const ext = extname(name) || (type.includes("png") ? ".png" : ".jpg");
      const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
      const body = await compressUploadImage(req.body, type);
      const { error } = await supabase.storage.from(uploadBucket()).upload(fileName, body, {
        contentType: type,
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(uploadBucket()).getPublicUrl(fileName);
      return json(200, { src: data.publicUrl });
    }

    if (method === "GET" && path === "/api/cms/inbox") {
      const session = await cmsFromRequest(req);
      if (!session) return json(401, { error: "Sign in required" });
      // A chapter admin's scope_id is a UAE emirate id (matches people.emirate); a council
      // admin's scope_id is an Indian state id (matches people.home_state). One person can
      // legitimately match both a chapter admin's and a council admin's inbox at once — that's
      // the point: one registration, visible wherever it belongs, no duplication.
      const scopeColumn = session.scopeType === "council" ? "home_state" : "emirate";
      const inboxUrl = new URL(req.url, "http://localhost");
      const rawQuery = inboxUrl.searchParams.get("q")?.trim() ?? "";
      // Strip PostgREST filter-syntax characters (,()) and ilike wildcards so user input can never
      // alter the intended filter structure — see the .or() calls below and in /api/admin/dashboard.
      const safeQuery = rawQuery.replace(/[,()%_]/g, "").slice(0, 80);
      let peopleQuery = supabase
        .from("people")
        .select("id, membership_no, name, email, phone, emirate, home_state, is_volunteer, created_at")
        .order("created_at", { ascending: false });
      if (session.role !== "central") peopleQuery = peopleQuery.eq(scopeColumn, session.scopeId);
      peopleQuery = safeQuery.length >= 2
        ? peopleQuery.or(`name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%,membership_no.ilike.%${safeQuery}%`).limit(200)
        : peopleQuery.limit(500);
      const peopleRes = await peopleQuery;
      if (peopleRes.error) throw peopleRes.error;
      const people = peopleRes.data ?? [];
      const emails = new Set(people.map((item) => String(item.email)));
      const [inquiries, registrations, volunteers, donations] = await Promise.all([
        supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("event_registrations").select("*, events(title)").order("created_at", { ascending: false }).limit(300),
        supabase.from("event_volunteers").select("*, people(name, email, membership_no, emirate, home_state), events(title)").order("created_at", { ascending: false }).limit(300),
        supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(200),
      ]);
      // inquiries only ever carries `emirate` (the public contact/support forms don't collect a
      // home state) — a council admin's scopeColumn is "home_state", which no inquiry row has, so
      // scoping by scopeColumn here would silently show a council admin zero inquiries ever.
      // Inquiries aren't state-affiliated, so council admins see the same full list central does.
      const inquiryRows = (inquiries.data ?? []).filter(
        (item) => session.role === "central" || session.scopeType === "council" || item.emirate === session.scopeId,
      );
      const registrationRows = (registrations.data ?? []).filter((item) => session.role === "central" || emails.has(String(item.email)));
      const volunteerRows = (volunteers.data ?? []).filter((item) => {
        if (session.role === "central") return true;
        const person = item.people as Record<string, unknown> | null;
        return person?.[scopeColumn] === session.scopeId;
      });
      return json(200, {
        inquiries: inquiryRows.map((item) => ({
          id: item.id,
          createdAt: item.created_at,
          intent: item.intent,
          name: item.name,
          email: item.email,
          phone: item.phone,
          emirate: item.emirate,
          message: item.message,
          status: item.status ?? "new",
        })),
        rsvps: registrationRows.map((item) => ({
          id: item.id,
          createdAt: item.created_at,
          eventTitle: (item.events as { title?: string } | null)?.title ?? item.event_id,
          registrationNo: item.registration_no,
          name: item.name,
          email: item.email,
          phone: item.phone,
        })),
        volunteers: volunteerRows.map((item) => ({
          id: item.id,
          createdAt: item.created_at,
          eventTitle: (item.events as { title?: string } | null)?.title ?? item.event_id,
          name: (item.people as { name?: string } | null)?.name ?? "",
          email: (item.people as { email?: string } | null)?.email ?? "",
          membershipNo: (item.people as { membership_no?: string } | null)?.membership_no ?? "",
          status: item.status,
        })),
        donations: session.role === "central" ? (donations.data ?? []).map((item) => ({
          id: item.id,
          createdAt: item.created_at,
          name: item.name,
          email: item.email,
          amountAed: Number(item.amount_aed),
          note: item.note,
          status: item.status,
        })) : [],
        members: people.map((item) => ({
          id: item.id,
          membershipNo: item.membership_no,
          name: item.name,
          email: item.email,
          phone: item.phone,
          emirate: item.emirate,
          homeState: item.home_state,
          createdAt: item.created_at,
          isVolunteer: item.is_volunteer,
        })),
        yuva: people
          .filter((item) => item.is_volunteer)
          .map((item) => ({
            id: item.id,
            membershipNo: item.membership_no,
            name: item.name,
            email: item.email,
            phone: item.phone,
            emirate: item.emirate,
            homeState: item.home_state,
            createdAt: item.created_at,
          })),
        peopleQuery: safeQuery,
        peopleMayBeTruncated: !safeQuery && (peopleRes.data ?? []).length >= 500,
      });
    }

    const inquiryStatus = path.match(/^\/api\/admin\/inquiries\/([^/]+)$/);
    if (method === "PATCH" && inquiryStatus) {
      const session = await cmsFromRequest(req);
      if (!session) return json(401, { error: "Sign in required" });
      const body = await readJson<{ status?: string }>(req);
      if (!body.status || !["new", "in_progress", "resolved"].includes(body.status)) {
        return json(400, { error: "A valid status is required" });
      }
      const id = decodeURIComponent(inquiryStatus[1]);
      const { data: current } = await supabase.from("inquiries").select("id, emirate").eq("id", id).maybeSingle();
      if (!current) return json(404, { error: "Inquiry not found" });
      // Same scoping rule as GET /api/cms/inbox: council admins see/manage the full list (inquiries
      // aren't state-affiliated), chapter admins only their own emirate's inquiries.
      if (session.role !== "central" && session.scopeType !== "council" && current.emirate !== session.scopeId) {
        return json(403, { error: "This inquiry is outside your assigned scope" });
      }
      const { error } = await supabase.from("inquiries").update({ status: body.status }).eq("id", id);
      if (error) throw error;
      return json(200, { ok: true });
    }

    if (method === "POST" && path === "/api/inquiries") {
      const inquiriesLimit = await rateLimit("inquiries", clientIp(req.headers), 10, 300);
      if (!inquiriesLimit.allowed) return json(429, { error: "Too many submissions. Try again in a few minutes." });
      const body = await readJson<{
        intent?: string;
        name?: string;
        email?: string;
        phone?: string;
        emirate?: string;
        message?: string;
        extra?: Record<string, string>;
      }>(req);
      if (!body.name || !body.email) return json(400, { error: "Name and email are required" });
      // Link to the submitter's account when they're signed in, so their own "my support
      // requests" list (see /api/members/support) can find it — anonymous submission still works
      // fine either way, this is additive.
      const submitter = await personFromRequest(req);
      const { data, error } = await supabase
        .from("inquiries")
        .insert({
          intent: body.intent ?? "contact",
          name: body.name,
          email: body.email,
          phone: body.phone ?? "",
          emirate: body.emirate ?? "",
          message: body.message ?? "",
          extra: body.extra ?? {},
          person_id: submitter?.id ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return json(200, { ok: true, id: data.id });
    }

    if (method === "POST" && path === "/api/members/register") {
      return json(410, { error: "Use Supabase Auth sign-up. Full name and a unique UAE mobile number are mandatory." });
    }

    if (method === "POST" && path === "/api/members/login") {
      return json(410, { error: "Use Supabase Auth sign-in." });
    }

    if (method === "GET" && path === "/api/members/me") {
      const person = await personFromRequest(req);
      if (!person) return json(401, { error: "Sign in required" });
      const [registrations, volunteers] = await Promise.all([
        supabase
          .from("event_registrations")
          .select("event_id, registration_no, created_at, events(title)")
          .eq("person_id", person.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("event_volunteers")
          .select("event_id, status, created_at, events(title)")
          .eq("person_id", person.id)
          .order("created_at", { ascending: false }),
      ]);
      return json(200, {
        member: await loadHoursAndPerson(person),
        registrations: (registrations.data ?? []).map((item) => ({
          eventId: item.event_id,
          eventTitle: (item.events as { title?: string } | null)?.title ?? item.event_id,
          registrationNo: item.registration_no,
          createdAt: item.created_at,
        })),
        volunteerShifts: (volunteers.data ?? []).map((item) => ({
          eventId: item.event_id,
          eventTitle: (item.events as { title?: string } | null)?.title ?? item.event_id,
          status: item.status,
          createdAt: item.created_at,
        })),
      });
    }

    if (method === "GET" && path === "/api/members/support") {
      const person = await personFromRequest(req);
      if (!person) return json(401, { error: "Sign in required" });
      const { data, error } = await supabase
        .from("inquiries")
        .select("id, created_at, intent, message, status")
        .eq("person_id", person.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json(200, {
        requests: (data ?? []).map((item) => ({
          id: item.id,
          createdAt: item.created_at,
          intent: item.intent,
          message: item.message,
          status: item.status ?? "new",
        })),
      });
    }

    if (method === "POST" && path === "/api/members/support") {
      const person = await personFromRequest(req);
      if (!person) return json(401, { error: "Sign in required" });
      const supportLimit = await rateLimit("members-support", clientIp(req.headers), 10, 300);
      if (!supportLimit.allowed) return json(429, { error: "Too many submissions. Try again in a few minutes." });
      const body = await readJson<{ message?: string }>(req);
      if (!body.message?.trim()) return json(400, { error: "Enter a message describing your request" });
      const { data, error } = await supabase
        .from("inquiries")
        .insert({
          intent: "support",
          name: person.name,
          email: person.email,
          phone: person.phone,
          emirate: person.emirate,
          message: body.message.trim(),
          person_id: person.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      return json(200, { ok: true, id: data.id });
    }

    if (method === "POST" && path === "/api/members/hours") {
      const person = await personFromRequest(req);
      if (!person) return json(401, { error: "Sign in required" });
      const body = await readJson<{ date?: string; hours?: number; activity?: string }>(req);
      if (!body.activity || !body.hours) return json(400, { error: "Activity and hours are required" });
      const { error } = await supabase.from("volunteer_hours").insert({
        person_id: person.id,
        activity_date: body.date || new Date().toISOString().slice(0, 10),
        hours: Number(body.hours),
        activity: body.activity,
      });
      if (error) throw error;
      const fresh = (await supabase.from("people").select("*").eq("id", person.id).single()).data as PersonRow;
      return json(200, { member: await loadHoursAndPerson(fresh) });
    }

    const eventRegister = path.match(/^\/api\/events\/([^/]+)\/register$/);
    if (method === "POST" && eventRegister) {
      const registerLimit = await rateLimit("event-register", clientIp(req.headers), 15, 300);
      if (!registerLimit.allowed) return json(429, { error: "Too many registration attempts. Try again in a few minutes." });
      const eventId = decodeURIComponent(eventRegister[1]);
      const known = await loadPublicEvent(eventId);
      if (!known) return json(404, { error: "Event not found" });
      if (!isUpcomingEvent({ startsAt: known.startsAt })) {
        return json(400, { error: "Registration is closed for this event" });
      }
      const body = await readJson<{ identifier?: string; participationAs?: "member" | "volunteer"; name?: string; email?: string; phone?: string }>(req);
      let person = await personFromRequest(req);
      const identifier = body.identifier?.trim();
      if (!person && identifier) {
        // Matches both the current "IPF-######" format and the legacy "IPFM-####"/"IPFY-####"
        // format issued before 006_unified_identity.sql merged member/Yuva numbering — a
        // pre-migration member typing their real membership number must still be found by it,
        // not misrouted into a failed phone lookup.
        const column = /^IPF[A-Z]?-/i.test(identifier) ? "membership_no" : "phone";
        const { data: matched } = await supabase.from("people").select("*").eq(column, identifier).maybeSingle();
        person = (matched as PersonRow | null) ?? null;
      }
      if (body.participationAs === "volunteer" && !person?.is_volunteer) {
        return json(403, { error: "Opt in as an IPF Yuva volunteer first, then join this event as a volunteer", code: "not_volunteer" });
      }
      const name = body.name?.trim() || person?.name;
      const email = (body.email?.trim() || person?.email || "").toLowerCase();
      const phone = body.phone?.trim() || person?.phone || "";
      if (!name || !email) return json(400, { error: "Name and email are required" });
      const { data: existing } = await supabase
        .from("event_registrations")
        .select("registration_no")
        .eq("event_id", eventId)
        .eq("email", email)
        .maybeSingle();
      if (existing) {
        return json(200, { ok: true, alreadyRegistered: true, registrationNo: existing.registration_no });
      }
      const { data, error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: eventId,
          person_id: person?.id ?? null,
          registration_no: eventRegistrationNo(),
          name,
          email,
          phone,
          participation_as: body.participationAs === "volunteer" ? "volunteer" : "member",
        })
        .select("registration_no")
        .single();
      if (error?.code === "23505") {
        const { data: again } = await supabase
          .from("event_registrations")
          .select("registration_no")
          .eq("event_id", eventId)
          .eq("email", email)
          .maybeSingle();
        return json(200, { ok: true, alreadyRegistered: true, registrationNo: again?.registration_no });
      }
      if (error) throw error;
      return json(200, { ok: true, registrationNo: data.registration_no });
    }

    const eventVolunteer = path.match(/^\/api\/events\/([^/]+)\/volunteer$/);
    if (method === "POST" && eventVolunteer) {
      const volunteerLimit = await rateLimit("event-volunteer", clientIp(req.headers), 15, 300);
      if (!volunteerLimit.allowed) return json(429, { error: "Too many attempts. Try again in a few minutes." });
      const eventId = decodeURIComponent(eventVolunteer[1]);
      const known = await loadPublicEvent(eventId);
      if (!known) return json(404, { error: "Event not found" });
      if (!isUpcomingEvent({ startsAt: known.startsAt })) {
        return json(400, { error: "Volunteering is closed for this event" });
      }
      const person = await personFromRequest(req);
      if (!person) return json(401, { error: "Sign in to volunteer for an event" });
      if (!person.is_volunteer) return json(403, { error: "Opt in as an IPF Yuva volunteer first, then volunteer for this event", code: "not_volunteer" });
      const { data: existing } = await supabase
        .from("event_volunteers")
        .select("id, status")
        .eq("event_id", eventId)
        .eq("person_id", person.id)
        .maybeSingle();
      if (existing) return json(200, { ok: true, alreadyAssigned: true, status: existing.status });
      const { error } = await supabase.from("event_volunteers").insert({
        event_id: eventId,
        person_id: person.id,
        status: "assigned",
      });
      if (error && error.code !== "23505") throw error;
      return json(200, { ok: true, status: "assigned" });
    }

    const eventMine = path.match(/^\/api\/events\/([^/]+)\/mine$/);
    if (method === "GET" && eventMine) {
      const eventId = decodeURIComponent(eventMine[1]);
      const person = await personFromRequest(req);
      if (!person) return json(200, { registration: null, volunteer: null });
      // Same PostgREST filter-character stripping as /api/cms/inbox's .or() calls — defense in
      // depth so a stored email can never alter the intended filter structure.
      const safeEmail = person.email.replace(/[,()]/g, "");
      const [registration, volunteer] = await Promise.all([
        supabase
          .from("event_registrations")
          .select("registration_no, status")
          .eq("event_id", eventId)
          .or(`person_id.eq.${person.id},email.eq.${safeEmail}`)
          .maybeSingle(),
        supabase.from("event_volunteers").select("status").eq("event_id", eventId).eq("person_id", person.id).maybeSingle(),
      ]);
      return json(200, {
        registration: registration.data ? { registrationNo: registration.data.registration_no, status: registration.data.status } : null,
        volunteer: volunteer.data ? { status: volunteer.data.status } : null,
      });
    }

    if (method === "POST" && path === "/api/rsvp") {
      const body = await readJson<{ eventId?: string; eventTitle?: string; name?: string; email?: string; phone?: string }>(req);
      if (!body.eventId) return json(400, { error: "Event, name and email are required" });
      req.url = `/api/events/${encodeURIComponent(body.eventId)}/register`;
      return handleRequest({ ...req, method: "POST", url: req.url, body: Buffer.from(JSON.stringify(body)) });
    }

    if (method === "POST" && path === "/api/donations") {
      const donationsLimit = await rateLimit("donations", clientIp(req.headers), 10, 300);
      if (!donationsLimit.allowed) return json(429, { error: "Too many submissions. Try again in a few minutes." });
      const body = await readJson<{ name?: string; email?: string; amountAed?: number; note?: string }>(req);
      if (!body.name || !body.email || !body.amountAed || body.amountAed <= 0) {
        return json(400, { error: "Name, email and a valid amount are required" });
      }
      const { data, error } = await supabase
        .from("donations")
        .insert({
          name: body.name,
          email: body.email,
          amount_aed: body.amountAed,
          note: body.note ?? "",
        })
        .select("id")
        .single();
      if (error) throw error;
      return json(200, { ok: true, id: data.id });
    }

    return json(404, { error: "Unknown API route" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message.includes("SUPABASE") || message.includes("tables are missing") ? 503 : 500;
    return json(status, { error: message });
  }
}
