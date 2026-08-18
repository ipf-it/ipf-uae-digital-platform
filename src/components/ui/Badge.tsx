import { cva, type VariantProps } from "class-variance-authority";
import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", {
  variants: {
    tone: {
      navy: "border-white/25 bg-white/10 text-white",
      saffron: "border-[var(--ipf-saffron)]/40 bg-[var(--ipf-saffron)]/15 text-[#7a4300]",
      green: "border-[var(--ipf-green)]/30 bg-[var(--ipf-green)]/10 text-[#0b5a06]",
      paper: "border-[var(--ipf-line)] bg-white text-[var(--ipf-navy)]",
    },
  },
  defaultVariants: {
    tone: "navy",
  },
});

type BadgeProps = PropsWithChildren<VariantProps<typeof badgeVariants>>;

export function Badge({ children, tone = "navy" }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }))}>{children}</span>;
}
