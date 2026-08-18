import type { ComponentProps, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

export function Table({ className, children, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] shadow-[0_8px_24px_rgba(11,31,58,0.06)]">
      <table className={cn("w-full min-w-[36rem] text-left text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("bg-[var(--ipf-navy)] text-white", className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-[var(--ipf-line)]", className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("transition hover:bg-[var(--ipf-ivory)]/80", className)} {...props} />;
}

export function TableHeader({ className, ...props }: ComponentProps<"th">) {
  return <th className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]", className)} {...props} />;
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-top text-[var(--ipf-muted)]", className)} {...props} />;
}

export function TableCaption({ children }: PropsWithChildren) {
  return <caption className="sr-only">{children}</caption>;
}
