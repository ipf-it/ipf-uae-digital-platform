export const eventCategories = [
  "Community",
  "Cultural",
  "Welfare",
  "Sports",
  "Youth",
  "Religious",
  "National",
] as const;

export type EventCategory = (typeof eventCategories)[number];

export const eventEmirates = [
  { id: "", label: "All Emirates" },
  { id: "dubai", label: "Dubai" },
  { id: "abu-dhabi", label: "Abu Dhabi" },
  { id: "sharjah", label: "Sharjah" },
  { id: "ajman", label: "Ajman" },
  { id: "ras-al-khaimah", label: "RAK" },
  { id: "fujairah", label: "Fujairah" },
  { id: "umm-al-quwain", label: "UAQ" },
  { id: "al-ain", label: "Al Ain" },
  { id: "uae", label: "UAE-wide" },
] as const;

export type PublicEvent = {
  id: string;
  title: string;
  date: string;
  startsAt: string | null;
  location: string;
  emirate: string;
  category: EventCategory;
  isFree: boolean;
  body: string;
  image: string;
  slides: { src: string; alt: string }[];
  published: boolean;
};

export type EventListQuery = {
  tab?: "upcoming" | "past";
  category?: string;
  emirate?: string;
  free?: string | boolean;
};

export function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function isUpcomingEvent(event: Pick<PublicEvent, "startsAt">, now = startOfToday()) {
  if (!event.startsAt) return false;
  const start = new Date(event.startsAt);
  return !Number.isNaN(start.getTime()) && start.getTime() >= now.getTime();
}

export function filterPublicEvents(events: PublicEvent[], query: EventListQuery) {
  const tab = query.tab === "past" ? "past" : "upcoming";
  const category = query.category?.trim();
  const emirate = query.emirate?.trim();
  const freeOnly = query.free === true || query.free === "1" || query.free === "true";

  return events
    .filter((event) => event.published)
    .filter((event) => (tab === "upcoming" ? isUpcomingEvent(event) : !isUpcomingEvent(event)))
    .filter((event) => !category || category === "All" || event.category === category)
    .filter((event) => !emirate || event.emirate === emirate)
    .filter((event) => !freeOnly || event.isFree)
    .sort((a, b) => {
      const aTime = a.startsAt ? new Date(a.startsAt).getTime() : 0;
      const bTime = b.startsAt ? new Date(b.startsAt).getTime() : 0;
      return tab === "upcoming" ? aTime - bTime : bTime - aTime;
    });
}

export function mapEventRow(row: Record<string, unknown>): PublicEvent {
  const slides = Array.isArray(row.slides) ? (row.slides as PublicEvent["slides"]) : [];
  const startsAt = typeof row.starts_at === "string" && row.starts_at ? row.starts_at : null;
  const category = eventCategories.includes(row.category as EventCategory)
    ? (row.category as EventCategory)
    : "Community";
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    date: String(row.event_date ?? ""),
    startsAt,
    location: String(row.location ?? ""),
    emirate: String(row.emirate ?? ""),
    category,
    isFree: row.is_free !== false,
    body: String(row.body ?? ""),
    image: slides[0]?.src ?? "",
    slides,
    published: row.published !== false,
  };
}

const year = 2026;
const defaultImage = "/legacy-assets/images/gallery-7.jpg";

