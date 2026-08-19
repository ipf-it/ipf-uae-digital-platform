function pad(value: number) {
  return String(value).padStart(2, "0");
}

function stamp(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
}

function dateValue(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

const months: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

export function parseEventDate(value?: string, month?: string) {
  if (value) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed);
  }
  if (month && months[month.toLowerCase()] !== undefined) {
    const next = new Date();
    next.setMonth(months[month.toLowerCase()], 1);
    next.setHours(9, 0, 0, 0);
    if (next.getTime() < Date.now()) next.setFullYear(next.getFullYear() + 1);
    return next;
  }
  return new Date();
}

export function downloadIcs(options: { title: string; description?: string; location?: string; date?: string; month?: string }) {
  const start = parseEventDate(options.date, options.month);
  const uid = `${Date.now()}@ipf-uae.org`;
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IPF UAE//Events//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART;VALUE=DATE:${dateValue(start)}`,
    `SUMMARY:${options.title.replace(/\n/g, " ")}`,
    options.description ? `DESCRIPTION:${options.description.replace(/\n/g, " ")}` : "",
    options.location ? `LOCATION:${options.location.replace(/\n/g, " ")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${options.title.replace(/[^\w]+/g, "-").toLowerCase()}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
