import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import { InquiryForm } from "../components/forms/InquiryForm";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";
import { PageExtras } from "../cms/PageExtras";

/* ───────────────────────────────────────────────────────────────────────
 * ContactPage — approved illustrated hero + refined contact layout.
 *
 * HERO ARTWORK: /images/contact/contact-hero.{webp,png}
 *   (Watercolour UAE Waterfront Skyline Panorama — 1774×887)
 *
 * The artwork is text-free, so the real HTML heading sits over it in the
 * natural ivory/sky negative space at the horizontal centre. The hero
 * is controlled to banner heights (not full natural aspect) so the page
 * doesn't become excessively tall at wide viewports:
 *   mobile  280px → sm 320px → md 380px → lg 440px → xl 480px → 2xl 520px.
 * object-position: center 40% biases the crop toward the horizon (flag,
 * Burj Khalifa, mosque, India Gate) and sacrifices some of the water
 * foreground when necessary at wide/short container ratios.
 *
 * Below the hero the InquiryForm and the contact-information cards are
 * presented in a two-column grid at lg+, with a soft section header
 * introducing the form area. All authoritative contact information
 * continues to come from src/data/site (office, email, Abu Dhabi,
 * Business Council, Grievances) — no data was fabricated or renamed.
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";

export default function ContactPage() {
  const { t } = useLocale();
  return (
    <>
      <DocumentTitle title={t("page.contact.title")} />

      {/* ──────────────── HERO ──────────────── */}
      <section
        aria-labelledby="contact-page-heading"
        className="relative isolate overflow-hidden bg-[#FFF8EE]"
      >
        <div className="relative h-[280px] w-full sm:h-[320px] md:h-[380px] lg:h-[440px] xl:h-[480px] 2xl:h-[520px]">
          <picture>
            <source srcSet="/images/contact/contact-hero.webp" type="image/webp" />
            <img
              src="/images/contact/contact-hero.png"
              alt="Watercolour panorama linking India's heritage architecture on the left with the UAE waterfront, Burj Khalifa, UAE flag and mosque on the right."
              loading="eager"
              fetchPriority="high"
              width={1774}
              height={887}
              className="absolute inset-0 block h-full w-full object-cover"
              style={{ objectPosition: "center 40%" }}
            />
          </picture>

          {/* Centred HTML content over the central sky negative space.
              Subtle ivory wash + backdrop blur ONLY behind the text
              block (not the whole image) ensures contrast without
              darkening the artwork. */}
          <div className="absolute inset-0 flex items-center justify-center px-5">
            <div className="rounded-[18px] bg-[#FFF8EE]/70 px-6 py-5 text-center shadow-[0_6px_20px_rgba(11,31,58,0.08)] ring-1 ring-[#D6AD60]/35 backdrop-blur-sm sm:px-9 sm:py-6 md:px-12 md:py-7 lg:px-14 lg:py-8">
              <p
                className="text-[0.7rem] font-bold uppercase tracking-[0.3em] sm:text-[0.75rem]"
                style={{ color: GOLD_INK }}
              >
                {t("page.contact.eyebrow")}
              </p>
              <h1
                id="contact-page-heading"
                className="mt-2 font-serif text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[1.95rem] md:text-[2.25rem] lg:text-[2.55rem]"
                style={{ color: NAVY }}
              >
                {t("page.contact.title")}
              </h1>
              <div
                aria-hidden="true"
                className="mx-auto mt-3 h-px w-14"
                style={{ backgroundColor: `${GOLD}99` }}
              />
              <p
                className="mx-auto mt-3 max-w-xl text-[0.9rem] leading-relaxed sm:text-[0.95rem]"
                style={{ color: INK }}
              >
                {t("page.contact.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── CONTACT BODY ──────────────── */}
      <Section tone="white" className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-10 flex items-center justify-center gap-3 sm:mb-12">
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
              <p
                className="text-[0.7rem] font-bold uppercase tracking-[0.3em]"
                style={{ color: GOLD_INK }}
              >
                Reach IPF UAE
              </p>
              <span aria-hidden="true" className="inline-block h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14">
              <div className="min-w-0">
                <h2
                  className="font-serif text-[1.4rem] font-bold leading-tight tracking-tight sm:text-[1.55rem]"
                  style={{ color: NAVY }}
                >
                  Send a message
                </h2>
                <p
                  className="mt-3 max-w-xl text-[0.95rem] leading-relaxed"
                  style={{ color: INK }}
                >
                  Share your query, idea or request below. The relevant chapter or council desk will respond directly.
                </p>
                <div className="mt-6">
                  <InquiryForm intent="contact" />
                </div>
              </div>

              <aside className="min-w-0 space-y-6">
                {/* Registered office */}
                <div className="rounded-[18px] border border-[#D6AD60]/35 bg-[#FFFBF2] p-6 sm:p-7">
                  <div className="flex items-start gap-3">
                    <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" style={{ color: GOLD_INK }} />
                    <div className="min-w-0">
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.26em]" style={{ color: GOLD_INK }}>
                        {t("page.contact.office")}
                      </p>
                      <p className="mt-2 text-[0.95rem] leading-relaxed" style={{ color: INK }}>
                        {site.office}
                      </p>
                      <p className="mt-4 flex items-start gap-2 text-[0.9rem] leading-relaxed">
                        <Mail aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" style={{ color: GOLD_INK }} />
                        <a
                          className="break-all font-semibold underline-offset-2 hover:underline"
                          style={{ color: NAVY }}
                          href={`mailto:${site.email}`}
                        >
                          {site.email}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chapter + council desks */}
                <div className="rounded-[18px] border border-[#D6AD60]/35 bg-[#FFFBF2] p-6 sm:p-7">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.26em]" style={{ color: GOLD_INK }}>
                    {t("page.contact.desks")}
                  </p>
                  <ul className="mt-4 space-y-4 text-[0.92rem] leading-relaxed">
                    <li className="border-b border-[#D6AD60]/25 pb-3">
                      <Link
                        className="font-serif text-[1rem] font-semibold hover:underline"
                        style={{ color: NAVY }}
                        to="/chapters/abu-dhabi"
                      >
                        {t("page.contact.abuDhabi")}
                      </Link>
                      <p className="mt-1.5 flex items-start gap-2">
                        <Mail aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" style={{ color: GOLD_INK }} />
                        <a
                          className="break-all font-medium underline-offset-2 hover:underline"
                          style={{ color: INK }}
                          href={`mailto:${site.abuDhabiEmail}`}
                        >
                          {site.abuDhabiEmail}
                        </a>
                      </p>
                    </li>
                    <li className="border-b border-[#D6AD60]/25 pb-3">
                      <Link
                        className="font-serif text-[1rem] font-semibold hover:underline"
                        style={{ color: NAVY }}
                        to="/councils/business"
                      >
                        {t("page.contact.business")}
                      </Link>
                      <p className="mt-1.5 flex items-start gap-2">
                        <Mail aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" style={{ color: GOLD_INK }} />
                        <a
                          className="break-all font-medium underline-offset-2 hover:underline"
                          style={{ color: INK }}
                          href={`mailto:${site.businessEmail}`}
                        >
                          {site.businessEmail}
                        </a>
                      </p>
                    </li>
                    <li>
                      <p className="font-serif text-[1rem] font-semibold" style={{ color: NAVY }}>
                        {t("page.contact.grievances")}
                      </p>
                      <p className="mt-1.5 flex items-start gap-2">
                        <Mail aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" style={{ color: GOLD_INK }} />
                        <a
                          className="break-all font-medium underline-offset-2 hover:underline"
                          style={{ color: INK }}
                          href={`mailto:${site.grievanceEmail}`}
                        >
                          {site.grievanceEmail}
                        </a>
                      </p>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </Container>
      </Section>

      <PageExtras page="contact" />
    </>
  );
}
