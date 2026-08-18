import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type SectionProps = PropsWithChildren<{
  id?: string;
  tone?: "ivory" | "white" | "navy";
  className?: string;
}>;

export function Section({ id, tone = "ivory", className, children }: SectionProps) {
  const toneClass =
    tone === "white"
      ? "bg-[var(--ipf-paper)]"
      : tone === "navy"
        ? "bg-[var(--ipf-navy)] text-white"
        : "bg-[var(--ipf-ivory)]";

  return (
    <section id={id} className={cn("relative z-10 py-12 sm:py-16 lg:py-20", toneClass, className)}>
      {children}
    </section>
  );
}
