import { Container } from "./ui/Container";

/**
 * Warm ivory identity/message strip. Sits between the cinematic WebM hero and
 * the thin burgundy statistics strip, creating a clean visual break:
 *
 *   WebM hero  →  warm ivory identity strip (this)  →  burgundy stats strip
 *
 * Deliberately shallow typography and generous whitespace — not another hero.
 */
export function HomeIdentityStrip() {
  return (
    <section
      aria-labelledby="ipf-identity-heading"
      className="bg-[#FFF8EE] py-10 sm:py-12 lg:py-14"
    >
      <Container className="text-center">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[var(--ipf-burgundy)] sm:text-[0.75rem]">
          सेवा · संस्कृति · समुदाय
        </p>
        <h2
          id="ipf-identity-heading"
          className="mt-3 font-serif text-2xl font-bold tracking-tight text-[var(--ipf-navy)] sm:text-[1.75rem] lg:text-[2rem]"
        >
          Indian People&rsquo;s Forum UAE
        </h2>
        <div
          aria-hidden="true"
          className="mx-auto mt-4 h-0.5 w-20 rounded-full bg-[linear-gradient(90deg,var(--ipf-saffron)_0_33%,#ffffff_33%_66%,var(--ipf-green)_66%)]"
        />
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ipf-muted)] sm:mt-5 sm:text-base">
          Serving the Indian community in the UAE through service, culture,
          leadership and community engagement.
        </p>
      </Container>
    </section>
  );
}
