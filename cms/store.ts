import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export type AccountKind = "member" | "yuva";

export type InquiryRecord = {
  id: string;
  createdAt: string;
  intent: string;
  name: string;
  email: string;
  phone?: string;
  emirate?: string;
  message?: string;
  extra?: Record<string, string>;
};

export type MemberRecord = {
  id: string;
  kind: AccountKind;
  membershipNo: string;
  name: string;
  email: string;
  phone: string;
  emirate: string;
  chapter: string;
  passwordHash: string;
  createdAt: string;
  volunteerHours: { id: string; date: string; hours: number; activity: string }[];
};

export type RsvpRecord = {
  id: string;
  createdAt: string;
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
  phone?: string;
};

export type DonationRecord = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  amountAed: number;
  note?: string;
  status: "pledge";
};

export type ChapterAdmin = {
  chapterId: string;
  chapterName: string;
  passwordHash: string;
};

export type PlatformData = {
  inquiries: InquiryRecord[];
  members: MemberRecord[];
  rsvps: RsvpRecord[];
  donations: DonationRecord[];
  chapterAdmins: ChapterAdmin[];
};

export const chapterDesks = [
  { id: "abu-dhabi", name: "Abu Dhabi" },
  { id: "al-ain", name: "Al Ain" },
  { id: "dubai", name: "Dubai" },
  { id: "sharjah", name: "Sharjah" },
  { id: "ajman", name: "Ajman" },
  { id: "umm-al-quwain", name: "Umm Al Quwain" },
  { id: "ras-al-khaimah", name: "Ras Al Khaimah" },
  { id: "fujairah", name: "Fujairah" },
] as const;

export function dataPath(root: string) {
  return {
    content: path.join(root, "data/cms/content.json"),
    platform: path.join(root, "data/cms/platform.json"),
    uploads: path.join(root, "public/uploads"),
  };
}

export async function ensureDirs(root: string) {
  const paths = dataPath(root);
  await mkdir(path.dirname(paths.content), { recursive: true });
  await mkdir(paths.uploads, { recursive: true });
}

function withDefaults(raw: Partial<PlatformData>): PlatformData {
  const members: MemberRecord[] = (raw.members ?? []).map((member) => ({
    ...member,
    kind: member.kind === "yuva" ? "yuva" : "member",
  }));
  let chapterAdmins = raw.chapterAdmins ?? [];
  if (chapterAdmins.length === 0) {
    chapterAdmins = chapterDesks.map((desk) => ({
      chapterId: desk.id,
      chapterName: desk.name,
      passwordHash: hashPassword(`ipf-${desk.id}`),
    }));
  }
  return {
    inquiries: raw.inquiries ?? [],
    members,
    rsvps: raw.rsvps ?? [],
    donations: raw.donations ?? [],
    chapterAdmins,
  };
}

export async function readPlatform(root: string): Promise<PlatformData> {
  try {
    const raw = await readFile(dataPath(root).platform, "utf8");
    const data = withDefaults(JSON.parse(raw) as Partial<PlatformData>);
    if (!(JSON.parse(raw) as Partial<PlatformData>).chapterAdmins?.length) {
      await writePlatform(root, data);
    }
    return data;
  } catch {
    const data = withDefaults({});
    await writePlatform(root, data);
    return data;
  }
}

export async function writePlatform(root: string, data: PlatformData) {
  await writeFile(dataPath(root).platform, JSON.stringify(data, null, 2));
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, "hex");
  return prev.length === next.length && timingSafeEqual(prev, next);
}

export function publicMember(member: MemberRecord) {
  return {
    id: member.id,
    kind: member.kind ?? "member",
    membershipNo: member.membershipNo,
    name: member.name,
    email: member.email,
    phone: member.phone,
    emirate: member.emirate,
    chapter: member.chapter,
    createdAt: member.createdAt,
    volunteerHours: member.volunteerHours,
  };
}

export function memberToken(secret: string, memberId: string) {
  return createHash("sha256").update(`${secret}:${memberId}`).digest("hex");
}

export function memberIdFromToken(secret: string, token: string, members: MemberRecord[]) {
  return members.find((member) => memberToken(secret, member.id) === token)?.id;
}

export function chapterToken(secret: string, chapterId: string) {
  return createHash("sha256").update(`${secret}:chapter:${chapterId}`).digest("hex");
}

export function matchesChapter(value: string | undefined, chapterId: string) {
  const key = (value ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  return key === chapterId || key.replace(/[^a-z-]/g, "") === chapterId;
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${randomBytes(3).toString("hex")}`;
}

export function membershipNo() {
  const year = new Date().getFullYear();
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `IPF-UAE-${year}-${suffix}`;
}

export function yuvaId() {
  return `YUVA-UAE-${randomBytes(3).toString("hex").toUpperCase()}`;
}
