import { Link } from "react-router-dom";
import { footerGroups, socialLinks } from "../data/navigation";
import { useLocale } from "../i18n/LocaleProvider";
import { usePageTheme } from "../lib/PageTheme";
import { site } from "../data/site";
import { Container } from "./ui/Container";

const footerTitleKeys: Record<string, string> = {
  Organisation: "footer.org",
  Programmes: "footer.programmes",
  "Get involved": "footer.involved",
};

const footerLinkKeys: Record<string, string> = {
  "About IPF": "nav.aboutIpf",
  Leadership: "nav.leadership",
  Chapters: "nav.chapters",
  Councils: "nav.councils",
  Governance: "nav.governance",
  Events: "nav.events",
  News: "nav.news",
  Gallery: "nav.gallery",
  Support: "nav.support",
  "IPF Yuva": "nav.yuva",
  Drishti: "nav.drishti",
  Resources: "nav.resources",
  Membership: "nav.membership",
  Donate: "nav.donate",
  "Member portal": "nav.portal",
  Contact: "nav.contact",
};

export function Footer() {
  const { t } = useLocale();
  const { theme } = usePageTheme();
  return (
    <footer
      className="site-footer relative z-10 overflow-hidden bg-[var(--ipf-navy)] text-white/80 transition-colors duration-300"
      style={theme ? { backgroundColor: theme.primary } : undefined}
    >
      <div className="ipf-tricolor" />
      <Container className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm font-semibold text-white">{site.name}</p>
          <p className="mt-3 text-sm leading-7">{t("footer.blurb")}</p>
          <p className="mt-4 text-sm leading-7">
            {site.office}
            <br />
            <a className="rounded-md text-white/90 underline-offset-2 hover:text-white hover:underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-gold)]">
              {t(footerTitleKeys[group.title] ?? group.title)}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {group.links.map((item) => (
                <li key={item.to}>
                  <Link className="rounded-md transition hover:text-white" to={item.to}>
                    {t(footerLinkKeys[item.label] ?? item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-white/10 py-4">
        <Container className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-6">
            {t("footer.official")}
            <span className="mt-1 block">
              {t("footer.powered")}{" "}
              <a
                className="font-semibold text-[var(--ipf-gold)] underline-offset-2 hover:text-white hover:underline"
                href="https://dravyxai.com/"
                target="_blank"
                rel="noreferrer"
              >
                Dravyx AI
              </a>
            </span>
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {socialLinks.map((item) => (
              <a
                key={item.href}
                className="rounded-full border border-white/15 px-3 py-1.5 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                {item.label}
              </a>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}
