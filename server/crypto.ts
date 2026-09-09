import { randomBytes } from "node:crypto";

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