/** Dated 2026 cycle from the published IPF annual programme list. */
export const standingEvents: PublicEvent[] = [
  { id: "cal-2026-hindi-diwas", title: "Vishwa Hindi Diwas", date: "10 January 2026", startsAt: `${year}-01-10T09:00:00+04:00`, location: "UAE chapters", emirate: "uae", category: "Cultural", isFree: true, body: "Central cultural programme marking Vishwa Hindi Diwas.", image: defaultImage, slides: [{ src: defaultImage, alt: "Vishwa Hindi Diwas" }], published: true },
  { id: "cal-2026-republic-day", title: "Republic Day Programme", date: "26 January 2026", startsAt: `${year}-01-26T09:00:00+04:00`, location: "Chapter venues", emirate: "uae", category: "National", isFree: true, body: "Chapter-level Republic Day programmes across the Emirates.", image: "/legacy-assets/images/Ahlan_Modi.jpeg", slides: [{ src: "/legacy-assets/images/Ahlan_Modi.jpeg", alt: "Republic Day Programme" }], published: true },
  { id: "cal-2026-cancer-day", title: "World Cancer Day", date: "4 February 2026", startsAt: `${year}-02-04T09:00:00+04:00`, location: "UAE-wide", emirate: "uae", category: "Welfare", isFree: true, body: "Health awareness programme with the IPF doctors panel.", image: "/legacy-assets/images/community-support.png", slides: [{ src: "/legacy-assets/images/community-support.png", alt: "World Cancer Day" }], published: true },
  { id: "cal-2026-mother-language", title: "International Mother Language Day", date: "21 February 2026", startsAt: `${year}-02-21T09:00:00+04:00`, location: "UAE chapters", emirate: "uae", category: "Cultural", isFree: true, body: "Cultural programmes marking International Mother Language Day.", image: defaultImage, slides: [{ src: defaultImage, alt: "International Mother Language Day" }], published: true },
  { id: "cal-2026-holi", title: "Holi Milan Samaroh", date: "14 March 2026", startsAt: `${year}-03-14T18:00:00+04:00`, location: "Chapter venues", emirate: "uae", category: "Cultural", isFree: true, body: "Chapter Holi gatherings organised by local teams.", image: "/legacy-assets/images/glimses3.jpg", slides: [{ src: "/legacy-assets/images/glimses3.jpg", alt: "Holi Milan Samaroh" }], published: true },
  { id: "cal-2026-tb-day", title: "World TB Day", date: "24 March 2026", startsAt: `${year}-03-24T09:00:00+04:00`, location: "UAE-wide", emirate: "uae", category: "Welfare", isFree: true, body: "Health awareness with the IPF doctors panel.", image: "/legacy-assets/images/community-support.png", slides: [{ src: "/legacy-assets/images/community-support.png", alt: "World TB Day" }], published: true },
  { id: "cal-2026-health-day", title: "World Health Day", date: "7 April 2026", startsAt: `${year}-04-07T09:00:00+04:00`, location: "UAE-wide", emirate: "uae", category: "Welfare", isFree: true, body: "Sports and health team programme for World Health Day.", image: "/legacy-assets/images/community-support.png", slides: [{ src: "/legacy-assets/images/community-support.png", alt: "World Health Day" }], published: true },
  { id: "cal-2026-mothers-day", title: "Mother's Day", date: "10 May 2026", startsAt: `${year}-05-10T18:00:00+04:00`, location: "Chapter venues", emirate: "uae", category: "Community", isFree: true, body: "Community programmes organised with the women's team.", image: "/legacy-assets/images/gallery3.jpg", slides: [{ src: "/legacy-assets/images/gallery3.jpg", alt: "Mother's Day" }], published: true },
  { id: "cal-2026-anti-tobacco", title: "Anti-Tobacco Day", date: "31 May 2026", startsAt: `${year}-05-31T09:00:00+04:00`, location: "UAE-wide", emirate: "uae", category: "Welfare", isFree: true, body: "Awareness programme with the IPF doctors panel.", image: "/legacy-assets/images/community-support.png", slides: [{ src: "/legacy-assets/images/community-support.png", alt: "Anti-Tobacco Day" }], published: true },
  { id: "cal-2026-blood-donor", title: "World Blood Donor Day", date: "14 June 2026", startsAt: `${year}-06-14T09:00:00+04:00`, location: "UAE-wide", emirate: "uae", category: "Welfare", isFree: true, body: "UAE-wide blood donation drive coordinated by central and emirate teams.", image: "/legacy-assets/images/community-support.png", slides: [{ src: "/legacy-assets/images/community-support.png", alt: "World Blood Donor Day" }], published: true },
  { id: "cal-2026-yoga-day", title: "International Yoga Day", date: "21 June 2026", startsAt: `${year}-06-21T07:00:00+04:00`, location: "Every emirate", emirate: "uae", category: "Sports", isFree: true, body: "Chapter yoga sessions across the Emirates.", image: "/legacy-assets/images/gallery-8.jpg", slides: [{ src: "/legacy-assets/images/gallery-8.jpg", alt: "International Yoga Day" }], published: true },
  { id: "cal-2026-doctors-day", title: "Doctors' Day", date: "1 July 2026", startsAt: `${year}-07-01T09:00:00+04:00`, location: "UAE-wide", emirate: "uae", category: "Welfare", isFree: true, body: "Recognition programme with the IPF doctors panel.", image: "/legacy-assets/images/community-support.png", slides: [{ src: "/legacy-assets/images/community-support.png", alt: "Doctors' Day" }], published: true },
  { id: "cal-2026-independence-day", title: "Independence Day", date: "15 August 2026", startsAt: `${year}-08-15T08:00:00+04:00`, location: "Chapter venues", emirate: "uae", category: "National", isFree: true, body: "Independence Day programmes with central and chapter teams.", image: "/legacy-assets/images/Ahlan_Modi.jpeg", slides: [{ src: "/legacy-assets/images/Ahlan_Modi.jpeg", alt: "Independence Day" }], published: true },
  { id: "cal-2026-onam", title: "Onam Celebration", date: "26 August 2026", startsAt: `${year}-08-26T18:00:00+04:00`, location: "Chapter venues", emirate: "uae", category: "Cultural", isFree: true, body: "Onam celebrations organised by cultural and chapter teams.", image: "/legacy-assets/images/glimpse.jpg", slides: [{ src: "/legacy-assets/images/glimpse.jpg", alt: "Onam Celebration" }], published: true },
  { id: "cal-2026-teachers-day", title: "Teachers' Day", date: "5 September 2026", startsAt: `${year}-09-05T18:00:00+04:00`, location: "Chapter venues", emirate: "uae", category: "Community", isFree: true, body: "Teachers' Day programmes with the teachers panel.", image: "/legacy-assets/images/gallery2.jpg", slides: [{ src: "/legacy-assets/images/gallery2.jpg", alt: "Teachers' Day" }], published: true },
  { id: "cal-2026-hindi-utsav", title: "Hindi Utsav", date: "14 September 2026", startsAt: `${year}-09-14T18:00:00+04:00`, location: "Chapter venues", emirate: "uae", category: "Cultural", isFree: true, body: "Hindi Utsav cultural programmes at chapter level.", image: defaultImage, slides: [{ src: defaultImage, alt: "Hindi Utsav" }], published: true },
  { id: "cal-2026-gandhi-jayanti", title: "Gandhi Jayanti", date: "2 October 2026", startsAt: `${year}-10-02T09:00:00+04:00`, location: "Chapter venues", emirate: "uae", category: "National", isFree: true, body: "Gandhi Jayanti commemorations organised by chapter teams.", image: "/legacy-assets/images/gallery-6.jpg", slides: [{ src: "/legacy-assets/images/gallery-6.jpg", alt: "Gandhi Jayanti" }], published: true },
  { id: "cal-2026-food-day", title: "World Food Day / Food Distribution", date: "16 October 2026", startsAt: `${year}-10-16T09:00:00+04:00`, location: "Chapter outreach", emirate: "uae", category: "Welfare", isFree: true, body: "Food distribution and community outreach on World Food Day.", image: "/legacy-assets/images/covid-check-point-sharjah.jpg", slides: [{ src: "/legacy-assets/images/covid-check-point-sharjah.jpg", alt: "World Food Day" }], published: true },
  { id: "cal-2026-diwali", title: "Dussehra & Diwali Samaroh", date: "8 November 2026", startsAt: `${year}-11-08T18:00:00+04:00`, location: "Chapter venues", emirate: "uae", category: "Religious", isFree: true, body: "Dussehra and Diwali gatherings organised by chapter teams.", image: "/legacy-assets/images/glimses2.jpg", slides: [{ src: "/legacy-assets/images/glimses2.jpg", alt: "Dussehra and Diwali Samaroh" }], published: true },
  { id: "cal-2026-uae-national-day", title: "UAE National Day", date: "2 December 2026", startsAt: `${year}-12-02T09:00:00+04:00`, location: "Chapter venues", emirate: "uae", category: "National", isFree: true, body: "UAE National Day programmes organised with chapter teams.", image: "/legacy-assets/images/india-uae.jpg", slides: [{ src: "/legacy-assets/images/india-uae.jpg", alt: "UAE National Day" }], published: true },
];

