import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { socialLinks, caringSharingLink } from "../data/navigation";
import { useLocale } from "../i18n/LocaleProvider";
import { site } from "../data/site";
import { Container } from "./ui/Container";

type FooterInternalLink = { label: string; to: string };
type FooterExternalLink = { label: string; href: string };
type FooterLink = FooterInternalLink | FooterExternalLink;
type FooterColumn = { title: string; links: readonly FooterLink[] };

const isExternalLink = (link: FooterLink): link is FooterExternalLink =>
  "href" in link;

/**
 * Brand-mark icons for social controls. Inline SVGs keep the footer dependency-free —
 * the installed `lucide-react` build does not ship Facebook/Instagram/Twitter/YouTube
 * glyphs. Each path is from the official brand set, drawn on a 24×24 viewBox, uses
 * currentColor so the hover/focus colour transitions apply uniformly.
 */
const SOCIAL_ICONS: Record<string, ReactNode> = {
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.14 8.44 9.94v-7.03H7.9v-2.91h2.54v-2.22c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.8 8.44-4.94 8.44-9.94z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  "X / Twitter": (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.653l-5.214-6.817-5.966 6.817H1.683l7.73-8.835L1.254 2.25h6.829l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.016 3.016 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.121 2.136c1.872.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.016 3.016 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.546 15.569V8.431L15.818 12z" />
    </svg>
  ),
};

/**
 * Footer information architecture, locked to routes that actually exist in src/App.tsx.
 * Intentional omissions (reported to the Founder, not silently dropped):
 *   - "Publications" in Resources: /drishti IS the publications page; a separate /publications
 *     route does not exist yet.
 *   - "Privacy Policy" in Resources and bottom bar: no /privacy-policy route exists.
 *   - "Terms of Use" in bottom bar: no /terms route exists.
 * "Volunteer With Us" links to /membership — the register form carries the volunteer opt-in.
 * "Business Council" uses the live NDA council id (/councils/business).
 */
