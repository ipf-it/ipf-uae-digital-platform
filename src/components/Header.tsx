import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { useMember } from "../cms/MemberProvider";
import { primaryNav, utilityLinks } from "../data/navigation";
import { site } from "../data/site";
import { cn } from "../lib/utils";
import { SearchDialog } from "./SearchDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/Accordion";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";

type HeaderProps = {
  logoSrc?: string;
};

function isGroupActive(pathname: string, groupTo: string, childTos: string[]) {
  if (pathname === groupTo || (groupTo !== "/" && pathname.startsWith(`${groupTo}/`))) return true;
  return childTos.some((to) => {
    const path = to.split("#")[0];
    return path !== "/" && pathname === path;
  });
}

const linkClass = (active: boolean) =>
  cn(
    "whitespace-nowrap rounded-lg px-2.5 py-2 transition hover:bg-[var(--ipf-ivory)] hover:text-[var(--ipf-green)]",
    active && "text-[var(--ipf-green)]",
  );

export function Header({ logoSrc }: HeaderProps) {
  const { pathname } = useLocation();
  const { member } = useMember();
  const [open, setOpen] = useState(false);
  const links = utilityLinks.map((item) =>
    item.to === "/sign-in" && member ? { label: "Portal", to: "/portal" } : item,
  );

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden border-b border-white/10 bg-[var(--ipf-navy)] text-xs text-white/80 md:block">
        <Container className="flex items-center justify-between py-2">
          <p>{site.utilityBar}</p>
          <div className="flex items-center gap-5">
            {links.map((item) => (
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
                className="h-9 w-auto max-w-[min(148px,38vw)] bg-white object-contain p-1 sm:h-12 sm:max-w-[240px]"
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

          <nav className="hidden items-center text-sm font-medium text-[var(--ipf-navy)] lg:flex">
            <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
              Home
            </NavLink>
            {primaryNav.map((group) => {
              const children = group.children ?? [];
              const active = isGroupActive(
                pathname,
                group.to,
                children.map((child) => child.to),
              );
              if (children.length === 0) {
                return (
                  <NavLink key={group.label} to={group.to} className={() => linkClass(active)}>
                    {group.label}
                  </NavLink>
                );
              }
              return (
                <div key={group.label} className="group relative">
                  <Link to={group.to} className={cn("inline-flex items-center gap-1", linkClass(active))}>
                    {group.label}
                    <ChevronDown className="size-3.5 opacity-60" />
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 min-w-52 rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] py-2 opacity-0 shadow-[0_16px_40px_rgba(11,31,58,0.12)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    {children.map((child) => (
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
            <NavLink to="/contact" className={({ isActive }) => linkClass(isActive)}>
              Contact
            </NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <SearchDialog />
            <Button asChild size="sm" className="px-3 uppercase sm:px-4">
              <Link to="/membership">{site.joinCta}</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </Container>
        {open ? (
          <div className="border-t border-[var(--ipf-line)] bg-[var(--ipf-paper)] lg:hidden">
            <Container className="max-h-[70vh] overflow-y-auto py-4">
              <Link
                className="block rounded-lg py-2 text-sm font-semibold text-[var(--ipf-navy)]"
                to="/"
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
              <Link
                className="block rounded-lg bg-[var(--ipf-ivory)] px-3 py-2.5 text-sm font-semibold text-[var(--ipf-navy)]"
                to={member ? "/portal" : "/sign-in"}
                onClick={() => setOpen(false)}
              >
                {member ? "Member portal" : "Sign in"}
              </Link>
              <Accordion type="single" collapsible className="mt-1">
                {primaryNav
                  .filter((group) => group.children?.length)
                  .map((group) => (
                    <AccordionItem key={group.label} value={group.label}>
                      <AccordionTrigger>{group.label}</AccordionTrigger>
                      <AccordionContent>
                        {group.children?.map((child) => (
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
              {primaryNav
                .filter((group) => !group.children?.length)
                .map((group) => (
                  <Link
                    key={group.label}
                    className="block rounded-lg py-2 text-sm font-semibold text-[var(--ipf-navy)]"
                    to={group.to}
                    onClick={() => setOpen(false)}
                  >
                    {group.label}
                  </Link>
                ))}
              <Link
                className="mt-1 block border-t border-[var(--ipf-line)] py-3 text-sm font-semibold text-[var(--ipf-navy)]"
                to="/donate"
                onClick={() => setOpen(false)}
              >
                Donate
              </Link>
              <Link
                className="block py-3 text-sm font-semibold text-[var(--ipf-navy)]"
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
