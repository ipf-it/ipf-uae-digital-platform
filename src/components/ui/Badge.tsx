import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type BadgeProps = PropsWithChildren<{
  tone?: "navy" | "saffron" | "green";
}>;

export function Badge({ children, tone = "navy" }: BadgeProps) {
  const toneStyles =
    tone === "saffron"
      ? "border-[var(--ipf-saffron)]/40 bg-[var(--ipf-saffron)]/15 text-[#7a4300]"
      : tone === "green"
        ? "border-[var(--ipf-green)]/30 bg-[var(--ipf-green)]/10 text-[#0b5a06]"
        : "border-white/25 bg-white/10 text-white";

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", toneStyles)}>
      {children}
    </span>
  );
}
