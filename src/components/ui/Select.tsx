import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-[var(--ipf-line)] bg-white px-3.5 text-left text-sm text-[var(--ipf-ink)] shadow-sm transition",
        "focus-visible:border-[var(--ipf-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ipf-navy)]/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[placeholder]:text-[var(--ipf-muted)]/70",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 shrink-0 text-[var(--ipf-muted)]" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, children, position = "popper", ...props }: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          "z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-[var(--ipf-line)] bg-[var(--ipf-paper)] shadow-[0_12px_28px_rgba(11,31,58,0.12)]",
          className,
        )}
        {...props}
        sideOffset={props.sideOffset ?? 6}
      >
        <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1 text-[var(--ipf-muted)]">
          <ChevronUp className="size-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "w-full")}>{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1 text-[var(--ipf-muted)]">
          <ChevronDown className="size-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm text-[var(--ipf-navy)] outline-none",
        "focus:bg-[var(--ipf-ivory)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="absolute left-2 flex items-center">
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

type SimpleSelectProps = {
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: readonly string[] | { value: string; label: string }[];
  required?: boolean;
  id?: string;
};

export function SimpleSelect({ name, value, onValueChange, placeholder, options, required, id }: SimpleSelectProps) {
  const items = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

  return (
    <>
      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger id={id} aria-required={required}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
