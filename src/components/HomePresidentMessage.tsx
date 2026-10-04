import { Link } from "react-router-dom";
import { useHomeContent } from "../hooks/useHomeContent";
import { useLocale } from "../i18n/LocaleProvider";
import { img, site } from "../data/site";
import { Container } from "./ui/Container";

const HERITAGE_BG = "/backgrounds/ipf-heritage-ivory-background.webp";

/**
 * Homepage President's Message — a light, premium editorial band set on the
 * approved IPF heritage ivory artwork. Replaces the earlier navy card panel.
 *
 * Content wiring (unchanged from the previous implementation):
 *   - president_quote_title / president_quote_body come from the CMS via
 *     useHomeContent() (/api/home-content?locale=…). i18n keys
 *     home.presidentMsg / home.presidentQuote are the fallback copy.
 *   - site.president, site.presidentRole and img.president are the current
 *     identity + photo (today hard-coded in src/data/site.ts — see report).
 *   - 'Read the full message →' routes to /leadership (route unchanged).
 *
 * Nothing about the person is baked into the background artwork — the photo
 * is a separate <img>, and name/role/quote are plain React content. If the
 * President changes, swap site.president / site.presidentRole /
 * img.president (and, if the CMS has the quote, update it there).
 */
export function HomePresidentMessage() {
  const { t } = useLocale();
  const home = useHomeContent();
  const h = (key: keyof NonNullable<typeof home>, fallbackKey: string) =>
    home?.[key] || t(fallbackKey);

  return (
    <section
      aria-labelledby="ipf-president-eyebrow"
      className="relative isolate overflow-hidden bg-[#FFF8EE]"
    >
      {/* Heritage artwork sits as a decorative background. Rendered as an
         <img> rather than a CSS background-image so the browser can treat it
         as a lazy / sized resource and so screen readers can see the
         alt=""/aria-hidden signal that it is decorative. object-cover with a
         right-anchored object-position pulls the busier gold-mandala +
         architectural detail toward the right of the frame, which is where
         the President's portrait will sit on desktop — the left side of the
         frame stays as clean ivory negative space for the quote. */}
      <img
        src={HERITAGE_BG}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={2156}
        height={729}
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[85%_center] opacity-95"
      />

      <Container className="relative py-10 sm:py-12 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-center lg:gap-12">
          {/* LEFT / CENTRE-LEFT — text */}
          <div className="min-w-0 order-2 lg:order-1">
            <p
              id="ipf-president-eyebrow"
              className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[#8B6A1F]"
            >
              {h("president_quote_title", "home.presidentMsg")}
            </p>

            <blockquote className="mt-4 relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-2 -top-6 font-serif text-6xl leading-none text-[#5A0F1E]/25 sm:-left-3 sm:-top-7 sm:text-7xl"
              >
                &ldquo;
              </span>
              <p className="relative font-serif text-[1.2rem] italic leading-[1.5] text-[#1c2430] sm:text-[1.3rem] lg:text-[1.45rem]">
                {h("president_quote_body", "home.presidentQuote")}
              </p>
            </blockquote>

            <footer className="mt-5 not-italic">
              <p className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#5A0F1E]">
                &mdash; {site.president}
              </p>
              <p className="mt-1 text-sm text-[#5c6573]">
                {site.presidentRole}
              </p>
            </footer>

            <p className="mt-6">
              <Link
                to="/leadership"
                className="group inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-[#5A0F1E] underline-offset-[6px] transition hover:text-[#3A0913] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B6A1F]"
              >
                {t("home.readFull")}
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  &rarr;
                </span>
              </Link>
            </p>
          </div>

          {/* RIGHT — portrait. Separate <img>, not baked into the background,
             so the photograph is replaceable without touching the artwork.
             object-position raised slightly so the subject's face reads
             centrally in the 3:4 frame. */}
          <div className="order-1 lg:order-2 lg:justify-self-end">
            <img
              src={img.president}
              alt={`${site.president}, ${site.presidentRole}`}
              decoding="async"
              className="mx-auto block aspect-[3/4] w-[220px] rounded-2xl object-cover object-[center_22%] shadow-[0_14px_38px_rgba(90,15,30,0.18)] ring-1 ring-[#D6AD60]/35 sm:w-[260px] lg:w-[280px]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
