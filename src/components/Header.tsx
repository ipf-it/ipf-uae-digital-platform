import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { useMember } from "../cms/MemberProvider";
import { LanguageToggle } from "./LanguageToggle";
import { primaryNav, utilityLinks } from "../data/navigation";
import { site } from "../data/site";
import { cn } from "../lib/utils";
import { SearchDialog } from "./SearchDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/Accordion";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { useLocale } from "../i18n/LocaleProvider";

type HeaderProps = {
  logoSrc?: string;
};

const navKeys: Record<string, string> = {
  Home: "nav.home",
  About: "nav.about",
  "About IPF": "nav.aboutIpf",
  History: "nav.history",
  Governance: "nav.governance",
  Support: "nav.support",
  Leadership: "nav.leadership",
  "President's Message": "nav.president",
  Committee: "nav.committee",
  Chapters: "nav.chapters",
  Events: "nav.events",
  Gallery: "nav.gallery",
  News: "nav.news",
  Contact: "nav.contact",
  Donate: "nav.donate",
  "IPF Yuva": "nav.yuva",
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
    "rounded-lg px-1.5 py-1.5 leading-tight transition hover:bg-[var(--ipf-ivory)] hover:text-[var(--ipf-green)]",
    active && "text-[var(--ipf-green)]",
  );

export function Header({ logoSrc }: HeaderProps) {
  const { pathname } = useLocation();
  const { member } = useMember();
  const { t } = useLocale();
  const navLabel = (label: string) => t(navKeys[label] ?? label);
  const [open, setOpen] = useState(false);
  const links = utilityLinks.map((item) => {
    if (item.to === "/sign-in" && member) return { label: t("nav.portal"), to: "/portal" };
    if (item.to === "/sign-in") return { ...item, label: t("nav.signIn") };
    if (item.to === "/donate") return { ...item, label: t("nav.donate") };
    if (item.to === "/news") return { ...item, label: t("nav.news") };
    return item;
  });
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const sync = () => {
      document.documentElement.style.setProperty("--ipf-header-h", `${el.offsetHeight}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-40">
      <div className="hidden border-b border-white/10 bg-[var(--ipf-navy)] text-xs text-white/80 md:block">
        <Container className="flex items-center justify-between gap-x-4 py-1.5">
          <p className="min-w-0 truncate pr-2">{t("header.utility")}</p>
          <div className="flex shrink-0 items-center gap-3">
            {links.map((item) => (
              <Link key={item.to} className="rounded-md px-1 py-0.5 transition hover:bg-white/10 hover:text-white" to={item.to}>
                {item.label}
              </Link>
            ))}
            <a className="hidden rounded-md px-1 py-0.5 transition hover:bg-white/10 hover:text-white xl:inline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <LanguageToggle tone="dark" />
          </div>
        </Container>
      </div>
      <div className="border-b border-[var(--ipf-line)] bg-[var(--ipf-paper)]/95 backdrop-blur-md">
        <Container className="flex items-center justify-between gap-3 py-2.5 sm:py-3">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={`${site.name} emblem`}
                className="h-14 w-auto max-w-[min(200px,46vw)] bg-white object-contain object-left sm:h-14 sm:max-w-[240px] xl:h-16"
              />
            ) : (
              <span className="font-bold text-[var(--ipf-navy)]">{site.shortName}</span>
            )}
            <span className="hidden min-w-0 shrink lg:block xl:hidden">
              <span className="block whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ipf-navy)]">
                {site.titleLine}
              </span>
              <span className="mt-0.5 block whitespace-nowrap text-xs text-[var(--ipf-muted)]">{site.tagline}</span>
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-end gap-0.5 overflow-x-auto text-[12.5px] font-medium text-[var(--ipf-navy)] xl:flex">
            <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
              {t("nav.home")}
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
                    {navLabel(group.label)}
                  </NavLink>
                );
              }
              return (
                <div key={group.label} className="group relative">
                  <Link to={group.to} className={cn("inline-flex items-center gap-1", linkClass(active))}>
                    {navLabel(group.label)}
                    <ChevronDown className="size-3.5 opacity-60" />
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 min-w-52 rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] py-2 opacity-0 shadow-[0_16px_40px_rgba(11,31,58,0.12)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    {children.map((child) => (
                      <Link
                        key={child.to + child.label}
                        to={child.to}
                        className="mx-1 block rounded-lg px-3 py-2 text-sm text-[var(--ipf-navy)] hover:bg-[var(--ipf-ivory)] hover:text-[var(--ipf-green)]"
                      >
                        {navLabel(child.label)}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
            <NavLink to="/yuva" className={({ isActive }) => linkClass(isActive)}>
              {t("nav.yuva")}
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => linkClass(isActive)}>
              {t("nav.contact")}
            </NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageToggle className="md:hidden" />
            <SearchDialog />
            <Button asChild size="sm" className="hidden px-3 sm:px-4 lg:inline-flex">
              <Link to="/membership">{t("nav.join")}</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="xl:hidden"
              aria-expanded={open}
              aria-label={open ? t("nav.close") : t("nav.menu")}
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
                {t("nav.home")}
              </Link>
              <Link
                className="block rounded-lg bg-[var(--ipf-ivory)] px-3 py-2.5 text-sm font-semibold text-[var(--ipf-navy)]"
                to={member ? "/portal" : "/sign-in"}
                onClick={() => setOpen(false)}
              >
                {member ? t("nav.portal") : t("nav.signIn")}
              </Link>
              <Link className="block rounded-lg py-2 text-sm font-semibold text-[var(--ipf-navy)]" to="/yuva" onClick={() => setOpen(false)}>
                {t("nav.yuva")}
              </Link>
              <Link className="block rounded-lg py-2 text-sm font-semibold text-[var(--ipf-navy)]" to="/membership" onClick={() => setOpen(false)}>
                {t("nav.joinLong")}
              </Link>
              <Accordion type="single" collapsible className="mt-1">
                {primaryNav
                  .filter((group) => group.children?.length)
                  .map((group) => (
                    <AccordionItem key={group.label} value={group.label}>
                      <AccordionTrigger>{navLabel(group.label)}</AccordionTrigger>
                      <AccordionContent>
                        {group.children?.map((child) => (
                          <Link
                            key={child.to + child.label}
                            to={child.to}
                            className="block rounded-lg py-1.5 pl-1 text-sm text-[var(--ipf-muted)] hover:text-[var(--ipf-navy)]"
                            onClick={() => setOpen(false)}
                          >
                            {navLabel(child.label)}
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
                    {navLabel(group.label)}
                  </Link>
                ))}
              <Link
                className="mt-1 block border-t border-[var(--ipf-line)] py-3 text-sm font-semibold text-[var(--ipf-navy)]"
                to="/donate"
                onClick={() => setOpen(false)}
              >
                {t("nav.donate")}
              </Link>
              <Link className="block py-3 text-sm font-semibold text-[var(--ipf-navy)]" to="/contact" onClick={() => setOpen(false)}>
                {t("nav.contact")}
              </Link>
            </Container>
          </div>
        ) : null}
      </div>
      <div className="ipf-tricolor" />
    </header>
  );
}
