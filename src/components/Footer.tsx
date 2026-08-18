import { Link } from "react-router-dom";
import { footerGroups, socialLinks } from "../data/navigation";
import { site } from "../data/site";
import { Container } from "./ui/Container";

export function Footer() {
  return (
    <footer className="relative z-10 bg-[var(--ipf-navy)] text-white/80">
      <div className="ipf-tricolor" />
      <Container className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm font-semibold text-white">{site.name}</p>
          <p className="mt-3 text-sm leading-7">
            A volunteer-driven socio-cultural organisation serving the Indian community across all Emirates through
            welfare, counselling, and cultural unity.
          </p>
          <p className="mt-4 text-sm leading-7">
            {site.office}
            <br />
            <a className="hover:text-white" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-gold)]">{group.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {group.links.map((item) => (
                <li key={item.to}>
                  <Link className="hover:text-white" to={item.to}>
                    {item.label}
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
            This is the official website of Indian People's Forum (IPF), United Arab Emirates. Content is intended for
            public community information and organisational outreach.
          </p>
          <div className="flex flex-wrap gap-4 text-xs">
            {socialLinks.map((item) => (
              <a key={item.href} className="hover:text-white" href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}
