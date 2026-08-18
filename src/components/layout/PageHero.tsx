import { Link } from "react-router-dom";
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
};

export function PageHero({ eyebrow, title, description, crumbs = [] }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[var(--ipf-navy)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,58,1)_0%,rgba(11,31,58,0.92)_70%,rgba(19,136,8,0.18)_100%)]" />
      <Container className="relative py-10 sm:py-16">
        {crumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  <span aria-hidden="true">/</span>
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-white">
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
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ipf-gold)]">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-2xl font-bold leading-tight text-white sm:text-4xl">{title}</h1>
        <div className="mt-4 h-1 w-20 bg-[linear-gradient(90deg,var(--ipf-saffron),#fff,var(--ipf-green))]" />
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">{description}</p>
      </Container>
    </section>
  );
}
