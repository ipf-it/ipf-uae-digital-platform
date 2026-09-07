import { useEffect, useRef } from "react";
import { House, Images, CalendarDays, Users, UserPlus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { mobileTabs } from "../../data/navigation";
import { useLocale } from "../../i18n/LocaleProvider";
import { cn } from "../../lib/utils";

const icons = {
  "/": House,
  "/leadership": Users,
  "/events": CalendarDays,
  "/gallery": Images,
  "/membership": UserPlus,
} as const;

const tabKeys: Record<string, string> = {
  Home: "nav.home",
  Leaders: "nav.leadership",
  Events: "nav.events",
  Gallery: "nav.gallery",
  Join: "nav.join",
};

export function MobileTabBar() {
  const { t } = useLocale();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const sync = () => {
      document.documentElement.style.setProperty("--ipf-tabbar-h", `${el.offsetHeight}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--ipf-line)] bg-[var(--ipf-paper)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md xl:hidden"
      aria-label={t("nav.home")}
    >
      <div className="grid grid-cols-5">
        {mobileTabs.map((item) => {
          const Icon = icons[item.to as keyof typeof icons] ?? House;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold leading-tight",
                  isActive ? "text-[var(--ipf-green)]" : "text-[var(--ipf-muted)]",
                )
              }
            >
              <Icon size={18} />
              <span className="max-w-full truncate px-0.5">{tabKeys[item.label] ? t(tabKeys[item.label]) : item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
