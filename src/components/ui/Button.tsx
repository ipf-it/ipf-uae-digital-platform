import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-center text-sm font-semibold leading-tight tracking-wide transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ipf-navy)]/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--ipf-navy)] text-white shadow-[0_4px_14px_rgba(11,31,58,0.25)] hover:-translate-y-0.5 hover:bg-[var(--ipf-navy-soft)] hover:shadow-[0_8px_20px_rgba(11,31,58,0.3)]",
        secondary: "border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white/20",
        outline:
          "border border-[var(--ipf-line)] bg-white text-[var(--ipf-navy)] hover:-translate-y-0.5 hover:border-[var(--ipf-navy)] hover:bg-[var(--ipf-ivory)] hover:shadow-sm",
        gold: "bg-[var(--ipf-saffron)] text-[var(--ipf-navy)] shadow-[0_4px_14px_rgba(255,138,20,0.35)] hover:-translate-y-0.5 hover:bg-[#ff8a14] hover:shadow-[0_8px_20px_rgba(255,138,20,0.4)]",
        ghost: "text-[var(--ipf-navy)] hover:bg-[var(--ipf-ivory)]",
      },
      size: {
        default: "min-h-11 px-4 py-2",
        sm: "min-h-9 px-3 py-1.5 text-xs",
        lg: "min-h-12 px-6 py-2",
        icon: "h-10 w-10 shrink-0 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>;

export function Button({ children, className, variant, size, asChild = false, ...buttonProps }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...buttonProps}>
      {children}
    </Comp>
  );
}
