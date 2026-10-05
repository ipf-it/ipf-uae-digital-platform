export type NavLinkItem = {
  label: string;
  to: string;
};

export type NavGroup = {
  label: string;
  to: string;
  children?: NavLinkItem[];
  mega?: "chapters" | "councils";
};

export const primaryNav: NavGroup[] = [
  {
    label: "About",
    to: "/about",
    /* Founder-locked About dropdown order (revised 5 Oct 2026 after
       combining History + Governance into one destination):
         About IPF -> History & Governance -> Leadership -> IPF Yuva -> Support
       The former standalone Governance item is retired from this menu;
       /governance redirects to /history (see src/App.tsx). The server
       /api/nav handler's ABOUT_CANONICAL mirror enforces this same
       order so any admin-authored entry in Supabase cannot resurrect
       a Governance child here. */
    children: [
      { label: "About IPF", to: "/about" },
      { label: "History & Governance", to: "/history" },
      { label: "Leadership", to: "/leadership" },
      { label: "IPF Yuva", to: "/yuva" },
      { label: "Support", to: "/support" },
    ],
  },
  { label: "Chapters", to: "/chapters", mega: "chapters" },
  { label: "Councils", to: "/councils", mega: "councils" },
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

// Right-side utility links in the announcement bar. Donate used to live here;
// it has been intentionally retired from the top strip (it still exists on the
// Get Involved section, in the footer navigation, and on dedicated pages).
export const utilityLinks: NavLinkItem[] = [
  { label: "Sign In", to: "/sign-in" },
];

export const footerGroups = [
  {
    title: "Organisation",
    links: [
      { label: "About IPF", to: "/about" },
      { label: "History & Governance", to: "/history" },
      { label: "Leadership", to: "/leadership" },
      { label: "Chapters", to: "/chapters" },
      { label: "Councils", to: "/councils" },
    ],
  },
  {
    title: "Programmes",
    links: [
      { label: "Events", to: "/events" },
      { label: "Activities", to: "/activities" },
      { label: "News", to: "/news" },
      { label: "Gallery", to: "/gallery" },
      { label: "Support", to: "/support" },
      { label: "IPF Yuva", to: "/yuva" },
      { label: "Drishti", to: "/drishti" },
      { label: "Resources", to: "/resources" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { label: "Membership", to: "/membership" },
      { label: "IPF Yuva", to: "/yuva" },
      { label: "Donate", to: "/donate" },
      { label: "Member portal", to: "/portal" },
      { label: "Sponsors", to: "/sponsors" },
      { label: "Contact", to: "/contact" },
    ],
  },
] as const;

/**
 * Social accounts only. Historically "Caring & Sharing" (external link to
 * https://www.ipf-uae.com/) was listed here, which was semantically wrong — it is not
 * a social network. The link itself is preserved on the footer, under Resources, via
 * `caringSharingLink` below.
 */
export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/IPF.uae/" },
  { label: "Instagram", href: "https://www.instagram.com/ipf_uae/" },
  { label: "X / Twitter", href: "https://twitter.com/ipfuae" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCYxVULAR6md3PRWCVljvnZA/featured" },
];

export const caringSharingLink = {
  label: "Caring & Sharing",
  href: "https://www.ipf-uae.com/",
};
