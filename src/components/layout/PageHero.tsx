import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocale } from "../../i18n/LocaleProvider";
import { Container } from "../ui/Container";

type Crumb = {
  label: string;
  to?: string;
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  crumbs?: Crumb[];
  image?: string;
  actions?: ReactNode;
};

export function PageHero({ eyebrow, title, description, crumbs = [], image, actions }: PageHeroProps) {
  const { t } = useLocale();
  return (
    <section className="page-hero-themed relative overflow-hidden bg-[var(--ipf-navy)] text-white">
      <div className="page-hero-mandala" aria-hidden="true" />
      <div className="page-hero-weave" aria-hidden="true" />
      {image ? (
        <img src={image} alt="" loading="eager" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-center opacity-35" />
      ) : null}
      <div
        className={
          image
            ? "absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,58,0.88)_0%,rgba(11,31,58,0.72)_70%,rgba(19,136,8,0.18)_100%)]"
            : "absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,58,1)_0%,rgba(11,31,58,0.92)_70%,rgba(19,136,8,0.18)_100%)]"
        }
      />
      <Container className="relative py-10 sm:py-16">
        {crumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-white/70">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/" className="rounded-md px-1 py-0.5 transition hover:bg-white/10 hover:text-white">
                  {t("nav.home")}
                </Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" />
                  {crumb.to ? (
                    <Link to={crumb.to} className="rounded-md px-1 py-0.5 transition hover:bg-white/10 hover:text-white">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <p className="page-hero-eyebrow text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipf-gold)]">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-balance text-2xl font-bold leading-snug break-words text-white sm:text-4xl">{title}</h1>
        <div className="mt-4 h-1 w-20 bg-[linear-gradient(90deg,var(--ipf-saffron),#fff,var(--ipf-green))]" />
        <p className="mt-4 max-w-3xl text-pretty text-sm leading-7 text-white/80 sm:text-base">{description}</p>
        {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
      </Container>
    </section>
  );
}
