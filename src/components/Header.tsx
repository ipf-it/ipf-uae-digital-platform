import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { primaryNav, utilityLinks } from "../data/navigation";
import { site } from "../data/site";
import { cn } from "../lib/utils";
import { Container } from "./ui/Container";

type HeaderProps = {
  logoSrc?: string;
};

function isGroupActive(pathname: string, groupTo: string | undefined, childTos: string[]) {
  if (groupTo && (pathname === groupTo || (groupTo !== "/" && pathname.startsWith(`${groupTo}/`)))) {
    return true;
  }
  return childTos.some((to) => {
    const path = to.split("#")[0];
    return path !== "/" && pathname === path;
  });
}

export function Header({ logoSrc }: HeaderProps) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden border-b border-white/10 bg-[var(--ipf-navy)] text-xs text-white/80 md:block">
        <Container className="flex items-center justify-between py-2">
          <p>Registered socio-cultural organisation • Ajman, United Arab Emirates</p>
          <div className="flex items-center gap-5">
            {utilityLinks.map((item) => (
              <Link key={item.to} className="hover:text-white" to={item.to}>
                {item.label}
              </Link>
            ))}
            <a className="hover:text-white" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
        </Container>
      </div>
      <div className="border-b border-[var(--ipf-line)] bg-[var(--ipf-paper)]">
        <Container className="flex items-center justify-between gap-2 py-2.5 sm:gap-6 sm:py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Indian People's Forum UAE emblem"
                className="h-9 w-auto max-w-[min(200px,58vw)] bg-white object-contain p-1 sm:h-12 sm:max-w-[240px]"
              />
            ) : (
              <span className="font-bold text-[var(--ipf-navy)]">IPF</span>
            )}
            <span className="hidden min-w-0 lg:block">
              <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ipf-navy)]">
                Indian People's Forum
              </span>
              <span className="block text-xs text-[var(--ipf-muted)]">UAE • Community Welfare & Culture</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium text-[var(--ipf-navy)] xl:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn("rounded-md px-3 py-2 hover:text-[var(--ipf-green)]", isActive && "text-[var(--ipf-green)]")
              }
            >
              Home
            </NavLink>
            {primaryNav.map((group) => {
              const active = isGroupActive(
                pathname,
                group.to,
                group.children.map((child) => child.to),
              );
              return (
                <div key={group.label} className="group relative">
                  <Link
                    to={group.to ?? group.children[0].to}
                    className={cn(
                      "inline-flex items-center rounded-md px-3 py-2 hover:text-[var(--ipf-green)]",
                      active && "text-[var(--ipf-green)]",
                    )}
                  >
                    {group.label}
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 min-w-60 border border-[var(--ipf-line)] bg-[var(--ipf-paper)] py-2 opacity-0 shadow-[0_12px_28px_rgba(11,31,58,0.12)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    {group.children.map((child) => (
                      <Link
                        key={child.to + child.label}
                        to={child.to}
                        className="block px-4 py-2 text-sm text-[var(--ipf-navy)] hover:bg-[var(--ipf-ivory)] hover:text-[var(--ipf-green)]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                cn("rounded-md px-3 py-2 hover:text-[var(--ipf-green)]", isActive && "text-[var(--ipf-green)]")
              }
            >
              Contact
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/membership"
              className="hidden shrink-0 rounded-md bg-[var(--ipf-navy)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-[var(--ipf-navy-soft)] sm:inline-flex sm:px-4 sm:text-xs"
            >
              Join IPF
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--ipf-line)] text-[var(--ipf-navy)] xl:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </Container>
        {open ? (
          <div className="border-t border-[var(--ipf-line)] bg-[var(--ipf-paper)] xl:hidden">
            <Container className="max-h-[70vh] space-y-2 overflow-y-auto py-4">
              <Link className="block py-2 text-sm font-semibold text-[var(--ipf-navy)]" to="/" onClick={() => setOpen(false)}>
                Home
              </Link>
              <Link
                className="block py-2 text-sm font-semibold text-[var(--ipf-navy)]"
                to="/membership"
                onClick={() => setOpen(false)}
              >
                Join IPF
              </Link>
              {primaryNav.map((group) => (
                <details key={group.label} className="border-t border-[var(--ipf-line)] pt-2">
                  <summary className="cursor-pointer py-2 text-sm font-semibold text-[var(--ipf-navy)]">
                    {group.label}
                  </summary>
                  <div className="pb-2">
                    {group.children.map((child) => (
                      <Link
                        key={child.to + child.label}
                        to={child.to}
                        className="block py-1.5 pl-3 text-sm text-[var(--ipf-muted)]"
                        onClick={() => setOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
              <Link
                className="block border-t border-[var(--ipf-line)] py-3 text-sm font-semibold text-[var(--ipf-navy)]"
                to="/contact"
                onClick={() => setOpen(false)}
              >
                Contact
              </Link>
            </Container>
          </div>
        ) : null}
      </div>
      <div className="ipf-tricolor" />
    </header>
  );
}
