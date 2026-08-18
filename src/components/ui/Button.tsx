import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold tracking-wide transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ipf-navy)]/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--ipf-navy)] text-white shadow-sm hover:bg-[var(--ipf-navy-soft)] hover:shadow-md",
        secondary: "border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
        outline:
          "border border-[var(--ipf-line)] bg-white text-[var(--ipf-navy)] hover:border-[var(--ipf-navy)] hover:bg-[var(--ipf-ivory)]",
        gold: "bg-[var(--ipf-saffron)] text-[var(--ipf-navy)] shadow-sm hover:bg-[#ff8a14]",
        ghost: "text-[var(--ipf-navy)] hover:bg-[var(--ipf-ivory)]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-7",
        icon: "h-10 w-10 p-0",
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
