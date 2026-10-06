import { Link } from "react-router-dom";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { IllustratedHero } from "../components/layout/IllustratedHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { FramedPhoto } from "../components/ui/TricolorFrame";
import { CommitteeHierarchy } from "../components/CommitteeHierarchy";
import { presidentMessageBody } from "../data/platformContent";
import { useLeadership } from "../hooks/useOrgDirectory";
import { img, site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";

export default function LeadershipPage() {
  const { t } = useLocale();
  const { leadership } = useLeadership("global");

  return (
    <>
      <DocumentTitle title={t("page.leadership.title")} />
      <IllustratedHero
        eyebrow={t("page.leadership.eyebrow")}
        title={t("page.leadership.title")}
        description={t("page.leadership.desc", { name: site.president })}
        crumbs={[{ label: t("nav.aboutIpf"), to: "/about" }, { label: t("page.leadership.title") }]}
        /* Approved Leadership artwork: Watercolour Statue of Unity
           Panorama. Sardar Patel + Indian flag + India Gate +
           Parliament-inspired architecture on the right; large warm
           ivory negative space on the left. No overlay, no colour
           wash, no filter — the artwork is a primary visual element. */
        artworkPng="/images/leadership/leadership-hero-statue-of-unity.png"
        artworkWebp="/images/leadership/leadership-hero-statue-of-unity.webp"
        artworkAlt="Watercolour illustration featuring the Statue of Unity and the Indian national flag"
        /* The Statue of Unity + Indian flag sit at roughly 60-85% x in
           the source. At ultra-wide viewports (>= 1920) `object-cover`
           crops vertically because the viewport aspect becomes wider
           than the 2.43:1 source — we therefore anchor the y-position
           to 30% (upper third) so the top of the flag is never clipped
           out of frame. At 1024 and 1440 the horizontal shifts keep
           both statue and flag inside the viewport while the ivory
           text zone on the left remains protected. */
        artworkPosition="object-[72%_center] md:object-[70%_center] lg:object-[65%_center] xl:object-[62%_30%] 2xl:object-[60%_30%]"
        /* Narrow text column so Leadership + description sit entirely
           within the ivory negative-space zone and never run under the
           statue or flag. */
        textMaxWidth="max-w-[440px]"
      />
      <Section tone="white">
        <Container>
          <figure className="mx-auto max-w-[248px] text-center">
            <FramedPhoto
              src={img.president}
              alt={`${site.president}, ${site.presidentRole}`}
              imgClassName="h-72 w-full bg-[var(--ipf-navy)] object-top"
              loading="eager"
            />
            <figcaption className="mt-4">
              <p className="text-lg font-bold text-[var(--ipf-navy)]">{site.president}</p>
              <p className="mt-1 text-sm text-[var(--ipf-muted)]">{site.presidentRole}</p>
            </figcaption>
          </figure>
          <div className="mx-auto mt-6 h-1 w-24 bg-[linear-gradient(90deg,var(--ipf-saffron),#fff,var(--ipf-green))]" />
          <article className="mx-auto mt-8 max-w-3xl space-y-5 text-sm leading-8 text-[var(--ipf-muted)] sm:text-base">
            {presidentMessageBody.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            <div className="pt-2">
              <Button asChild variant="outline">
                <Link to="/membership">{t("nav.joinLong")}</Link>
              </Button>
            </div>
          </article>
        </Container>
      </Section>
      <Section id="committee">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("page.leadership.central")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            {t("page.leadership.committeeBody")}
          </p>
          <div className="mt-10">
            <CommitteeHierarchy entries={leadership} tableCaption={t("page.leadership.extended")} />
          </div>
        </Container>
      </Section>
    </>
  );
}
