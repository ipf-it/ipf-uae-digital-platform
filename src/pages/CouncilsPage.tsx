import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card, CardGrid } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { getCouncil, specialCouncilDirectory, stateCouncils } from "../data/orgNav";
import { useLocale } from "../i18n/LocaleProvider";

export default function CouncilsPage() {
  const { t } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (id && getCouncil(id)) navigate(`/councils/${id}`, { replace: true });
  }, [location.hash, navigate]);

  return (
    <>
      <DocumentTitle title={t("nav.councils")} />
      <PageHero
        eyebrow={t("page.councils.eyebrow")}
        title={t("page.councils.title")}
        description={t("page.councils.desc")}
        crumbs={[{ label: t("nav.councils") }]}
      />
      <Section tone="white">
        <Container className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("nav.stateCouncils")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">{t("page.councils.stateBody")}</p>
          <CardGrid columns={3}>
            {stateCouncils.map((council) => (
              <Card
                id={council.id}
                key={council.id}
                className="scroll-mt-28"
                size="sm"
                tone="ivory"
                title={council.name}
                to={council.to}
              />
            ))}
          </CardGrid>
        </Container>
      </Section>
      <Section>
        <Container className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">{t("nav.specialCouncils")}</h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">{t("page.councils.specialBody")}</p>
          <CardGrid columns={2}>
            {specialCouncilDirectory.map((council) => (
              <Card
                id={council.id}
                key={council.id}
                className="scroll-mt-28"
                tone="ivory"
                title={council.name}
                description={t(`page.council.note.${council.id}`)}
                to={council.to}
              />
            ))}
          </CardGrid>
          <p className="text-sm leading-7 text-[var(--ipf-muted)]">
            {t("page.councils.yuvaNote")}{" "}
            <Link className="font-semibold text-[var(--ipf-green)]" to="/yuva">
              {t("nav.yuva")}
            </Link>
          </p>
        </Container>
      </Section>
      <Section tone="white">
        <Container>
          <div className="rounded-xl border border-[#e8a0a8] bg-[#fdf2f2] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-[#c41e3a]">
                <Phone className="size-4" />
                {t("nav.ipfCares")}
              </p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ipf-muted)]">{t("page.councils.caresBody")}</p>
            </div>
            <Button asChild className="mt-4 sm:mt-0">
              <Link to="/support#community">{t("nav.support")}</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
