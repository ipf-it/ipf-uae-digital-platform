import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

type PillNavItem = {
  to: string;
  label: string;
};

export function PillNav({ items }: { items: PillNavItem[] }) {
  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            cn(
              "rounded-full border px-4 py-2 text-sm transition",
              isActive
                ? "border-[var(--ipf-navy)] bg-[var(--ipf-navy)] font-semibold text-white shadow-sm"
                : "border-[var(--ipf-line)] bg-white text-[var(--ipf-muted)] hover:border-[var(--ipf-navy)] hover:text-[var(--ipf-navy)]",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

type SegmentedTabsProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  items: { value: T; label: string }[];
};

export function SegmentedTabs<T extends string>({ value, onValueChange, items }: SegmentedTabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onValueChange(item.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              active
                ? "border-[var(--ipf-navy)] bg-[var(--ipf-navy)] font-semibold text-white shadow-sm"
                : "border-[var(--ipf-line)] bg-white text-[var(--ipf-muted)] hover:border-[var(--ipf-navy)] hover:text-[var(--ipf-navy)]",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
