import { Link } from "react-router-dom";
import { socialLinks } from "../data/navigation";
import { useLocale } from "../i18n/LocaleProvider";
import { site } from "../data/site";
import { Container } from "./ui/Container";

type FooterLink = { label: string; to: string };
type FooterColumn = { title: string; links: readonly FooterLink[] };

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
    ],
  },
];

const INDIA_UAE_BG = "/footer-india-uae.webp";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer
      className="site-footer relative isolate overflow-hidden text-white"
      aria-label="Site footer"
    >
      {/* Background: the approved India → UAE panoramic artwork. The <img> is positioned
         absolutely behind every content layer so the composition — India (left) → sunset
         (centre) → UAE (right) — reads intact, and the content sits over it. object-position
         is tuned per breakpoint via CSS below. */}
      {/* object-position tuning:
          - mobile (<768px): the panoramic image is 2170x725 (≈3:1) and the footer is tall-stack;
            we anchor to bottom-centre so the sunset band + skyline silhouettes stay in view
            under the content, while most of the burgundy sky crops away.
          - tablet (≥768px): shift upward slightly so landmarks + sunset both read.
          - desktop (≥1024px): true centre; the full panorama is visible. */}
      <img
        src={INDIA_UAE_BG}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={2170}
        height={725}
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover
                   object-[50%_82%] md:object-[50%_70%] lg:object-center"
      />

      {/* Base burgundy fill in case the image is still loading; matches the artwork's maroon so
         the first paint doesn't flash a different colour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20"
        style={{ backgroundColor: "#5a0f1e" }}
      />

      {/* Subtle burgundy → transparent → black-at-bottom gradient to anchor text contrast
         without covering the landmarks. The gradient is strongest where the navigation
         columns sit; the central sunset/water band stays open. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10
                   bg-[linear-gradient(180deg,rgba(90,15,30,0.68)_0%,rgba(90,15,30,0.32)_38%,rgba(0,0,0,0.08)_62%,rgba(0,0,0,0.55)_100%)]"
      />

      <Container className="relative pt-16 pb-8 sm:pt-20 sm:pb-10 lg:pt-24 lg:pb-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* COLUMN 1 — IPF UAE */}
          <div className="min-w-0">
            <p className="text-base font-bold tracking-wide text-white">{site.name}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/85">
              Connecting India&rsquo;s diverse communities across the UAE through service,
              culture, leadership and opportunity.
            </p>
            <address className="not-italic mt-5 text-sm leading-relaxed text-white/80">
              {site.office}
              <br />
              <a
                className="underline-offset-2 transition hover:text-[var(--ipf-gold)] hover:underline"
                href={`mailto:${site.email}`}
              >
                {site.email}
              </a>
            </address>

            {/* Social icons / links — real existing socialLinks from src/data/navigation.ts */}
            <ul className="mt-6 flex flex-wrap gap-2 text-xs">
              {socialLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full border border-white/25 bg-white/5 px-3 py-1.5 font-medium tracking-wide transition
                               hover:border-[var(--ipf-gold)]/80 hover:bg-white/10 hover:text-[var(--ipf-gold)]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNS 2-4 — EXPLORE / GET INVOLVED / RESOURCES */}
          {footerColumns.map((col) => (
            <div key={col.title} className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipf-gold)]">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((item) => (
                  <li key={`${col.title}-${item.to}-${item.label}`}>
                    <Link
                      to={item.to}
                      className="inline-block rounded-sm text-white/90 underline-offset-4 transition
                                 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-[var(--ipf-gold)]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BRAND MESSAGE AREA */}
        <div className="mt-14 border-t border-white/10 pt-10 text-center lg:mt-16 lg:pt-12">
          <p className="font-serif text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-[2.1rem]">
            People &amp; Communities
          </p>
          <p className="mt-2 font-serif text-2xl italic leading-tight text-[var(--ipf-gold)] sm:text-3xl lg:text-[2.1rem]">
            Brighter Tomorrows
          </p>
          <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-white/70">
            India <span className="mx-2 text-[var(--ipf-gold)]">•</span> People{" "}
            <span className="mx-2 text-[var(--ipf-gold)]">•</span> Partnership{" "}
            <span className="mx-2 text-[var(--ipf-gold)]">•</span> Progress
          </p>
        </div>
      </Container>

      {/* BOTTOM BAR */}
      <div className="relative border-t border-white/10 bg-[rgba(28,8,14,0.55)] py-4 backdrop-blur-[1px]">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-white/70 sm:flex-row">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Indian People&rsquo;s Forum UAE. All Rights Reserved.
          </p>
          <p className="text-center sm:text-right">
            {t("footer.powered")}{" "}
            <a
              className="font-semibold text-[var(--ipf-gold)] underline-offset-2 transition hover:text-white hover:underline"
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
