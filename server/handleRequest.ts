import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { ensureDatabase, getSupabase, uploadBucket } from "./db.ts";
import {
  chapterDesks,
  eventRegistrationNo,
  matchesChapter,
  type AccountKind,
} from "./crypto.ts";
import { header, json, readJson, type AppRequest, type AppResponse } from "./http.ts";
import { filterPublicEvents, mapEventRow, catalogSeedEvents, isUpcomingEvent, type PublicEvent } from "../src/data/eventCatalog.ts";


type PersonRow = {
  id: string;
  kind: AccountKind;
  membership_no: string;
  name: string;
  email: string;
  phone: string;
  emirate: string;
  chapter: string;
  password_hash: string;
  created_at: string;
};

type HoursRow = { id: string; activity_date: string; hours: number | string; activity: string };

type AdminRole = "super_admin" | "central_content_admin" | "chapter_admin" | "council_admin" | "editor";
type AdminRow = { id: string; email: string; display_name: string; role: AdminRole; scope_type: "global" | "chapter" | "council"; scope_id: string | null; active: boolean; mfa_required: boolean; password_hash: string };

function publicPerson(row: PersonRow, hours: HoursRow[] = []) {
  return {
    id: row.id,
    kind: row.kind,
    membershipNo: row.membership_no,
    name: row.name,
    email: row.email,
    phone: row.phone,
    emirate: row.emirate,
    chapter: row.chapter,
    createdAt: row.created_at,
    volunteerHours: hours.map((item) => ({
      id: item.id,
      date: String(item.activity_date).slice(0, 10),
      hours: Number(item.hours),
      activity: item.activity,
    })),
  };
}

function bearerToken(req: AppRequest) {
  const value = header(req, "authorization");
  return value.startsWith("Bearer ") ? value.slice(7).trim() : "";
}

