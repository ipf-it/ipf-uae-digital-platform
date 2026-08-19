import { House, Images, CalendarDays, Users, UserPlus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { mobileTabs } from "../../data/navigation";
import { cn } from "../../lib/utils";

const icons = {
  "/": House,
  "/leadership": Users,
  "/events": CalendarDays,
  "/gallery": Images,
  "/membership": UserPlus,
} as const;

export function MobileTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--ipf-line)] bg-[var(--ipf-paper)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label="Primary"
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
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                  isActive ? "text-[var(--ipf-green)]" : "text-[var(--ipf-muted)]",
                )
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
