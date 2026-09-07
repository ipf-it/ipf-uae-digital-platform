import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { locales, useLocale } from "../i18n/LocaleProvider";
import { cn } from "../lib/utils";

type LanguageToggleProps = {
  className?: string;
  tone?: "light" | "dark";
};

export function LanguageToggle({ className, tone = "light" }: LanguageToggleProps) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = locales.find((item) => item.id === locale) ?? locales[0];
  const dark = tone === "dark";

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    function onKey(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onPointer); document.removeEventListener("keydown", onKey); };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex h-11 items-center justify-center gap-0.5 rounded-lg border text-[11px] font-bold tracking-wide",
          dark
            ? "w-[3.1rem] border-white/20 bg-white/10 text-white hover:bg-white/15"
            : "w-[3.35rem] border-[var(--ipf-line)] bg-white text-[var(--ipf-navy)]",
        )}
        aria-expanded={open}
        aria-label={t("nav.language")}
        onClick={() => setOpen((value) => !value)}
      >
        {current.code}
        <ChevronDown className="size-3 opacity-60" />
      </button>
      {open ? (
        <ul className="absolute right-0 top-[calc(100%+0.35rem)] z-[60] max-h-[min(20rem,70vh)] w-48 overflow-y-auto rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] py-1 shadow-[0_16px_40px_rgba(11,31,58,0.14)]">
          {locales.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm text-[var(--ipf-navy)] hover:bg-[var(--ipf-ivory)]",
                  item.id === locale && "bg-[var(--ipf-ivory)] font-semibold",
                )}
                onClick={() => {
                  setLocale(item.id);
                  setOpen(false);
                }}
              >
                <span>{item.name}</span>
                <span className="text-[10px] font-bold tracking-wide text-[var(--ipf-muted)]">{item.code}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
