import { Fragment, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { useMember } from "../cms/MemberProvider";
import { LanguageToggle } from "./LanguageToggle";
import { useNav } from "../hooks/useNav";
import { site } from "../data/site";
import { cn } from "../lib/utils";
import { ChaptersMegaMenu, ChaptersMobileList, CouncilsMegaMenu, CouncilsMobileList, MegaColumn, MegaLink } from "./OrgMegaMenu";
import { SearchDialog } from "./SearchDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/Accordion";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { useCms } from "../cms/ContentProvider";
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
  Councils: "nav.councils",
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
    "rounded-lg px-2.5 py-1.5 leading-tight transition hover:bg-[var(--ipf-ivory)] hover:text-[var(--ipf-green)]",
    active && "text-[var(--ipf-green)]",
  );

export function Header({ logoSrc }: HeaderProps) {
  const { pathname } = useLocation();
  const { member } = useMember();
  const { t } = useLocale();
  const { content } = useCms();
  const { primaryNav, utilityLinks } = useNav();
  const headlines = content.news.map((item) => item.title).filter(Boolean);
  const navLabel = (label: string) => t(navKeys[label] ?? label);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState<null | "chapters" | "councils">(null);
  /* Non-mega desktop dropdowns (About, etc.) were previously controlled
     purely by CSS `group-hover` + `group-focus-within`. After clicking a
     child <Link>, React Router navigated BUT the dropdown stayed visible
     because the parent `.group` was still hovered and/or the clicked
     Link retained focus — neither CSS state resets on navigation.
     Switching to React state ties the dropdown lifecycle to actual
     interactions (mouse enter/leave, child click, route change) so the
     menu closes immediately on selection without needing an extra
     outside click. */
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // Donate is intentionally retired from the top announcement bar. The CMS
  // nav payload (/api/nav) may still include it for other consumers, so we
  // filter it out here as the single UI opt-out — the database, admin editor
  // and other Donate links across the site are untouched.
  const links = utilityLinks
    .filter((item) => item.to !== "/donate")
    .map((item) => {
      if (item.to === "/sign-in" && member) return { label: t("nav.portal"), to: "/portal" };
      if (item.to === "/sign-in") return { ...item, label: t("nav.signIn") };
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

  useEffect(() => {
    setOpen(false);
    setMega(null);
    setOpenDropdown(null);
  }, [pathname]);

  /* Close the current desktop dropdown when the user presses Escape.
     Preserves accessibility for keyboard-only users and stops stale
     open menus if focus is on a nested element. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMega(null);
        setOpenDropdown(null);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-40">
      {/* Top announcement bar on burgundy. Desktop-only (md:block). Final
         layout: [LATEST] [ scrolling ticker with thin heritage-gold vertical
         separators between headlines ] [ Sign in ] [ EN ]. Donate and the
         IPF email that previously lived here have been retired from this
         strip — both remain available elsewhere on the site.

         Typography: 14 px / weight 500 / ivory #FFF8EE at 95 % opacity
         for clear reading against the burgundy fill. Links use 90 %
         opacity to recede slightly from the primary ticker. */}
      <div className="hidden border-b border-white/10 bg-[var(--ipf-burgundy)] text-[14px] font-medium text-[#FFF8EE]/95 md:block">
        <Container className="flex items-center justify-between gap-x-4 py-1.5">
          <p className="min-w-0 flex-1 overflow-hidden pr-2">
            {headlines.length > 0 ? (
              <Link to="/news" className="flex items-center gap-2 text-[#FFF8EE]/95 hover:text-[#FFF8EE]">
                <span className="shrink-0 rounded bg-[var(--ipf-saffron)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3A0913]">
                  {t("nav.latest")}
                </span>
                <span className="ipf-ticker min-w-0">
                  {/* The track is doubled so transform:translateX(-50%)
                     reveals the second identical copy at the moment the
                     first finishes — seamless loop with no visible jump.
                     Between every two headlines (except the very first)
                     a thin heritage-gold vertical pipe acts as a premium
                     separator; the pipe is a <span> styled by CSS, not a
                     bullet, so it reads as a quiet divider rather than a
                     list glyph. */}
                  <span className="ipf-ticker-track">
                    {[...headlines, ...headlines].map((headline, index) => (
                      <Fragment key={index}>
                        {index > 0 ? (
                          <span className="ipf-ticker-sep" aria-hidden="true" />
                        ) : null}
                        <span className="ipf-ticker-item">{headline}</span>
                      </Fragment>
                    ))}
                  </span>
                </span>
              </Link>
            ) : (
              <span className="block truncate">{t("header.utility")}</span>
            )}
          </p>
          <div className="flex shrink-0 items-center gap-3">
            {links.map((item) => (
              <Link
                key={item.to}
                className="rounded-md px-1 py-0.5 text-[14px] font-medium text-[#FFF8EE]/90 transition hover:text-[var(--ipf-gold)]"
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
            <LanguageToggle tone="dark" />
          </div>
        </Container>
      </div>
      <div
        className="relative border-b border-[var(--ipf-line)] bg-[var(--ipf-paper)]/95 backdrop-blur-md"
        onMouseLeave={() => {
          setMega(null);
          setOpenDropdown(null);
        }}
      >
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

          {/* Desktop primary navigation.
             Typography: 14 px (previously 12 px) with font-medium — a
             confident institutional read without becoming heavy. Items
             get `px-2.5 py-1.5` so the larger glyph still sits inside a
             comfortable hit area, and `gap-1` keeps breathing room
             without crowding at 1280. Chevrons bump from size-3.5 to
             size-4 to stay proportional. */}
          <nav className="hidden min-w-0 flex-1 items-center justify-end gap-1 overflow-visible text-[14px] font-medium text-[var(--ipf-navy)] xl:flex">
            <NavLink to="/" end className={({ isActive }) => linkClass(isActive)} onMouseEnter={() => setMega(null)}>
              {t("nav.home")}
            </NavLink>
            {primaryNav.map((group) => {
              const children = group.children ?? [];
              const active = isGroupActive(
                pathname,
                group.to,
                children.map((child) => child.to),
              );
              if (group.mega === "chapters" || group.mega === "councils") {
                const megaActive = pathname === group.to || pathname.startsWith(`${group.to}/`);
                return (
                  <div key={group.label} onMouseEnter={() => { setMega(group.mega ?? null); setOpenDropdown(null); }}>
                    <Link
                      to={group.to}
                      className={cn("inline-flex items-center gap-1", linkClass(megaActive))}
                      aria-expanded={mega === group.mega}
                      aria-haspopup="true"
                    >
                      {navLabel(group.label)}
                      <ChevronDown className="size-4 opacity-60" />
                    </Link>
                  </div>
                );
              }
              if (children.length === 0) {
                return (
                  <NavLink
                    key={group.label}
                    to={group.to}
                    className={() => linkClass(active)}
                    onMouseEnter={() => { setMega(null); setOpenDropdown(null); }}
                  >
                    {navLabel(group.label)}
                  </NavLink>
                );
              }
              /* React-state-controlled dropdown. Opens on hover, closes
                 explicitly on child selection (via onNavigate), on mouse
                 leave, on Escape, and on route change. */
              const isOpen = openDropdown === group.label;
              return (
                <div
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => { setMega(null); setOpenDropdown(group.label); }}
                  onMouseLeave={() => setOpenDropdown((prev) => (prev === group.label ? null : prev))}
                >
                  <Link
                    to={group.to}
                    className={cn("inline-flex items-center gap-1", linkClass(active))}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setOpenDropdown(null)}
                  >
                    {navLabel(group.label)}
                    <ChevronDown className="size-3.5 opacity-60" />
                  </Link>
                  <div
                    className={cn(
                      "absolute left-0 top-full z-50 min-w-56 pt-1.5 transition",
                      isOpen ? "visible opacity-100" : "invisible opacity-0",
                    )}
                  >
                    <div className="overflow-hidden rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] shadow-[0_16px_40px_rgba(11,31,58,0.12)]">
                      <MegaColumn
                        title={navLabel(group.label)}
                        titleClass="text-[var(--ipf-navy)]"
                        barClass="bg-[var(--ipf-navy)]"
                      >
                        {children.map((child) => (
                          <MegaLink
                            key={child.to + child.label}
                            to={child.to}
                            label={navLabel(child.label)}
                            bullet="navy"
                            onNavigate={() => setOpenDropdown(null)}
                          />
                        ))}
                      </MegaColumn>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Yuva lives inside the About dropdown now — see primaryNav. */}
            <NavLink to="/contact" className={({ isActive }) => linkClass(isActive)} onMouseEnter={() => setMega(null)}>
              {t("nav.contact")}
            </NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageToggle className="md:hidden" />
            <SearchDialog />
            <Button asChild size="sm" className="hidden px-3 sm:px-4 lg:inline-flex">
              <Link to="/register">{t("nav.join")}</Link>
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
        {mega ? (
          <div className="absolute inset-x-0 top-full z-50 hidden max-h-[calc(100vh-var(--ipf-header-h,4.85rem))] overflow-y-auto border-t border-[var(--ipf-line)] bg-[var(--ipf-paper)] shadow-[0_24px_48px_rgba(11,31,58,0.14)] xl:block">
            <Container>
              {mega === "chapters" ? (
                <ChaptersMegaMenu onNavigate={() => setMega(null)} />
              ) : (
                <CouncilsMegaMenu onNavigate={() => setMega(null)} />
              )}
            </Container>
          </div>
        ) : null}
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
              {/* Yuva lives inside the About accordion group below. */}
              <Link className="block rounded-lg py-2 text-sm font-semibold text-[var(--ipf-navy)]" to="/register" onClick={() => setOpen(false)}>
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
                <AccordionItem value="Chapters">
                  <AccordionTrigger>{t("nav.chapters")}</AccordionTrigger>
                  <AccordionContent>
                    <ChaptersMobileList onNavigate={() => setOpen(false)} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="Councils">
                  <AccordionTrigger>{t("nav.councils")}</AccordionTrigger>
                  <AccordionContent>
                    <CouncilsMobileList onNavigate={() => setOpen(false)} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              {primaryNav
                .filter((group) => !group.children?.length && !group.mega)
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
              <Link className="block py-3 text-sm font-semibold text-[var(--ipf-navy)]" to="/resources" onClick={() => setOpen(false)}>
                {t("nav.resources")}
              </Link>
            </Container>
          </div>
        ) : null}
      </div>
      <div className="ipf-tricolor" />
    </header>
  );
}
