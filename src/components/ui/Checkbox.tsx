import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-[var(--ipf-line)] bg-white shadow-sm transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ipf-navy)]/20",
        "data-[state=checked]:border-[var(--ipf-navy)] data-[state=checked]:bg-[var(--ipf-navy)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
        <Check className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