async function authenticatedUser(req: AppRequest) {
  const token = bearerToken(req);
  if (!token) return null;
  const { data, error } = await getSupabase().auth.getUser(token);
  return error ? null : data.user;
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

function publicAdmin(admin: AdminRow) {
  return { id: admin.id, email: admin.email, name: admin.display_name, role: admin.role, scopeType: admin.scope_type, scopeId: admin.scope_id, mfaRequired: admin.mfa_required };
}

function isGlobalAdmin(admin: AdminRow) {
  return admin.scope_type === "global" && (admin.role === "super_admin" || admin.role === "central_content_admin");
}

function eventInScope(admin: AdminRow, event: { scope_type?: string; scope_id?: string | null }) {
  return isGlobalAdmin(admin) || (event.scope_type === admin.scope_type && event.scope_id === admin.scope_id);
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
    role: admin.scope_type === "global" ? ("central" as const) : ("chapter" as const),
    chapterId: admin.scope_id ?? "",
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
        await supabase
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

    if (method === "POST" && path === "/api/members/check-phone") {
      const body = await readJson<{ phone?: string }>(req);
      let phone = "";
      try { phone = normalizeUaeMobile(body.phone ?? ""); }
      catch (error) { return json(400, { error: error instanceof Error ? error.message : "Invalid mobile number" }); }
      const { data } = await supabase.from("people").select("id").eq("phone", phone).maybeSingle();
      if (data) return json(409, { error: "An account with this mobile number already exists" });
      return json(200, { ok: true, phone });
    }

    if (method === "POST" && path === "/api/cms/login") {
      return json(410, { error: "Password-only CMS login has been replaced by Supabase administrator authentication." });
    }

    if (method === "POST" && path === "/api/admin/login") {
      const body = await readJson<{ email?: string; password?: string }>(req);
      const email = body.email?.trim().toLowerCase() ?? "";
      const signedIn = await supabase.auth.signInWithPassword({ email, password: body.password ?? "" });
      if (signedIn.error || !signedIn.data.user || !signedIn.data.session) return json(401, { error: "Email or password is incorrect" });
      const { data } = await supabase.from("admin_users").select("*").eq("auth_user_id", signedIn.data.user.id).eq("active", true).maybeSingle();
      const admin = data as AdminRow | null;
      if (!admin) return json(403, { error: "This account does not have administrator access" });
      await Promise.all([
        supabase.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", admin.id),
        supabase.from("audit_logs").insert({ actor_id: admin.id, action: "admin.login", entity_type: "admin_user", entity_id: admin.id, request_id: header(req, "x-request-id") || randomUUID() }),
      ]);
      return json(200, { admin: publicAdmin(admin), accessToken: signedIn.data.session.access_token, refreshToken: signedIn.data.session.refresh_token });
    }

    if (method === "GET" && path === "/api/admin/session") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      return json(200, { admin: publicAdmin(admin) });
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
        peopleQuery = peopleQuery.or(`emirate.eq.${scope},chapter.eq.${scope}`);
        approvalsQuery = approvalsQuery.eq("scope_type", "chapter").eq("scope_id", scope);
        pendingQuery = pendingQuery.eq("scope_type", "chapter").eq("scope_id", scope);
      } else if (scope && admin.scope_type === "council") {
        eventsQuery = eventsQuery.eq("scope_type", "council").eq("scope_id", scope);
        approvalsQuery = approvalsQuery.eq("scope_type", "council").eq("scope_id", scope);
        pendingQuery = pendingQuery.eq("scope_type", "council").eq("scope_id", scope);
      }
      const [eventsCount, peopleCount, approvalsCount, pending] = await Promise.all([
        eventsQuery, peopleQuery, approvalsQuery,
        pendingQuery,
      ]);
      return json(200, { counts: { events: eventsCount.count ?? 0, people: peopleCount.count ?? 0, approvals: approvalsCount.count ?? 0 }, pending: pending.data ?? [], admin: publicAdmin(admin) });
    }

    if (method === "GET" && path === "/api/admin/events") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      let query = supabase.from("events").select("*").order("updated_at", { ascending: false });
      if (!isGlobalAdmin(admin)) query = query.eq("scope_type", admin.scope_type).eq("scope_id", admin.scope_id ?? "");
      const { data, error } = await query;
      if (error) throw error;
      return json(200, { events: data ?? [] });
    }

    if (method === "POST" && path === "/api/admin/events") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const body = await readJson<{ title?: string; eventDate?: string; location?: string; body?: string; category?: string; startsAt?: string; isFree?: boolean; slides?: unknown }>(req);
      if (!body.title?.trim()) return json(400, { error: "Event title is required" });
      const id = `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48)}-${randomUUID().slice(0, 8)}`;
      const scopeType = isGlobalAdmin(admin) ? "global" : admin.scope_type;
      const scopeId = isGlobalAdmin(admin) ? null : admin.scope_id;
      const { data, error } = await supabase.from("events").insert({
        id, title: body.title.trim(), event_date: body.eventDate ?? "", location: body.location ?? "", body: body.body ?? "",
        category: body.category ?? "Community", starts_at: body.startsAt || null, is_free: body.isFree !== false,
        slides: body.slides ?? [],
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
      const body = await readJson<{ title?: string; eventDate?: string; location?: string; body?: string; category?: string; startsAt?: string; isFree?: boolean; slides?: unknown }>(req);
      const update = { title: body.title?.trim() || current.title, event_date: body.eventDate ?? current.event_date, location: body.location ?? current.location, body: body.body ?? current.body, category: body.category ?? current.category, starts_at: body.startsAt || null, is_free: body.isFree ?? current.is_free, slides: body.slides ?? current.slides, updated_at: new Date().toISOString(), workflow_status: isGlobalAdmin(admin) ? current.workflow_status : "draft", published: isGlobalAdmin(admin) ? current.published : false };
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
      if (approval.entity_type === "event") await supabase.from("events").update({ workflow_status: body.decision === "approved" ? "published" : body.decision, published: body.decision === "approved", updated_at: new Date().toISOString() }).eq("id", approval.entity_id);
      await supabase.from("audit_logs").insert({ actor_id: admin.id, action: `approval.${body.decision}`, entity_type: approval.entity_type, entity_id: approval.entity_id, new_value: { note: body.note ?? "" } });
      return json(200, { ok: true });
    }

    if (method === "POST" && path === "/api/admin/upload") {
      const admin = await adminFromRequest(req);
      if (!admin) return json(401, { error: "Administrator sign-in required" });
      const type = header(req, "x-file-type") || "image/jpeg";
      if (!type.startsWith("image/")) return json(400, { error: "Only image uploads are allowed" });
      const name = header(req, "x-file-name") || `upload-${randomUUID()}`;
      const ext = extname(name) || (type.includes("png") ? ".png" : ".jpg");
      const fileName = `${admin.scope_type}/${admin.scope_id ?? "global"}/${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
      const { error } = await supabase.storage.from(uploadBucket()).upload(fileName, req.body, { contentType: type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(uploadBucket()).getPublicUrl(fileName);
      return json(200, { src: data.publicUrl });
    }

    if (method === "POST" && path === "/api/cms/chapter-login") {
      return json(410, { error: "Shared chapter passwords have been replaced by individually assigned Supabase administrator accounts." });
    }

    if (method === "POST" && (path === "/api/cms/logout" || path === "/api/members/logout")) {
      return json(200, { ok: true });
    }

    if (method === "GET" && path === "/api/cms/session") {
      const session = await cmsFromRequest(req);
      if (!session) return json(401, { error: "Sign in required" });
      const desk = chapterDesks.find((item) => item.id === session.chapterId);
      return json(200, {
        role: session.role,
        chapterId: session.chapterId,
        chapterName: session.role === "central" ? "Central desk" : desk?.name,
      });
    }

    if (method === "GET" && path === "/api/cms/content") {
      const { data } = await supabase.from("site_content").select("payload").eq("id", "site").maybeSingle();
      if (!data?.payload) return json(404, { error: "No CMS content yet" });
      return json(200, data.payload);
    }

    if (method === "GET" && path === "/api/stats") {
      const [members, yuva, events] = await Promise.all([
        supabase.from("people").select("*", { count: "exact", head: true }).eq("kind", "member"),
        supabase.from("people").select("*", { count: "exact", head: true }).eq("kind", "yuva"),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("published", true),
      ]);
      return json(200, {
        members: members.count ?? 0,
        yuva: yuva.count ?? 0,
        events: events.count ?? 0,
        chapters: chapterDesks.length,
      });
    }

    if (method === "GET" && path === "/api/events") {
      const url = new URL(req.url, "http://localhost");
      const { data, error } = await supabase.from("events").select("*").eq("published", true);
      if (error) throw error;
      const events = filterPublicEvents((data ?? []).map((row) => eventFromRow(row as Record<string, unknown>)), {
        tab: url.searchParams.get("tab") === "past" ? "past" : "upcoming",
        category: url.searchParams.get("category") ?? "",
        emirate: url.searchParams.get("emirate") ?? "",
        free: url.searchParams.get("free") ?? "",
      });
      return json(200, { events });
    }

    const eventOne = path.match(/^\/api\/events\/([^/]+)$/);
    if (method === "GET" && eventOne && !["register", "volunteer", "mine"].includes(eventOne[1])) {
      const eventId = decodeURIComponent(eventOne[1]);
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
      if (error) throw error;
      if (!data) return json(404, { error: "Event not found" });
      return json(200, { event: eventFromRow(data as Record<string, unknown>) });
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
      const name = header(req, "x-file-name") || `upload-${randomUUID()}`;
      const ext = extname(name) || (type.includes("png") ? ".png" : ".jpg");
      const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
      const { error } = await supabase.storage.from(uploadBucket()).upload(fileName, req.body, {
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
      const chapter = session.chapterId;
      const peopleRes = await supabase.from("people").select("id, kind, membership_no, name, email, phone, emirate, chapter, created_at").order("created_at", { ascending: false });
      if (peopleRes.error) throw peopleRes.error;
      const people = (peopleRes.data ?? []).filter(
        (item) => session.role === "central" || matchesChapter(item.emirate as string, chapter) || matchesChapter(item.chapter as string, chapter),
      );
      const emails = new Set(people.map((item) => String(item.email)));
      const [inquiries, registrations, volunteers, donations] = await Promise.all([
        supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("event_registrations").select("*, events(title)").order("created_at", { ascending: false }).limit(300),
        supabase.from("event_volunteers").select("*, people(name, email, membership_no, emirate), events(title)").order("created_at", { ascending: false }).limit(300),
        supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(200),
      ]);
      const inquiryRows = (inquiries.data ?? []).filter(
        (item) => session.role === "central" || matchesChapter(item.emirate as string, chapter),
      );
      const registrationRows = (registrations.data ?? []).filter((item) => session.role === "central" || emails.has(String(item.email)));
      const volunteerRows = (volunteers.data ?? []).filter((item) => {
        if (session.role === "central") return true;
        const person = item.people as { emirate?: string } | null;
        return matchesChapter(person?.emirate, chapter);
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
        members: people
          .filter((item) => item.kind !== "yuva")
          .map((item) => ({
            id: item.id,
            membershipNo: item.membership_no,
            name: item.name,
            email: item.email,
            phone: item.phone,
            emirate: item.emirate,
            createdAt: item.created_at,
            kind: item.kind,
          })),
        yuva: people
          .filter((item) => item.kind === "yuva")
          .map((item) => ({
            id: item.id,
            membershipNo: item.membership_no,
            name: item.name,
            email: item.email,
            phone: item.phone,
            emirate: item.emirate,
            createdAt: item.created_at,
          })),
      });
    }

    if (method === "POST" && path === "/api/inquiries") {
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
      const eventId = decodeURIComponent(eventRegister[1]);
      const known = await loadPublicEvent(eventId);
      if (!isUpcomingEvent({ startsAt: known?.startsAt ?? null })) {
        return json(400, { error: "Registration is closed for this event" });
      }
      const body = await readJson<{ identifier?: string; participationAs?: "member" | "volunteer"; name?: string; email?: string; phone?: string; eventTitle?: string; date?: string; location?: string; eventBody?: string }>(req);
      let person = await personFromRequest(req);
      const identifier = body.identifier?.trim();
      if (!person && identifier) {
        const column = /^IPF[MY]-/i.test(identifier) ? "membership_no" : "phone";
        const { data: matched } = await supabase.from("people").select("*").eq(column, identifier).maybeSingle();
        person = (matched as PersonRow | null) ?? null;
      }
      if (body.participationAs === "volunteer" && person?.kind !== "yuva") {
        return json(403, { error: "A valid IPF Yuva ID or registered mobile number is required to join as a volunteer" });
      }
      const name = body.name?.trim() || person?.name;
      const email = (body.email?.trim() || person?.email || "").toLowerCase();
      const phone = body.phone?.trim() || person?.phone || "";
      if (!name || !email) return json(400, { error: "Name and email are required" });
      await ensureEvent({ id: eventId, title: body.eventTitle, date: body.date, location: body.location, body: body.eventBody });
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
      const eventId = decodeURIComponent(eventVolunteer[1]);
      const known = await loadPublicEvent(eventId);
      if (!isUpcomingEvent({ startsAt: known?.startsAt ?? null })) {
        return json(400, { error: "Volunteering is closed for this event" });
      }
      const person = await personFromRequest(req);
      if (!person) return json(401, { error: "Sign in as IPF Yuva to volunteer for an event" });
      if (person.kind !== "yuva") return json(403, { error: "Event volunteering is for IPF Yuva members" });
      const body = await readJson<{ eventTitle?: string; date?: string; location?: string; eventBody?: string }>(req);
      await ensureEvent({ id: eventId, title: body.eventTitle, date: body.date, location: body.location, body: body.eventBody });
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
      const [registration, volunteer] = await Promise.all([
        supabase
          .from("event_registrations")
          .select("registration_no, status")
          .eq("event_id", eventId)
          .or(`person_id.eq.${person.id},email.eq.${person.email}`)
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
