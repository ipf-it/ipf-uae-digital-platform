import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useCms } from "../cms/ContentProvider";
import { useLocale } from "../i18n/LocaleProvider";
import { chapters } from "../data/platformContent";
import { cn } from "../lib/utils";

export function SearchDialog() {
  const { t } = useLocale();
  const { content } = useCms();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    const items = [
      ...content.news.map((item) => ({ title: item.title, to: `/news/${item.slug}`, kind: "News" })),
      ...content.eventHighlights.map((item) => ({ title: item.title, to: "/events", kind: "Event" })),
      ...content.leadership.map((item) => ({ title: `${item.name} — ${item.role}`, to: "/leadership", kind: "Leadership" })),
      ...content.galleryImages.map((item) => ({ title: item.alt, to: "/gallery", kind: "Gallery" })),
      ...chapters.map((item) => ({ title: `${item.name} chapter`, to: `/chapters#${item.id}`, kind: "Chapter" })),
      { title: "IPF Yuva", to: "/yuva", kind: "Programme" },
      { title: "Membership", to: "/membership", kind: "Join" },
    ];
    return items.filter((item) => item.title.toLowerCase().includes(query)).slice(0, 8);
  }, [content, q]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ipf-line)] text-[var(--ipf-navy)] hover:bg-[var(--ipf-ivory)]"
        aria-label={t("nav.search")}
        onClick={() => setOpen(true)}
      >
        <Search size={16} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] bg-[var(--ipf-navy)]/50 p-4" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-16 max-w-lg rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              autoFocus
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder={t("nav.searchPlaceholder")}
              className="w-full rounded-lg border border-[var(--ipf-line)] px-3 py-2 text-sm text-[var(--ipf-navy)] outline-none focus:border-[var(--ipf-navy)]"
            />
            <ul className="mt-3 space-y-1">
              {results.map((item) => (
                <li key={item.to + item.title}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn("block rounded-lg px-3 py-2 text-sm hover:bg-[var(--ipf-ivory)]")}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ipf-green)]">{item.kind}</span>
                    <span className="mt-0.5 block font-semibold text-[var(--ipf-navy)]">{item.title}</span>
                  </Link>
                </li>
              ))}
              {q.trim().length >= 2 && results.length === 0 ? (
                <li className="px-3 py-2 text-sm text-[var(--ipf-muted)]">{t("nav.searchEmpty")}</li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
