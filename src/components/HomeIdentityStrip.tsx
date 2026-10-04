import { Container } from "./ui/Container";

/**
 * Warm ivory hero identity section. Reads as the textual continuation of the
 * WebM hero — not a generic content block — so the composition
 *
 *   WebM video  →  this ivory identity  →  burgundy statistics strip
 *
 * feels like ONE hero experience. Padding is intentionally compact and the
 * main heading is sized at hero typography scale (lg: 48 px, sm: 36 px,
 * mobile: 30 px).
 */
export function HomeIdentityStrip() {
  return (
    <section
      aria-labelledby="ipf-identity-heading"
      className="bg-[#FFF8EE] py-6 sm:py-7 lg:py-9"
    >
      <Container className="text-center">
        <p className="text-[0.75rem] font-bold uppercase tracking-[0.3em] text-[#D6AD60] sm:text-[0.78rem]">
          सेवा · संस्कृति · समुदाय
        </p>
        <h1
          id="ipf-identity-heading"
          className="mt-2 font-serif text-[1.9rem] font-bold leading-[1.08] tracking-tight text-[#5A0F1E] sm:mt-3 sm:text-[2.35rem] lg:text-[3rem]"
        >
          Indian People&rsquo;s Forum UAE
        </h1>
        <div
          aria-hidden="true"
          className="mx-auto mt-3 h-0.5 w-24 rounded-full bg-[linear-gradient(90deg,#FF9933_0_33%,#ffffff_33%_66%,#138808_66%)]"
        />
        {/* At 18 px (lg) the full sentence measures ~907 px. The previous
           max-w-[850px] forced the final words to wrap even though the
           Container has ~1022 px of inner width at 1024 viewport. Lifting
           the ceiling to 1000 px at lg lets the whole sentence sit on one
           line at every width ≥ 1024, while mobile / tablet keep the
           original 850 px reading-width ceiling for natural wrapping. */}
        <p className="mx-auto mt-3 max-w-[850px] text-[0.95rem] leading-relaxed text-[#5C6573] sm:mt-4 sm:text-base lg:max-w-[1000px] lg:text-[1.125rem]">
          Serving the Indian community in the UAE through service, culture,
          leadership and community engagement.
        </p>
      </Container>
    </section>
  );
}
