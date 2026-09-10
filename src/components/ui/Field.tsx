import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";
import { Label } from "./Label";

type FieldProps = PropsWithChildren<{
  label: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  hint?: string;
}>;

export function Field({ label, htmlFor, required, className = "", hint, children }: FieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-[var(--ipf-saffron)]"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-[var(--ipf-muted)]">{hint}</p> : null}
    </div>
  );
}
