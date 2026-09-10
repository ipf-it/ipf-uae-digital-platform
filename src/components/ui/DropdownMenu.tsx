import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuButton({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      aria-label="Actions"
      className={cn(
        "flex size-9 items-center justify-center rounded-lg border border-[var(--ipf-line)] bg-white text-[var(--ipf-muted)] transition hover:border-[var(--ipf-navy)]/40 hover:text-[var(--ipf-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ipf-navy)]/15",
        className,
      )}
      {...props}
    >
      <MoreHorizontal className="size-4" />
    </DropdownMenuPrimitive.Trigger>
  );
}

export function DropdownMenuContent({ className, sideOffset = 6, align = "end", ...props }: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 min-w-40 overflow-hidden rounded-lg border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-1 shadow-[0_12px_28px_rgba(11,31,58,0.12)]",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "flex min-h-9 cursor-pointer select-none items-center rounded-md px-2.5 text-sm text-[var(--ipf-navy)] outline-none",
        "focus:bg-[var(--ipf-ivory)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn("my-1 h-px bg-[var(--ipf-line)]", className)} {...props} />;
}