export const archiveEvents: PublicEvent[] = [
  {
    id: "ahlan-modi",
    title: "AHLAN MODI — Most Cherished Event",
    date: "UAE",
    startsAt: null,
    location: "United Arab Emirates",
    emirate: "uae",
    category: "National",
    isFree: true,
    body: "AHLAN MODI — Most Cherished Event",
    image: "/legacy-assets/images/Ahlan_Modi.jpeg",
    slides: [{ src: "/legacy-assets/images/Ahlan_Modi.jpeg", alt: "AHLAN MODI — most cherished IPF event" }],
    published: true,
  },
  {
    id: "jaishankar-meeting",
    title: "Dr S. Jaishankar Ji meeting with IPF Team",
    date: "2022",
    startsAt: "2022-09-02T10:00:00+04:00",
    location: "UAE",
    emirate: "uae",
    category: "National",
    isFree: true,
    body: "Dr S. Jaishankar, India's External Affairs Minister, interacted with members of the Indian People's Forum (IPF) UAE, and offered full support of the Narendra Modi government in community-focused initiatives.",
    image: "/legacy-assets/images/IMG-20220902-WA0090.jpg",
    slides: [{ src: "/legacy-assets/images/IMG-20220902-WA0090.jpg", alt: "Dr S. Jaishankar meeting with the IPF UAE team" }],
    published: true,
  },
  {
    id: "business-conclave-2021",
    title: "IPF Business Council Conclave 2021",
    date: "2021",
    startsAt: "2021-10-03T10:00:00+04:00",
    location: "Oberoi Hotel, Business Bay, Dubai",
    emirate: "dubai",
    category: "Community",
    isFree: true,
    body: "IPF Business Council Conclave 2021 attended by Shri Piyush Goyal Ji, Shri Deepak Parekh Ji and Shri Prakash Hinduja at the Oberoi Hotel, Business Bay.",
    image: "/legacy-assets/images/IMG-20211003-WA0135.jpg",
    slides: [{ src: "/legacy-assets/images/IMG-20211003-WA0135.jpg", alt: "IPF Business Council Conclave 2021" }],
    published: true,
  },
  {
    id: "hardeep-singh-puri",
    title: "IPF Meeting with Shri Hardeep Singh Puri Ji",
    date: "2021",
    startsAt: "2021-11-17T10:00:00+04:00",
    location: "Abu Dhabi",
    emirate: "abu-dhabi",
    category: "National",
    isFree: true,
    body: "IPF members interact with Shri Hardeep Singh Puri Ji in Abu Dhabi.",
    image: "/legacy-assets/images/IMG-20211117-WA0051.jpg",
    slides: [{ src: "/legacy-assets/images/IMG-20211117-WA0051.jpg", alt: "IPF meeting with Shri Hardeep Singh Puri" }],
    published: true,
  },
  {
    id: "office-inauguration-2021",
    title: "IPF Office Inauguration on 21st Jan 2021",
    date: "21 January 2021",
    startsAt: "2021-01-21T10:00:00+04:00",
    location: "Ajman",
    emirate: "ajman",
    category: "Community",
    isFree: true,
    body: "Indian People's Forum office was inaugurated by Shri V. Muraleedharan, Minister of State for External Affairs, in the UAE. A very proud moment for all our members.",
    image: "/legacy-assets/images/slider1.jpg",
    slides: [{ src: "/legacy-assets/images/slider1.jpg", alt: "IPF office inauguration on 21 January 2021" }],
    published: true,
  },
];

export const catalogSeedEvents = [...standingEvents, ...archiveEvents];

export function cmsEventToPublic(event: {
  id: string;
  title: string;
  date: string;
  location?: string;
  body?: string;
  slides: { src: string; alt: string }[];
  category?: string;
  emirate?: string;
  startsAt?: string;
  isFree?: boolean;
}): PublicEvent {
  const category = eventCategories.includes(event.category as EventCategory)
    ? (event.category as EventCategory)
    : "Community";
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    startsAt: event.startsAt || null,
    location: event.location ?? "",
    emirate: event.emirate ?? "uae",
    category,
    isFree: event.isFree !== false,
    body: event.body ?? "",
    image: event.slides[0]?.src ?? defaultImage,
    slides: event.slides,
    published: true,
  };
}
