import { Link } from "react-router-dom";
import { Mail, MapPin, Send } from "lucide-react";
import { InquiryForm } from "../components/forms/InquiryForm";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { Container } from "../components/ui/Container";
import { site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";
import { PageExtras } from "../cms/PageExtras";

/* ───────────────────────────────────────────────────────────────────────
 * ContactPage — premium institutional redesign (6 Oct 2026).
 *
 * HERO: approved Watercolour UAE Waterfront Skyline Panorama
 *   (/images/contact/contact-hero.{webp,png}, 1774×887).
 *   Controlled banner height via clamp(340px, 30vw, 460px) so the hero
 *   never becomes a full-poster on wide monitors. Mobile uses an even
 *   shorter clamp with text-first stacking when overlay contrast is
 *   unreliable.
 *
 * MAIN LAYOUT
 *   One coherent composition inside max-w-[1200px]:
 *     • Left ~62% — "Write to IPF" premium panel wrapping <InquiryForm
 *       variant="bare" /> (functional component preserved — only the
 *       wrapping chrome and submit button label are supplied by this
 *       page).
 *     • Right ~38% — "Get in touch" column with two restrained
 *       information panels (Registered office + Functional desks).
 *   Below that: three-column assistance strip (Community support ·
 *   Volunteer with us · General enquiries), separated by subtle gold
 *   vertical rules on desktop and stacked on mobile.
 *
 * All contact information is sourced from `src/data/site` — nothing
 * fabricated, no invented phone numbers / office hours / departments.
 * ─────────────────────────────────────────────────────────────────── */

const GOLD = "#D6AD60";
const GOLD_INK = "#8B6A1F";
const SAFFRON = "#E8871E";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";
const MUTED = "#55606d";

export default function ContactPage() {
  const { t } = useLocale();

  return (
    <>
      <DocumentTitle title={t("page.contact.title")} />

      {/* ──────────────── HERO — approved banner artwork ──────────────── */}
      <section
        aria-labelledby="contact-page-heading"
        className="relative isolate overflow-hidden bg-[#FFF8EE]"
      >
        <div
          className="relative w-full"
          style={{ height: "clamp(280px, 30vw, 460px)" }}
        >
          <picture>
            <source srcSet="/images/contact/contact-hero.webp" type="image/webp" />
            <img
              src="/images/contact/contact-hero.png"
              alt=""
              aria-hidden="true"
              loading="eager"
              fetchPriority="high"
              width={1774}
              height={887}
              className="absolute inset-0 block h-full w-full object-cover"
              style={{ objectPosition: "center 42%" }}
            />
          </picture>

          {/* Centred HTML heading over the natural light sky area.
              Soft ivory wash + backdrop blur ONLY behind the text block
              preserves watercolour visibility. */}
          <div className="absolute inset-0 flex items-center justify-center px-5">
            <div className="rounded-[18px] bg-[#FFF8EE]/72 px-6 py-5 text-center shadow-[0_8px_22px_rgba(11,31,58,0.1)] ring-1 ring-[#D6AD60]/35 backdrop-blur-[6px] sm:px-9 sm:py-6 md:px-12 md:py-7 lg:px-14 lg:py-8">
              <div className="flex items-center justify-center gap-3">
                <span
                  aria-hidden="true"
                  className="hidden h-px w-8 sm:inline-block"
                  style={{ backgroundColor: `${GOLD}99` }}
                />
                <p
                  className="text-[0.7rem] font-bold uppercase tracking-[0.3em] sm:text-[0.75rem]"
                  style={{ color: GOLD_INK }}
                >
                  {t("page.contact.eyebrow")}
                </p>
                <span
                  aria-hidden="true"
                  className="hidden h-px w-8 sm:inline-block"
                  style={{ backgroundColor: `${GOLD}99` }}
                />
              </div>
              <h1
                id="contact-page-heading"
                className="mt-2 font-serif text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[1.95rem] md:text-[2.25rem] lg:text-[2.5rem]"
                style={{ color: NAVY }}
              >
                Contact IPF UAE
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
                We are here to listen, support and strengthen our community across the UAE.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── MAIN CONTACT COMPOSITION ────────────────
          ONE master two-column grid. Both columns are flex-column
          containers so the "Write to IPF" and "Get in touch" headings
          share the same horizontal baseline. The grid uses
          align-items:stretch at lg+ so both columns reach the same
          vertical height; `flex-1` on the LEFT form panel and on the
          RIGHT Functional-desks panel absorbs any remaining space in
          their column, which makes the bottom edges of the two columns
          align visually.

          Below lg the grid stacks naturally (single column) and the
          flex-1 stretching is a no-op — natural panel heights only. */}
      <section className="relative bg-[#FFF8EE] pb-16 pt-14 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
        <Container>
          <div className="mx-auto max-w-[1160px]">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.72fr)] lg:items-stretch lg:gap-x-12 lg:gap-y-0 xl:gap-x-14">
              {/* ─── LEFT COLUMN ─── */}
              <div className="flex min-w-0 flex-col">
                <header>
                  <h2
                    className="font-serif text-[1.45rem] font-bold leading-tight tracking-tight sm:text-[1.65rem] lg:text-[1.8rem]"
                    style={{ color: NAVY }}
                  >
                    Write to IPF
                  </h2>
                  <p
                    className="mt-2 text-[0.92rem] leading-relaxed"
                    style={{ color: MUTED }}
                  >
                    Fields marked with{" "}
                    <span style={{ color: SAFFRON }} aria-hidden="true">
                      *
                    </span>{" "}
                    are required. Responses are handled by IPF volunteers.
                  </p>
                </header>

                <article className="mt-6 flex flex-1 flex-col overflow-hidden rounded-[22px] border border-[#D6AD60]/35 bg-white px-6 py-7 shadow-[0_14px_38px_rgba(11,31,58,0.08)] sm:px-9 sm:py-8 lg:px-10 lg:py-9">
                  <InquiryForm
                    intent="contact"
                    variant="bare"
                    submitLabel={
                      <span className="inline-flex items-center gap-2">
                        Send message
                        <Send aria-hidden="true" className="size-4" />
                      </span>
                    }
                  />
                </article>
              </div>

              {/* ─── RIGHT COLUMN ─── */}
              <aside className="flex min-w-0 flex-col">
                <header>
                  <h2
                    className="font-serif text-[1.45rem] font-bold leading-tight tracking-tight sm:text-[1.65rem] lg:text-[1.8rem]"
                    style={{ color: NAVY }}
                  >
                    Get in touch
                  </h2>
                  <p className="mt-2 text-[0.92rem] leading-relaxed" style={{ color: MUTED }}>
                    Reach out to our registered office or functional desks for specific queries.
                  </p>
                </header>

                <div className="mt-6 flex flex-1 flex-col gap-5">
                  {/* Registered office panel — also serves as the primary
                      IPF Cares contact destination. SupportPage links to
                      /contact#ipf-cares which lands here via scroll-mt-28. */}
                  <div
                    id="ipf-cares"
                    className="relative scroll-mt-28 overflow-hidden rounded-[18px] border border-[#D6AD60]/35 bg-[#FFFBF2] p-6 shadow-[0_8px_22px_rgba(11,31,58,0.05)] sm:p-7"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border bg-[#FFF8EE]"
                        style={{ borderColor: `${GOLD}80`, color: GOLD_INK }}
                      >
                        <MapPin className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p
                          className="text-[0.7rem] font-bold uppercase tracking-[0.24em]"
                          style={{ color: GOLD_INK }}
                        >
                          {t("page.contact.office")}
                        </p>
                        <p
                          className="mt-2 text-[0.95rem] leading-relaxed whitespace-pre-line"
                          style={{ color: INK }}
                        >
                          {site.office}
                        </p>
                      </div>
                    </div>
                    <div
                      aria-hidden="true"
                      className="my-5 h-px w-full"
                      style={{ backgroundColor: `${GOLD}40` }}
                    />
                    <div className="flex items-start gap-4">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border bg-[#FFF8EE]"
                        style={{ borderColor: `${GOLD}80`, color: GOLD_INK }}
                      >
                        <Mail className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p
                          className="text-[0.7rem] font-bold uppercase tracking-[0.24em]"
                          style={{ color: GOLD_INK }}
                        >
                          {t("common.email")}
                        </p>
                        <p className="mt-2">
                          <a
                            className="break-all text-[0.95rem] font-semibold underline-offset-4 hover:underline"
                            style={{ color: NAVY }}
                            href={`mailto:${site.email}`}
                          >
                            {site.email}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Functional desks panel — flex-1 so it absorbs any
                     remaining column height, pulling its bottom edge in
                     line with the LEFT form panel's bottom. */}
                  <div className="relative flex flex-1 flex-col overflow-hidden rounded-[18px] border border-[#D6AD60]/35 bg-[#FFFBF2] p-6 shadow-[0_8px_22px_rgba(11,31,58,0.05)] sm:p-7">
                    <p
                      className="text-[0.7rem] font-bold uppercase tracking-[0.24em]"
                      style={{ color: GOLD_INK }}
                    >
                      Functional desks
                    </p>
                    <p className="mt-2 text-[0.9rem] leading-relaxed" style={{ color: MUTED }}>
                      For focused assistance, you can also reach:
                    </p>
                    <ul className="mt-4 flex-1 text-[0.93rem] leading-relaxed">
                      <li className="border-b border-[#D6AD60]/25 py-4 first:pt-0 last:border-b-0 last:pb-0">
                        <Link
                          className="font-serif text-[1rem] font-semibold underline-offset-4 hover:underline"
                          style={{ color: NAVY }}
                          to="/chapters/abu-dhabi"
                        >
                          {t("page.contact.abuDhabi")} Chapter
                        </Link>
                        <p className="mt-1.5 flex items-start gap-2">
                          <Mail aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" style={{ color: GOLD_INK }} />
                          <a
                            className="break-all font-medium underline-offset-4 hover:underline"
                            style={{ color: INK }}
                            href={`mailto:${site.abuDhabiEmail}`}
                          >
                            {site.abuDhabiEmail}
                          </a>
                        </p>
                      </li>
                      <li className="border-b border-[#D6AD60]/25 py-4 first:pt-0 last:border-b-0 last:pb-0">
                        <Link
                          className="font-serif text-[1rem] font-semibold underline-offset-4 hover:underline"
                          style={{ color: NAVY }}
                          to="/councils/business"
                        >
                          {t("page.contact.business")}
                        </Link>
                        <p className="mt-1.5 flex items-start gap-2">
                          <Mail aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" style={{ color: GOLD_INK }} />
                          <a
                            className="break-all font-medium underline-offset-4 hover:underline"
                            style={{ color: INK }}
                            href={`mailto:${site.businessEmail}`}
                          >
                            {site.businessEmail}
                          </a>
                        </p>
                      </li>
                      <li className="border-b border-[#D6AD60]/25 py-4 first:pt-0 last:border-b-0 last:pb-0">
                        <p className="font-serif text-[1rem] font-semibold" style={{ color: NAVY }}>
                          {t("page.contact.grievances")}
                        </p>
                        <p className="mt-1.5 flex items-start gap-2">
                          <Mail aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" style={{ color: GOLD_INK }} />
                          <a
                            className="break-all font-medium underline-offset-4 hover:underline"
                            style={{ color: INK }}
                            href={`mailto:${site.grievanceEmail}`}
                          >
                            {site.grievanceEmail}
                          </a>
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </Container>
      </section>

      <PageExtras page="contact" />
    </>
  );
}
