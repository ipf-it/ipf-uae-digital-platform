import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md px-5 text-sm font-semibold tracking-wide transition-colors duration-200",
  {
    variants: {
      variant: {
        primary: "bg-[var(--ipf-navy)] text-white hover:bg-[var(--ipf-navy-soft)]",
        secondary: "border border-white/40 bg-transparent text-white hover:bg-white/10",
        outline: "border border-[var(--ipf-navy)] bg-transparent text-[var(--ipf-navy)] hover:bg-[var(--ipf-ivory)]",
        gold: "bg-[var(--ipf-saffron)] text-[var(--ipf-navy)] hover:bg-[#ff8a14]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded px-3 text-xs",
        lg: "h-12 px-7",
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
