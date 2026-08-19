export type NavLinkItem = {
  label: string;
  to: string;
};

export type NavGroup = {
  label: string;
  to: string;
  children?: NavLinkItem[];
};

export const primaryNav: NavGroup[] = [
  {
    label: "About",
    to: "/about",
    children: [
      { label: "About IPF", to: "/about" },
      { label: "History", to: "/history" },
      { label: "Governance", to: "/governance" },
      { label: "Support", to: "/support" },
    ],
  },
  {
    label: "Leadership",
    to: "/leadership",
    children: [
      { label: "President's Message", to: "/leadership" },
      { label: "Committee", to: "/leadership#committee" },
    ],
  },
  { label: "Chapters", to: "/chapters" },
  { label: "Events", to: "/events" },
  { label: "Gallery", to: "/gallery" },
  { label: "News", to: "/news" },
];

export const mobileTabs: NavLinkItem[] = [
  { label: "Home", to: "/" },
  { label: "Leaders", to: "/leadership" },
  { label: "Events", to: "/events" },
  { label: "Gallery", to: "/gallery" },
  { label: "Join", to: "/membership" },
];

export const utilityLinks: NavLinkItem[] = [
  { label: "Donate", to: "/donate" },
  { label: "News", to: "/news" },
  { label: "Volunteer", to: "/privileges" },
  { label: "Sign In", to: "/sign-in" },
];

export const footerGroups = [
  {
    title: "Organisation",
    links: [
      { label: "About IPF", to: "/about" },
      { label: "Leadership", to: "/leadership" },
      { label: "Chapters", to: "/chapters" },
      { label: "Governance", to: "/governance" },
    ],
  },
  {
    title: "Programmes",
    links: [
      { label: "Events", to: "/events" },
      { label: "News", to: "/news" },
      { label: "Gallery", to: "/gallery" },
      { label: "Support", to: "/support" },
      { label: "Drishti", to: "/drishti" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { label: "Membership", to: "/membership" },
      { label: "Donate", to: "/donate" },
      { label: "Member portal", to: "/portal" },
      { label: "Contact", to: "/contact" },
    ],
  },
] as const;

export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/IPF.uae/" },
  { label: "Instagram", href: "https://www.instagram.com/ipf_uae/" },
  { label: "X / Twitter", href: "https://twitter.com/ipfuae" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCYxVULAR6md3PRWCVljvnZA/featured" },
  { label: "Caring & Sharing", href: "https://www.ipf-uae.com/" },
];
