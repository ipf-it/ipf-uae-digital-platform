import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export type AccountKind = "member" | "yuva";


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

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newToken() {
  return randomBytes(32).toString("hex");
}

export function membershipNo(sequence?: number) {
  if (sequence) return `IPFM-${String(sequence).padStart(4, "0")}`;
  return `IPFM-${randomBytes(3).readUIntBE(0, 3).toString().padStart(7, "0")}`;
}

export function yuvaId(sequence?: number) {
  if (sequence) return `IPFY-${String(sequence).padStart(4, "0")}`;
  return `IPFY-${randomBytes(3).readUIntBE(0, 3).toString().padStart(7, "0")}`;
}

export function eventRegistrationNo() {
  const year = new Date().getFullYear();
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `EVT-${year}-${suffix}`;
}

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

export function matchesChapter(value: string | undefined, chapterId: string) {
  const key = (value ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  return key === chapterId || key.replace(/[^a-z-]/g, "") === chapterId;
}
