import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "../../lib/utils";

type CardProps = PropsWithChildren<{
  title: ReactNode;
  description: string;
  className?: string;
}>;

export function Card({ title, description, className = "", children }: CardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-6 shadow-[0_8px_24px_rgba(11,31,58,0.06)]",
        className,
      )}
    >
      <h3 className="text-lg font-semibold text-[var(--ipf-navy)]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[var(--ipf-muted)]">{description}</p>
      {children}
    </article>
  );
}
