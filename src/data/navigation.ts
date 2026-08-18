export type NavLinkItem = {
  label: string;
  to: string;
};

export type NavGroup = {
  label: string;
  to?: string;
  children: NavLinkItem[];
};

export const primaryNav: NavGroup[] = [
  {
    label: "About",
    to: "/about",
    children: [
      { label: "About IPF", to: "/about" },
      { label: "Vision", to: "/about#vision" },
      { label: "Values", to: "/about#values" },
      { label: "Aims & Objectives", to: "/about#aims" },
      { label: "Our Responsibility", to: "/about#responsibility" },
      { label: "President's Message", to: "/president" },
      { label: "Committee", to: "/committee" },
      { label: "Central Committee", to: "/committee#centralCommittee" },
      { label: "Managing Committee", to: "/committee#managingCommittee" },
      { label: "History", to: "/history" },
      { label: "Bye Law", to: "/governance#bye-law" },
      { label: "Code of Ethics", to: "/governance#ethics" },
      { label: "IT & Media Policy", to: "/governance#it-policy" },
    ],
  },
  {
    label: "Chapters",
    to: "/chapters",
    children: [
      { label: "All UAE Chapters", to: "/chapters" },
      { label: "Dubai", to: "/chapters#dubai" },
      { label: "Abu Dhabi", to: "/chapters#abu-dhabi" },
      { label: "Sharjah", to: "/chapters#sharjah" },
      { label: "Ajman", to: "/chapters#ajman" },
      { label: "Al Ain", to: "/chapters#al-ain" },
      { label: "Umm Al Quwain", to: "/chapters#umm-al-quwain" },
      { label: "Ras Al Khaimah", to: "/chapters#ras-al-khaimah" },
      { label: "Fujairah", to: "/chapters#fujairah" },
    ],
  },
  {
    label: "Gallery",
    to: "/gallery",
    children: [
      { label: "Glimpses of IPF UAE", to: "/gallery" },
      { label: "Discover India", to: "/discover-india" },
      { label: "Explore UAE", to: "/explore-uae" },
    ],
  },
  {
    label: "Resources",
    to: "/news",
    children: [
      { label: "News & Updates", to: "/news" },
      { label: "Events Calendar", to: "/events" },
      { label: "Drishti e-Magazine", to: "/drishti" },
      { label: "Support Activity", to: "/support" },
      { label: "Grievances & Counselling", to: "/support#grievances" },
      { label: "Community Support", to: "/support#community" },
      { label: "Blog", to: "/blog" },
      { label: "Testimonials", to: "/testimonials" },
      { label: "Job Board", to: "/jobs" },
    ],
  },
  {
    label: "Membership",
    to: "/membership",
    children: [
      { label: "How to Join", to: "/membership" },
      { label: "Privileges", to: "/privileges" },
      { label: "Register", to: "/register" },
      { label: "Sign In", to: "/sign-in" },
    ],
  },
];

export const utilityLinks: NavLinkItem[] = [
  { label: "News", to: "/news" },
  { label: "Drishti", to: "/drishti" },
  { label: "Volunteer", to: "/privileges" },
  { label: "Register", to: "/register" },
  { label: "Sign In", to: "/sign-in" },
];

export const footerGroups = [
  {
    title: "Organisation",
    links: [
      { label: "About IPF", to: "/about" },
      { label: "President's Message", to: "/president" },
      { label: "Committee", to: "/committee" },
      { label: "History", to: "/history" },
      { label: "Governance", to: "/governance" },
      { label: "Chapters", to: "/chapters" },
    ],
  },
  {
    title: "Programmes",
    links: [
      { label: "Events Calendar", to: "/events" },
      { label: "Support Activity", to: "/support" },
      { label: "News", to: "/news" },
      { label: "Drishti e-Magazine", to: "/drishti" },
      { label: "Blog", to: "/blog" },
      { label: "Gallery", to: "/gallery" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { label: "Membership", to: "/membership" },
      { label: "Privileges", to: "/privileges" },
      { label: "Contact", to: "/contact" },
      { label: "Testimonials", to: "/testimonials" },
      { label: "Job Board", to: "/jobs" },
      { label: "Register", to: "/register" },
      { label: "Sign In", to: "/sign-in" },
      { label: "Discover India", to: "/discover-india" },
      { label: "Explore UAE", to: "/explore-uae" },
    ],
  },
] as const;

export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/IPF.uae/" },
  { label: "X / Twitter", href: "https://twitter.com/ipfuae" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCYxVULAR6md3PRWCVljvnZA/featured" },
  { label: "Caring & Sharing", href: "https://www.ipf-uae.com/" },
];
