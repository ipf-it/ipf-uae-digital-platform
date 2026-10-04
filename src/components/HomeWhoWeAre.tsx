import { Link } from "react-router-dom";
import { useCms } from "../cms/ContentProvider";
import { Container } from "./ui/Container";

/**
 * Homepage Who We Are section.
 *
 * Background
 *   The permanent decorative canvas is the APPROVED
 *   /images/home/who-we-are-background.webp
 *   (optimised derivative of the supplied PNG
 *    "Elegant Cream Arabesque Skyline Background.png"). The source PNG also
 *   ships at /images/home/who-we-are-background.png for provenance; a
 *   <picture> element serves WebP first, PNG as the fallback.
 *   object-fit: cover with a slight downward-biased object-position so the
 *   clean ivory centre + lower skyline/tricolour band stay visible while the
 *   upper ornaments crop first at narrow viewports. Decorative only, so the
 *   element is aria-hidden and renders behind the content via absolute
 *   positioning + a negative z-index inside the section's own isolate.
 *
 * Content image (RIGHT column)
 *   Pulled from CMS field content.whoWeAreImage (added in this redesign to
 *   src/cms/types.ts + src/cms/defaults.ts). Independently replaceable from
 *   the admin without any code change. Fallback: the approved IPF Ahlan Modi
 *   community gathering photograph that is already shipping on the site.
 *
 * No animations. Composition is static; the CTA has only a hover underline
 * + a 2 px arrow nudge (both tied to :hover, respecting reduced motion by
 * default — nothing animates on its own).
 */

const BG_WEBP = "/images/home/who-we-are-background.webp";
const BG_PNG = "/images/home/who-we-are-background.png";

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
      {/* Approved decorative background — WebP first, PNG fallback. */}
      <picture aria-hidden="true">
        <source srcSet={BG_WEBP} type="image/webp" />
        <img
          src={BG_PNG}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width={1774}
          height={887}
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[center_55%]"
        />
      </picture>

      <Container className="relative py-12 sm:py-14 lg:py-16">
        {/* Image lives in the LEFT column at ≥lg; text on the RIGHT.
           grid-cols-[1.25fr_1fr] + lg:gap-12 means at a 1440 viewport the
           Container inner (1088 px) splits into ~578 px image + ~462 px
           text, which lands the photograph in the approved 540–600 px
           width band. Container's own max-w-6xl ceiling (1152 px) also
           caps the image at ~578 px even at 1920 so it never grows past
           the 600–620 px upper bound. On mobile the grid collapses to
           one column and the image sits above the text. */}
        <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-12 xl:gap-14">
          {/* RIGHT on desktop — editorial content (≈ 44 % at ≥lg).
             Mobile keeps the content second (order-2) so the photo renders
             first on narrow viewports. */}
          <div className="min-w-0 order-2">
            <p
              id="ipf-who-we-are-eyebrow"
              className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[#8B6A1F]"
            >
              Who we are
            </p>
            <h2 className="mt-3 font-serif text-[1.6rem] font-bold leading-[1.15] tracking-tight text-[var(--ipf-navy)] sm:text-[1.95rem] lg:text-[2.2rem]">
              A community connected by service, culture and purpose.
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[#1c2430] sm:text-base">
              Indian People&rsquo;s Forum UAE brings together Indians across
              the Emirates through community service, cultural engagement,
              leadership and meaningful initiatives.
            </p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-[#1c2430] sm:text-base">
              Working alongside community members, institutions and Indian
              missions, IPF UAE creates opportunities to connect, contribute
              and strengthen the bonds between India and the United Arab
              Emirates.
            </p>
            <p className="mt-6">
              <Link
                to="/about"
                className="group inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-[var(--ipf-navy)] underline-offset-[6px] transition hover:text-[#5A0F1E] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B6A1F]"
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

          {/* LEFT on desktop — CMS-controlled community photograph
             (≈ 56 % at ≥lg). The grid gives the image column slightly more
             width than the text so the photograph reads as a major
             editorial visual rather than a thumbnail. 16:10 is held at
             every width — no shallow banner crop at sm/md. The image
             fills its grid column (w-full, no inner max-w restriction);
             the Container itself (max-w-6xl) is the only upper bound,
             which keeps the photograph around 578 px wide at both 1440
             and 1920 viewports.

             Independent of the decorative background; replaceable via
             the CMS whoWeAreImage field. */}
          <div className="min-w-0 order-1">
            <img
              src={image.src}
              alt={image.alt}
              width={1600}
              height={900}
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full rounded-2xl object-cover object-center shadow-[0_18px_48px_rgba(11,31,58,0.18)] ring-1 ring-[#D6AD60]/30"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
