import { Link } from "react-router-dom";
import { site } from "../data/site";
import { Container } from "./ui/Container";

type FooterLink = { label: string; to: string };
type FooterColumn = { title: string; links: readonly FooterLink[] };

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
    // The <footer> itself is kept simple so the two regions below are plain
    // sequential document-flow siblings. isolate+z-[2] stays on the artwork
    // wrapper so it still covers the global fixed TricolorWaves ribbons where
    // they overlap the artwork; the legal strip does not need the elevation
    // because its background is already fully opaque.
    <footer className="site-footer text-white" aria-label="Site footer">
      {/* REGION 1 — Footer artwork + columns.
         The panoramic image is positioned ABSOLUTELY relative to this wrapper
         only, so its bounding box ends at this wrapper's bottom edge. The
         legal strip below is OUTSIDE this wrapper and has no image behind it.
         relative + overflow-hidden clip the artwork to this region exactly.
         z-[2] + isolate raise this region above the site-wide .ipf-cloth
         tricolour ribbons (position:fixed, z-index:1). */}
      <div className="footer-artwork-section relative isolate z-[2] overflow-hidden">
        {/* Full-bleed panoramic artwork — fills the artwork region only.
           object-position tuned per breakpoint:
             mobile  (<768px) : 50% 70%
             tablet  (≥768px) : 50% 60%
             desktop (≥1024px): centre */}
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

        {/* Burgundy fallback — matches the artwork's own sky, visible only
           during initial image load. */}
        <div
          aria-hidden="true"
          className="ipf-footer-art-base pointer-events-none absolute inset-0 -z-20"
          style={{ backgroundColor: "#5a0f1e" }}
        />

        {/* Content: columns, FOLLOW US chip, social icons. Sits in normal
           flow above the image via its own stacking order. */}
        <Container className="relative pt-10 pb-6 sm:pt-14 sm:pb-8 lg:pt-16 lg:pb-10">
        {/* Three-column grid.
             mobile              single column stack
             tablet (md)         col 1 spans both tracks (identity reads its own row);
                                 Explore + Get involved share the row below
             desktop (lg)        1.4fr / 1fr / 1fr — col 1 is wider since it carries
                                 identity + description + FOLLOW US chip + four social
                                 buttons (needs ~212 px minimum for the icon row). */}
        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-10">
          {/* COLUMN 1 — IPF UAE identity + description. The Follow Us label and
             the four social icons that previously sat here have moved out to
             the Get Involved CTA section directly above the footer, so the
             social group exists in exactly one public location. */}
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
      </div>
      {/* /REGION 1 — artwork section ends here. The image bounding box
         terminates at the bottom of .footer-artwork-section above. */}

      {/* REGION 2 — Legal strip.
         Physically BELOW the artwork region in normal document flow. Solid
         #3A0913 fill — no rgba, no backdrop filter, no gradient, no image
         behind it. Copyright on the left, co-builder credit on the right,
         both paragraphs share the exact same font-size / weight / opacity. */}
      <div className="footer-legal-strip relative border-t border-white/10 bg-[#3A0913] py-3">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-white/75 sm:flex-row">
          <p className="text-center font-medium sm:text-left">
            &copy; {new Date().getFullYear()} Indian People&rsquo;s Forum UAE. All Rights Reserved.
          </p>
          <p className="text-center font-medium sm:text-right">
            Co-built and managed by{" "}
            <a
              className="underline-offset-2 transition hover:text-[var(--ipf-gold)] hover:underline"
              href="https://dravyxai.com/"
              target="_blank"
              rel="noreferrer"
            >
              Dravyx AI
            </a>
            {" & "}
            <a
              className="underline-offset-2 transition hover:text-[var(--ipf-gold)] hover:underline"
              href="https://www.jettifi.com/"
              target="_blank"
              rel="noreferrer"
            >
              Jettifi
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
