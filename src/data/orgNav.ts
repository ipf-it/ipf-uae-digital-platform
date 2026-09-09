import { chapters, committeeExtended, committeeMembers } from "./platformContent";
import { site } from "./site";

export type OrgNavLink = {
  id: string;
  name: string;
  to: string;
  bullet?: "saffron" | "green" | "navy" | "violet" | "pink";
};

export type CouncilKind = "state" | "special";

export type Council = {
  id: string;
  name: string;
  kind: CouncilKind;
  region: string;
  bullet: NonNullable<OrgNavLink["bullet"]>;
  image: string;
  email: string;
};

const chapterById = Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter]));

/** Display order from the organisation directory. */
export const emirateChapterOrder = [
  "abu-dhabi",
  "dubai",
  "sharjah",
  "ajman",
  "umm-al-quwain",
  "ras-al-khaimah",
  "fujairah",
  "al-ain",
] as const;

export function chapterPath(id: string) {
  return `/chapters/${id}`;
}

export function getChapter(id: string) {
  return chapters.find((chapter) => chapter.id === id);
}

export const chapterImages: Record<string, string> = {
  "abu-dhabi": "/legacy-assets/images/india-uae.jpg",
  dubai: "/legacy-assets/images/dsf.jpg",
  sharjah: "/legacy-assets/images/covid-check-point-sharjah.jpg",
  ajman: "/legacy-assets/images/news1.jpg",
  "al-ain": "/legacy-assets/images/community-support.png",
  "umm-al-quwain": "/legacy-assets/images/glimpse.jpg",
  "ras-al-khaimah": "/legacy-assets/images/glimses2.jpg",
  fujairah: "/legacy-assets/images/gallery3.jpg",
};

export const emirateNavItems: OrgNavLink[] = emirateChapterOrder.map((id) => ({
  id,
  name: chapterById[id]?.name ?? id,
  to: chapterPath(id),
  bullet: "saffron",
}));

const stateImage = "/legacy-assets/images/india-uae.jpg";

export const stateCouncilRecords: Council[] = [
  { id: "kerala", name: "Kerala Council", kind: "state", region: "Kerala", bullet: "green", image: stateImage, email: site.email },
  { id: "karnataka", name: "Karnataka Council", kind: "state", region: "Karnataka", bullet: "green", image: stateImage, email: site.email },
  { id: "andhra-pradesh", name: "Andhra Pradesh Council", kind: "state", region: "Andhra Pradesh", bullet: "green", image: stateImage, email: site.email },
  { id: "telangana", name: "Telangana Council", kind: "state", region: "Telangana", bullet: "green", image: stateImage, email: site.email },
  { id: "tamil-nadu", name: "Tamil Nadu Council", kind: "state", region: "Tamil Nadu", bullet: "green", image: stateImage, email: site.email },
  { id: "maharashtra", name: "Maharashtra Council", kind: "state", region: "Maharashtra", bullet: "green", image: stateImage, email: site.email },
  { id: "gujarat", name: "Gujarat Council", kind: "state", region: "Gujarat", bullet: "green", image: stateImage, email: site.email },
  { id: "punjab", name: "Punjab Council", kind: "state", region: "Punjab", bullet: "green", image: stateImage, email: site.email },
  { id: "rajasthan", name: "Rajasthan Council", kind: "state", region: "Rajasthan", bullet: "green", image: stateImage, email: site.email },
  { id: "uttar-pradesh", name: "Uttar Pradesh Council", kind: "state", region: "Uttar Pradesh", bullet: "green", image: stateImage, email: site.email },
  { id: "bihar", name: "Bihar Council", kind: "state", region: "Bihar", bullet: "green", image: stateImage, email: site.email },
  { id: "assam", name: "Assam Council", kind: "state", region: "Assam", bullet: "green", image: stateImage, email: site.email },
  { id: "odisha", name: "Odisha Council", kind: "state", region: "Odisha", bullet: "green", image: stateImage, email: site.email },
  { id: "west-bengal", name: "West Bengal Council", kind: "state", region: "West Bengal", bullet: "green", image: stateImage, email: site.email },
  { id: "madhya-pradesh", name: "Madhya Pradesh Council", kind: "state", region: "Madhya Pradesh", bullet: "green", image: stateImage, email: site.email },
  { id: "haryana", name: "Haryana Council", kind: "state", region: "Haryana", bullet: "green", image: stateImage, email: site.email },
  { id: "jharkhand", name: "Jharkhand Council", kind: "state", region: "Jharkhand", bullet: "green", image: stateImage, email: site.email },
  { id: "chhattisgarh", name: "Chhattisgarh Council", kind: "state", region: "Chhattisgarh", bullet: "green", image: stateImage, email: site.email },
  { id: "uttarakhand", name: "Uttarakhand Council", kind: "state", region: "Uttarakhand", bullet: "green", image: stateImage, email: site.email },
  { id: "himachal-pradesh", name: "Himachal Pradesh Council", kind: "state", region: "Himachal Pradesh", bullet: "green", image: stateImage, email: site.email },
  { id: "goa", name: "Goa Council", kind: "state", region: "Goa", bullet: "green", image: stateImage, email: site.email },
  { id: "arunachal-pradesh", name: "Arunachal Pradesh Council", kind: "state", region: "Arunachal Pradesh", bullet: "green", image: stateImage, email: site.email },
  { id: "manipur", name: "Manipur Council", kind: "state", region: "Manipur", bullet: "green", image: stateImage, email: site.email },
  { id: "meghalaya", name: "Meghalaya Council", kind: "state", region: "Meghalaya", bullet: "green", image: stateImage, email: site.email },
  { id: "mizoram", name: "Mizoram Council", kind: "state", region: "Mizoram", bullet: "green", image: stateImage, email: site.email },
  { id: "nagaland", name: "Nagaland Council", kind: "state", region: "Nagaland", bullet: "green", image: stateImage, email: site.email },
  { id: "sikkim", name: "Sikkim Council", kind: "state", region: "Sikkim", bullet: "green", image: stateImage, email: site.email },
  { id: "tripura", name: "Tripura Council", kind: "state", region: "Tripura", bullet: "green", image: stateImage, email: site.email },
];

