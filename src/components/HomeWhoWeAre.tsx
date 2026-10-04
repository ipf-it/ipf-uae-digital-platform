import { Link } from "react-router-dom";
import { useCms } from "../cms/ContentProvider";
import { Container } from "./ui/Container";

/**
 * Homepage Who We Are — a light, premium editorial band set immediately below
 * the President's Message. Replaces the earlier compact ivory block (SectionTitle
 * + two blue buttons + FramedPhoto).
 *
 * Background
 *   Deliberately NOT a reuse of the President's heritage raster. Instead a
 *   CSS/SVG decorative treatment: ivory #FFF8EE base + two subtle gold mandala
 *   washes (upper-right + lower-left) + a thin tricolour accent near the lower
 *   edge. Costs no network byte, cannot visually clash with the President's
 *   banner above, and keeps the centre/right reading area clean.
 *
 * Community image
 *   Pulled from the CMS field content.whoWeAreImage (new in CmsContent). When
 *   the CMS payload omits it, the defaultCmsContent fallback — the approved
 *   IPF Ahlan Modi community gathering photograph — is used. Admins can
 *   replace the image at any time by editing whoWeAreImage on the
 *   /api/cms/content payload; no code change required.
 *
 * CMS-controlled vs static
 *   image + alt text:  CMS (whoWeAreImage.src, whoWeAreImage.alt)
 *   eyebrow / headline / intro / values / CTA label / CTA destination:
 *     static copy approved for this redesign. The useHomeContent text fields
 *     (who_eyebrow / who_title / who_body) are intentionally not consumed
 *     here because the approved redesign copy differs from the current CMS
 *     payload. If the CMS later gains Who We Are-specific text fields, this
 *     component can read them with a trivial swap.
 */

const VALUES = [
  {
    key: "service",
    hindi: "सेवा",
    english: "SERVICE",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-8 w-8">
        <path d="M16 27c-5-3-11-7-11-13a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-6 10-11 13z" />
      </svg>
    ),
  },
  {
    key: "culture",
    hindi: "संस्कृति",
    english: "CULTURE",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-8 w-8">
        {/* lotus silhouette */}
        <path d="M16 25c-5-1-9-5-9-10 2 1 4 2 5 4-1-3 0-7 4-9-1 3 0 6 2 8 1-3 3-5 6-6-1 4-1 7 1 9-3 0-6 2-9 4z" />
        <path d="M9 15c2 3 7 5 7 10" />
        <path d="M23 15c-2 3-7 5-7 10" />
      </svg>
    ),
  },
  {
    key: "community",
    hindi: "समुदाय",
    english: "COMMUNITY",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-8 w-8">
        <circle cx="11" cy="11" r="3.2" />
        <circle cx="21" cy="11" r="3.2" />
        <path d="M5 24c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M15 24c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    ),
  },
] as const;

export function HomeWhoWeAre() {
  const { content } = useCms();
  const image = content.whoWeAreImage ?? {
    src: "/legacy-assets/images/Ahlan_Modi.jpeg",
    alt: "IPF UAE community members at the Ahlan Modi welcome event, Dubai",
  };

  return (
    <section
      aria-labelledby="ipf-who-we-are-eyebrow"
      className="relative isolate overflow-hidden bg-[#FFF8EE]"
    >
      {/* Decorative gold mandala wash — upper-right corner. Low opacity so it
         never competes with the content; aria-hidden because purely decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full opacity-70 sm:-right-32 sm:-top-32 sm:h-96 sm:w-96"
        style={{
          background:
            "radial-gradient(circle, rgba(214,173,96,0.22) 0%, rgba(214,173,96,0.08) 45%, transparent 72%)",
        }}
      />
      {/* Lower-left companion wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full opacity-60 sm:h-80 sm:w-80"
        style={{
          background:
            "radial-gradient(circle, rgba(214,173,96,0.18) 0%, rgba(214,173,96,0.06) 50%, transparent 76%)",
        }}
      />
      {/* Thin flowing tricolour accent near the lower edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] opacity-45"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #FF9933 18%, #FFF8EE 46%, #FFF8EE 54%, #138808 82%, transparent 100%)",
        }}
      />

      <Container className="relative py-10 sm:py-12 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 xl:gap-16">
          {/* LEFT — community image (CMS-controlled). Lazy because the section
             is below the fold on first paint. Aspect ratio reserved to prevent
             CLS. */}
          <div className="min-w-0 order-1">
            <img
              src={image.src}
              alt={image.alt}
              width={1600}
              height={900}
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full rounded-2xl object-cover object-center shadow-[0_14px_38px_rgba(90,15,30,0.14)] ring-1 ring-[#D6AD60]/20 sm:aspect-[16/9]"
            />
          </div>

          {/* RIGHT — eyebrow + headline + intro + values + CTA */}
          <div className="min-w-0 order-2">
            <p
              id="ipf-who-we-are-eyebrow"
              className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[#8B6A1F]"
            >
              Who we are
            </p>
            <h2 className="mt-3 font-serif text-[1.6rem] font-bold leading-[1.15] tracking-tight text-[#5A0F1E] sm:text-[1.95rem] lg:text-[2.25rem]">
              A community united by service, culture and connection.
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[#1c2430] sm:text-base">
              Indian People&rsquo;s Forum UAE is a community platform bringing
              together Indians across the United Arab Emirates through service,
              cultural engagement, leadership and meaningful community
              initiatives.
            </p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-[#1c2430] sm:text-base">
              Through its chapters, councils, volunteers and youth network,
              IPF creates opportunities for people to connect, contribute and
              celebrate India&rsquo;s rich heritage while strengthening the
              bonds of friendship between India and the UAE.
            </p>

            {/* VALUES — thin editorial row with hairline dividers (not cards) */}
            <ul
              role="list"
              className="mt-6 flex items-start justify-between divide-x divide-[#D6AD60]/30 sm:mt-7"
            >
              {VALUES.map((value) => (
                <li
                  key={value.key}
                  className="flex-1 px-2 text-center sm:px-4"
                >
                  <span className="mx-auto block text-[#8B6A1F]">
                    {value.icon}
                  </span>
                  <p className="mt-2 font-serif text-[0.95rem] text-[#5A0F1E] sm:text-base">
                    {value.hindi}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#1c2430] sm:text-[0.7rem]">
                    {value.english}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-7">
              <Link
                to="/about"
                className="group inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-[#5A0F1E] underline-offset-[6px] transition hover:text-[#3A0913] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B6A1F]"
              >
                Discover IPF UAE
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  &rarr;
                </span>
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
