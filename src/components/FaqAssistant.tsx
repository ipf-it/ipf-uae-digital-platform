import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useLocale } from "../i18n/LocaleProvider";
import { faqs } from "../data/faqs";

/**
 * Custom IPF-branded chat / FAQ launcher glyph.
 *
 * Composition
 *   - Rounded speech bubble (burgundy #5A0F1E stroke, ivory fill) as the
 *     primary conversation signal.
 *   - Three narrow pills inside — saffron, white and India-green from top
 *     to bottom — which read as subtle message rows AND the Indian
 *     tricolour at glyph scale, tying the launcher to IPF's visual
 *     identity without squeezing the full logo into the button.
 *   - Rendered at 26x26 inside a 52-56 px circular ivory control so it
 *     stays recognisable at touch size.
 */
function IpfChatGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="26"
      height="26"
      aria-hidden="true"
      className={className}
    >
      {/* speech bubble */}
      <path
        d="M6 7h20a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H14l-5 4v-4H6a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3z"
        fill="#FFFDF8"
        stroke="#5A0F1E"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* three message pills forming the Indian tricolour */}
      <rect x="8" y="10.5" width="16" height="2.4" rx="1.2" fill="#FF9933" />
      <rect x="8" y="14.3" width="12" height="2.4" rx="1.2" fill="#FFFFFF" stroke="#D6AD60" strokeWidth="0.6" />
      <rect x="8" y="18.1" width="14" height="2.4" rx="1.2" fill="#138808" />
    </svg>
  );
}

export function FaqAssistant() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: MouseEvent) {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", dismiss); document.removeEventListener("keydown", escape); };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        /* Custom IPF chat launcher.
             - Circular ivory #FFFDF8 surface, warm not glassy.
             - 1 px heritage-gold ring (ring-1 ring-[#D6AD60]), slightly
               stronger on hover.
             - 52 px mobile (h-[52px]) / 56 px desktop (lg:h-14 w-14).
             - Fixed bottom-right. On mobile the top offset is bottom-24
               so it clears the home-tab bar; on lg+ it drops to bottom-6
               (same offsets as before).
             - NO decorative animation: hover is a quiet ring/shadow lift,
               focus is a visible 2 px gold outline, open-state swaps the
               glyph for a close X in burgundy.
        */
        className="fixed bottom-24 right-4 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#FFFDF8] text-[#5A0F1E] shadow-[0_6px_18px_rgba(11,31,58,0.18)] ring-1 ring-[#D6AD60]/70 transition hover:shadow-[0_10px_26px_rgba(11,31,58,0.24)] hover:ring-[#D6AD60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B6A1F] lg:bottom-6 lg:h-14 lg:w-14"
        aria-label={open ? t("nav.close") : t("common.help")}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <IpfChatGlyph />}
      </button>
      {open ? (
        <div ref={panelRef} className="fixed bottom-40 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-4 shadow-xl lg:bottom-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ipf-green)]">{t("common.help")}</p>
          <p className="mt-1 text-sm text-[var(--ipf-muted)]">{t("common.helpBlurb")}</p>
          <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
            {faqs.map((item) => (
              <li key={item.id} className="rounded-lg bg-[var(--ipf-ivory)] p-3">
                <p className="text-sm font-semibold text-[var(--ipf-navy)]">{t(`faq.${item.id}.q`)}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--ipf-muted)]">{t(`faq.${item.id}.a`)}</p>
                <Link className="mt-2 inline-block text-xs font-semibold text-[var(--ipf-green)]" to={item.href} onClick={() => setOpen(false)}>
                  {t("common.openPage")}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
