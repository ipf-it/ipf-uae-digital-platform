import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";
import { useLocale } from "../i18n/LocaleProvider";
import { faqs } from "../data/faqs";

export function FaqAssistant() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ipf-navy)] text-white shadow-lg lg:bottom-6"
        aria-label={open ? t("nav.close") : t("common.help")}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={18} /> : <MessageCircle size={18} />}
      </button>
      {open ? (
        <div className="fixed bottom-40 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-4 shadow-xl lg:bottom-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ipf-green)]">{t("common.help")}</p>
          <p className="mt-1 text-sm text-[var(--ipf-muted)]">{t("common.helpBlurb")}</p>
          <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
            {faqs.map((item) => (
              <li key={item.q} className="rounded-lg bg-[var(--ipf-ivory)] p-3">
                <p className="text-sm font-semibold text-[var(--ipf-navy)]">{item.q}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--ipf-muted)]">{item.a}</p>
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
