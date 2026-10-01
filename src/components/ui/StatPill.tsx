import { cn } from "../../lib/utils";

type StatPillProps = {
  label: string;
  value: string;
  className?: string;
  tone?: "light" | "dark";
};

export function StatPill({ label, value, className, tone = "light" }: StatPillProps) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "rounded-xl border-l-4 border-[var(--ipf-saffron)] px-4 py-3 shadow-[0_4px_14px_rgba(11,31,58,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(11,31,58,0.1)]",
        dark ? "bg-[var(--ipf-navy)]/70" : "bg-[var(--ipf-paper)]",
        className,
      )}
    >
      <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em]", dark ? "text-[var(--ipf-gold)]" : "text-[var(--ipf-muted)]")}>
        {label}
      </p>
      <p className={cn("mt-1 text-lg font-bold", dark ? "text-white" : "text-[var(--ipf-navy)]")}>{value}</p>
    </div>
  );
}
