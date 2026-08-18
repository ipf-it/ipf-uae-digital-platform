import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type QuoteProps = {
  children: ReactNode;
  attribution?: string;
  className?: string;
  tone?: "light" | "dark";
};

export function Quote({ children, attribution, className = "", tone = "dark" }: QuoteProps) {
  const mark = tone === "dark" ? "text-[var(--ipf-gold)]" : "text-[var(--ipf-saffron)]";
  const body = tone === "dark" ? "text-white" : "text-[var(--ipf-navy)]";
  const credit = tone === "dark" ? "text-white/70" : "text-[var(--ipf-muted)]";

  return (
    <blockquote className={cn("text-center", className)}>
      <div className="relative px-8">
        <span aria-hidden="true" className={cn("pointer-events-none absolute left-0 top-0 select-none text-5xl leading-none", mark)}>
          “
        </span>
        <p className={cn("text-sm font-semibold italic leading-8 sm:text-base", body)}>{children}</p>
        <span aria-hidden="true" className={cn("pointer-events-none absolute bottom-0 right-0 select-none text-5xl leading-none", mark)}>
          ”
        </span>
      </div>
      {attribution ? (
        <footer className={cn("mt-4 text-right text-xs font-semibold uppercase tracking-[0.14em]", credit)}>— {attribution}</footer>
      ) : null}
    </blockquote>
  );
}