/** The Indian home-state options for member/Yuva registration — one shared source of truth with
 * the state council directory, so a new registrant is always matched to a real council. */
export const homeStateOptions = stateCouncilRecords.map((council) => ({ value: council.id, label: council.region }));

export const specialCouncilRecords: Council[] = [
  {
    id: "business",
    name: "Business Council",
    kind: "special",
    region: "Professionals and enterprises",
    bullet: "navy",
    image: "/legacy-assets/images/IMG-20211003-WA0135.jpg",
    email: site.businessEmail,
  },
  {
    id: "womens",
    name: "Women's Council",
    kind: "special",
    region: "Women's programmes",
    bullet: "navy",
    image: "/legacy-assets/images/gallery3.jpg",
    email: site.email,
  },
  {
    id: "cultural",
    name: "Cultural Council",
    kind: "special",
    region: "Culture and commemorations",
    bullet: "navy",
    image: "/legacy-assets/images/glimses2.jpg",
    email: site.email,
  },
];

export const councils: Council[] = [...stateCouncilRecords, ...specialCouncilRecords];

export function councilPath(id: string) {
  return `/councils/${id}`;
}

export function getCouncil(id: string) {
  return councils.find((council) => council.id === id);
}

function toNavLink(council: Council): OrgNavLink {
  return { id: council.id, name: council.name, to: councilPath(council.id), bullet: council.bullet };
}

export const stateCouncils: OrgNavLink[] = stateCouncilRecords.map(toNavLink);
export const specialCouncils: OrgNavLink[] = specialCouncilRecords.map(toNavLink);

export const specialCouncilDirectory = specialCouncilRecords.map((council) => ({
  id: council.id,
  name: council.name,
  to: councilPath(council.id),
}));

export function publishedCouncilPeople(id: string) {
  if (id === "business") {
    return committeeExtended.filter((person) => /business council/i.test(person.role));
  }
  if (id === "cultural") {
    return committeeMembers.filter((person) => /cultural/i.test(person.role)).map((person) => ({ name: person.name, role: person.role }));
  }
  const council = getCouncil(id);
  if (council?.kind === "state") {
    return committeeMembers.filter((person) => /state council/i.test(person.role)).map((person) => ({ name: person.name, role: person.role }));
  }
  return [];
}
