import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: string; kind: ToastKind; message: string };

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue>({
  success: () => undefined,
  error: () => undefined,
  info: () => undefined,
});

const icons: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const toneClasses: Record<ToastKind, string> = {
  success: "border-[var(--ipf-green)] text-[var(--ipf-green)]",
  error: "border-red-600 text-red-700",
  info: "border-[var(--ipf-navy)] text-[var(--ipf-navy)]",
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [...prev, { id, kind, message }]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
        {children}
        {items.map((item) => {
          const Icon = icons[item.kind];
          return (
            <ToastPrimitive.Root
              key={item.id}
              className={cn(
                "ipf-toast flex items-start gap-3 rounded-xl border bg-[var(--ipf-paper)] px-4 py-3 shadow-[0_12px_28px_rgba(11,31,58,0.16)]",
                toneClasses[item.kind],
              )}
              onOpenChange={(open) => {
                if (!open) setItems((prev) => prev.filter((t) => t.id !== item.id));
              }}
            >
              <Icon className="mt-0.5 size-5 shrink-0" />
              <ToastPrimitive.Description className="flex-1 text-sm text-[var(--ipf-navy)]">{item.message}</ToastPrimitive.Description>
              <ToastPrimitive.Close aria-label="Dismiss" className="text-[var(--ipf-muted)] hover:text-[var(--ipf-navy)]">
                <X className="size-4" />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 outline-none sm:bottom-4 sm:right-4" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