const footerColumns: readonly FooterColumn[] = [
  {
    title: "Explore",
    links: [
      { label: "About IPF UAE", to: "/about" },
      { label: "Leadership", to: "/leadership" },
      { label: "Chapters & Councils", to: "/chapters" },
      { label: "Events", to: "/events" },
      { label: "News & Media", to: "/news" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { label: "Become a Member", to: "/membership" },
      { label: "Volunteer With Us", to: "/membership" },
      { label: "IPF YUVA", to: "/yuva" },
      { label: "Business Council", to: "/councils/business" },
      { label: "Community Support", to: "/support" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "DRISHTI", to: "/drishti" },
      { label: "Governance", to: "/governance" },
      { label: "Contact", to: "/contact" },
      { label: "Donate", to: "/donate" },
      { label: "Member portal", to: "/portal" },
      // Previously rendered inside the social group — it is a legacy community portal,
      // not a social network. Preserved here with its existing external destination.
      caringSharingLink,
    ],
  },
];

const INDIA_UAE_BG = "/footer-india-uae.webp";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer
      // z-[2] raises the footer above the site-wide fixed TricolorWaves ribbons
      // (.ipf-cloth, position:fixed, z-index:1) so the opaque burgundy artwork covers
      // them where they overlap the footer. The ribbons remain intact everywhere else.
      className="site-footer relative isolate z-[2] overflow-hidden text-white"
      aria-label="Site footer"
    >
      {/* Background: the approved India → UAE panoramic artwork. The <img> is positioned
         absolutely behind every content layer so the composition — India (left) → sunset
         (centre) → UAE (right) — reads intact, and the content sits over it. object-position
         is tuned per breakpoint via CSS below. */}
      {/* object-contain so the entire panorama — gold corner flourishes, palm fronds,
         India + UAE landmarks, sunset, water band and the stylised tricolour wave at
         the bottom — is always visible, never cropped. At viewport widths narrower
         than the image's ~3:1 aspect ratio the image letterboxes to the burgundy base
         below, which matches the artwork's own burgundy sky at the seam. */}
      <img
        src={INDIA_UAE_BG}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={2170}
        height={725}
        className="ipf-footer-art pointer-events-none absolute inset-0 -z-10 h-full w-full object-contain object-center"
      />

      {/* Base burgundy fill that both covers initial load and matches the colour of the
         artwork's own sky so letterbox bands at narrower viewports read as a continuous
         background with no visible seam. */}
      <div
        aria-hidden="true"
        className="ipf-footer-art-base pointer-events-none absolute inset-0 -z-20"
        style={{ backgroundColor: "#5a0f1e" }}
      />

      {/* Container padding reduced ~20% from the pre-tuning values so the burgundy
         wash sits above the fold shorter and the panoramic landmarks come into view
         sooner on scroll. */}
      <Container className="relative pt-10 pb-6 sm:pt-14 sm:pb-8 lg:pt-16 lg:pb-10">
        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-10">
          {/* COLUMN 1 — IPF UAE */}
          <div className="min-w-0">
            <p className="font-serif text-[1.08rem] font-semibold tracking-wide text-white sm:text-[1.15rem]">
              {site.name}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
              Connecting India&rsquo;s diverse communities across the UAE through service,
              culture, leadership and opportunity.
            </p>
            <address className="not-italic mt-4 text-sm leading-relaxed text-white/80">
              {site.office}
              <br />
              <a
                className="underline-offset-2 transition hover:text-[var(--ipf-gold)] hover:underline"
                href={`mailto:${site.email}`}
              >
                {site.email}
              </a>
            </address>

            {/* Social controls — 44x44 buttons meet mobile touch-target guidelines and
               give the brand marks enough presence to be read instantly against the
               panoramic artwork. Light ivory backing circle + gold hover tint keeps the
               treatment tasteful for the IPF footer while preserving platform identity. */}
            <ul className="mt-5 flex flex-wrap items-center gap-3">
              {socialLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    title={item.label}
                    className="group inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white shadow-[0_2px_10px_rgba(0,0,0,0.18)] ring-1 ring-inset ring-white/20
                               transition hover:bg-white hover:text-[#5a0f1e] hover:ring-white
                               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)]"
                  >
                    {SOCIAL_ICONS[item.label] ?? (
                      <span className="text-xs font-semibold">{item.label.slice(0, 2)}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNS 2-4 — EXPLORE / GET INVOLVED / RESOURCES */}
          {footerColumns.map((col) => (
            <div key={col.title} className="min-w-0">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[var(--ipf-gold)]">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((item) => {
                  const key = `${col.title}-${isExternalLink(item) ? item.href : item.to}-${item.label}`;
                  const className =
                    "inline-block rounded-sm text-white/90 underline-offset-4 transition " +
                    "hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-[var(--ipf-gold)]";
                  return (
                    <li key={key}>
                      {isExternalLink(item) ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className={className}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link to={item.to} className={className}>
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

      </Container>

      {/* BOTTOM BAR
         Dravyx AI credit is retained but visually secondary — smaller type and lower
         opacity than the IPF copyright, which remains the first-read on this strip. */}
      <div className="relative border-t border-white/10 bg-[rgba(20,6,12,0.62)] py-3 backdrop-blur-[2px]">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-white/75 sm:flex-row">
          <p className="text-center font-medium sm:text-left">
            &copy; {new Date().getFullYear()} Indian People&rsquo;s Forum UAE. All Rights Reserved.
          </p>
          <p className="text-center text-[0.7rem] text-white/55 sm:text-right">
            {t("footer.powered")}{" "}
            <a
              className="font-medium text-[var(--ipf-gold)]/85 underline-offset-2 transition hover:text-[var(--ipf-gold)] hover:underline"
              href="https://dravyxai.com/"
              target="_blank"
              rel="noreferrer"
            >
              Dravyx AI
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
