import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { socialLinks } from "../data/navigation";
import { site } from "../data/site";
import { Container } from "./ui/Container";

type FooterLink = { label: string; to: string };
type FooterColumn = { title: string; links: readonly FooterLink[] };

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
 * Simplified footer IA — intentionally narrower than the full sitemap. Only the
 * essential orient-and-act destinations stay. All removed items (News & Media,
 * IPF YUVA, Business Council, Community Support, DRISHTI, Governance, Member
 * portal, Caring & Sharing) remain reachable from the main navigation / their
 * pages — only the permanent footer slot was retired.
 *
 * "Volunteer" → /membership: no dedicated /volunteer route exists in src/App.tsx
 * (verified against the full route list); the member register flow carries the
 * volunteer opt-in.
 */
const footerColumns: readonly FooterColumn[] = [
  {
    title: "Explore",
    links: [
      { label: "About IPF UAE", to: "/about" },
      { label: "Leadership", to: "/leadership" },
      { label: "Chapters & Councils", to: "/chapters" },
      { label: "Events", to: "/events" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { label: "Become a Member", to: "/membership" },
      { label: "Volunteer", to: "/membership" },
      { label: "Donate", to: "/donate" },
    ],
  },
];

const INDIA_UAE_BG = "/footer-india-uae.webp";

export function Footer() {
  return (
    <footer
      // z-[2] raises the footer above the site-wide fixed TricolorWaves ribbons
      // (.ipf-cloth, position:fixed, z-index:1) so the opaque burgundy artwork covers
      // them where they overlap the footer. The ribbons remain intact everywhere else.
      className="site-footer relative isolate z-[2] overflow-hidden text-white"
      aria-label="Site footer"
    >
      {/* Full-bleed panoramic artwork. absolute inset-0 h-full w-full + object-cover
         guarantees the image reaches both viewport edges with no burgundy gutters at
         any width. object-position stays horizontally centred so the sunset / central
         boat remains the first-read; vertical bias is tuned per breakpoint:
           - mobile (<768px): 50% 70% — keeps the lower landmark silhouettes + water
             + tricolour band visible, lets more sky crop off the top where columns sit.
           - tablet (≥768px): 50% 60% — slight below-centre bias for the horizon.
           - desktop (≥1024px): 50% 50% — true centre; wide viewports show the fullest
             India-left / sunset-centre / UAE-right story since container AR is close
             to the image's own ~2.993:1. */}
      <img
        src={INDIA_UAE_BG}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={2170}
        height={725}
        className="ipf-footer-art pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover
                   object-[50%_70%] md:object-[50%_60%] lg:object-center"
      />

      {/* Burgundy fallback shown only while the image is loading or unavailable.
         object-cover guarantees it is never visible as side gutters in steady state. */}
      <div
        aria-hidden="true"
        className="ipf-footer-art-base pointer-events-none absolute inset-0 -z-20"
        style={{ backgroundColor: "#5a0f1e" }}
      />

      {/* Content sits directly over the panoramic artwork — no wrapping panel, no
         backdrop blur, no shadow box. Readability comes from a brighter warm-ivory
         type colour (#FFF8EE) and a restrained text-shadow applied only to prose
         and nav links. Only the FOLLOW US label itself gets a small highlighted
         chip; the social buttons sit free beneath it. */}
      <Container className="relative pt-10 pb-6 sm:pt-14 sm:pb-8 lg:pt-16 lg:pb-10">
        {/* Three-column grid.
             mobile              single column stack
             tablet (md)         col 1 spans both tracks (identity reads its own row);
                                 Explore + Get involved share the row below
             desktop (lg)        1.4fr / 1fr / 1fr — col 1 is wider since it carries
                                 identity + description + FOLLOW US chip + four social
                                 buttons (needs ~212 px minimum for the icon row). */}
        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-10">
          {/* COLUMN 1 — IPF UAE */}
          <div className="min-w-0 md:col-span-2 lg:col-span-1">
            <p
              className="font-serif text-[1.3rem] font-bold tracking-tight text-[#FFF8EE] sm:text-[1.4rem] lg:text-[1.5rem]"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.35)" }}
            >
              {site.name}
            </p>
            <p
              className="mt-3 max-w-sm text-[0.925rem] leading-relaxed text-[#FFF8EE]"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              Connecting India&rsquo;s diverse communities across the UAE through service,
              culture, leadership and opportunity.
            </p>

            {/* FOLLOW US — small highlighted label only. The social buttons sit free
               below it; nothing wraps them. Deep-burgundy chip with gold text + a
               thin gold border keeps it compact and unmistakable. */}
            <div className="mt-6">
              <span
                className="inline-block rounded-md bg-[#5a0f1e] px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-[var(--ipf-gold)] shadow-[0_2px_8px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-[var(--ipf-gold)]/50"
              >
                Follow us
              </span>
              <ul className="mt-4 flex items-center gap-3">
                {socialLinks.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      title={item.label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5a0f1e] shadow-[0_2px_10px_rgba(0,0,0,0.3)] ring-1 ring-inset ring-white/70
                                 transition hover:bg-[var(--ipf-gold)] hover:text-[#5a0f1e] hover:ring-[var(--ipf-gold)]
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
          </div>

          {/* COLUMNS 2-3 — EXPLORE / GET INVOLVED */}
          {footerColumns.map((col) => (
            <div key={col.title} className="min-w-0">
              <p
                className="text-[0.74rem] font-bold uppercase tracking-[0.28em] text-[var(--ipf-gold)]"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
              >
                {col.title}
              </p>
              <ul className="mt-3.5 space-y-2 text-[0.925rem]">
                {col.links.map((item) => (
                  <li key={`${col.title}-${item.to}-${item.label}`}>
                    <Link
                      to={item.to}
                      className="inline-block rounded-sm text-[#FFF8EE] underline-offset-4 transition hover:text-[var(--ipf-gold)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--ipf-gold)]"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      {/* BOTTOM BAR
         Co-builder credit retained but visually secondary — smaller type and lower
         opacity than the IPF copyright, which remains the first-read on this strip.
         Dravyx AI and Jettifi get IDENTICAL gold link treatment — neither partner
         is more prominent than the other. */}
      <div className="relative border-t border-white/10 bg-[rgba(20,6,12,0.62)] py-3 backdrop-blur-[2px]">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-white/75 sm:flex-row">
          <p className="text-center font-medium sm:text-left">
            &copy; {new Date().getFullYear()} Indian People&rsquo;s Forum UAE. All Rights Reserved.
          </p>
          <p className="text-center text-[0.7rem] text-white/55 sm:text-right">
            Co-built by{" "}
            <a
              className="font-medium text-[var(--ipf-gold)]/85 underline-offset-2 transition hover:text-[var(--ipf-gold)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)]"
              href="https://dravyxai.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dravyx AI
            </a>
            {" & "}
            <a
              className="font-medium text-[var(--ipf-gold)]/85 underline-offset-2 transition hover:text-[var(--ipf-gold)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)]"
              href="https://www.jettifi.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Jettifi
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
