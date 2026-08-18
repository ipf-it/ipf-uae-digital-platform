import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { primaryNav, utilityLinks } from "../data/navigation";
import { site } from "../data/site";
import { cn } from "../lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/Accordion";
import { Button } from "./ui/Button";
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
          <p>{site.utilityBar}</p>
          <div className="flex items-center gap-5">
            {utilityLinks.map((item) => (
              <Link key={item.to} className="rounded-md px-1 py-0.5 transition hover:bg-white/10 hover:text-white" to={item.to}>
                {item.label}
              </Link>
            ))}
            <a className="rounded-md px-1 py-0.5 transition hover:bg-white/10 hover:text-white" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
        </Container>
      </div>
      <div className="border-b border-[var(--ipf-line)] bg-[var(--ipf-paper)]/95 backdrop-blur-md">
        <Container className="flex items-center justify-between gap-3 py-2.5 sm:py-3">
          <Link to="/" className="flex shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={`${site.name} emblem`}
                className="h-9 w-auto max-w-[min(200px,58vw)] bg-white object-contain p-1 sm:h-12 sm:max-w-[240px]"
              />
            ) : (
              <span className="font-bold text-[var(--ipf-navy)]">{site.shortName}</span>
            )}
            <span className="hidden shrink-0 lg:block">
              <span className="block whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ipf-navy)]">
                {site.titleLine}
              </span>
              <span className="mt-0.5 block whitespace-nowrap text-xs text-[var(--ipf-muted)]">{site.tagline}</span>
            </span>
          </Link>

          <nav className="hidden items-center text-sm font-medium text-[var(--ipf-navy)] xl:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-lg px-2.5 py-2 transition hover:bg-[var(--ipf-ivory)] hover:text-[var(--ipf-green)] 2xl:px-3",
                  isActive && "text-[var(--ipf-green)]",
                )
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
                      "inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 transition hover:bg-[var(--ipf-ivory)] hover:text-[var(--ipf-green)] 2xl:px-3",
                      active && "text-[var(--ipf-green)]",
                    )}
                  >
                    {group.label}
                    <ChevronDown className="size-3.5 opacity-60" />
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 min-w-60 rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] py-2 opacity-0 shadow-[0_16px_40px_rgba(11,31,58,0.12)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    {group.children.map((child) => (
                      <Link
                        key={child.to + child.label}
                        to={child.to}
                        className="mx-1 block rounded-lg px-3 py-2 text-sm text-[var(--ipf-navy)] hover:bg-[var(--ipf-ivory)] hover:text-[var(--ipf-green)]"
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
                cn(
                  "whitespace-nowrap rounded-lg px-2.5 py-2 transition hover:bg-[var(--ipf-ivory)] hover:text-[var(--ipf-green)] 2xl:px-3",
                  isActive && "text-[var(--ipf-green)]",
                )
              }
            >
              Contact
            </NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Button asChild size="sm" className="hidden px-4 uppercase sm:inline-flex">
              <Link to="/membership">{site.joinCta}</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="xl:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </Container>
        {open ? (
          <div className="border-t border-[var(--ipf-line)] bg-[var(--ipf-paper)] xl:hidden">
            <Container className="max-h-[70vh] overflow-y-auto py-4">
              <Link className="block rounded-lg py-2 text-sm font-semibold text-[var(--ipf-navy)]" to="/" onClick={() => setOpen(false)}>
                Home
              </Link>
              <Link
                className="block rounded-lg py-2 text-sm font-semibold text-[var(--ipf-navy)]"
                to="/membership"
                onClick={() => setOpen(false)}
              >
                {site.joinCta}
              </Link>
              <Accordion type="single" collapsible className="mt-1">
                {primaryNav.map((group) => (
                  <AccordionItem key={group.label} value={group.label}>
                    <AccordionTrigger>{group.label}</AccordionTrigger>
                    <AccordionContent>
                      {group.children.map((child) => (
                        <Link
                          key={child.to + child.label}
                          to={child.to}
                          className="block rounded-lg py-1.5 pl-1 text-sm text-[var(--ipf-muted)] hover:text-[var(--ipf-navy)]"
                          onClick={() => setOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Link
                className="mt-1 block border-t border-[var(--ipf-line)] py-3 text-sm font-semibold text-[var(--ipf-navy)]"
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
