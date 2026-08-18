import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-lg border border-[var(--ipf-line)] bg-white px-3.5 py-3 text-sm leading-6 text-[var(--ipf-ink)] shadow-sm transition",
        "placeholder:text-[var(--ipf-muted)]/70",
        "focus-visible:border-[var(--ipf-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ipf-navy)]/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
