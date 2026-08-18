import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full rounded-lg border border-[var(--ipf-line)] bg-white px-3.5 text-sm text-[var(--ipf-ink)] shadow-sm transition",
        "placeholder:text-[var(--ipf-muted)]/70",
        "focus-visible:border-[var(--ipf-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ipf-navy)]/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--ipf-navy)]",
        className,
      )}
      {...props}
    />
  );
}
