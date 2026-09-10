import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useCms } from "../cms/ContentProvider";
import { useLocale } from "../i18n/LocaleProvider";
import { catalogSeedEvents } from "../data/eventCatalog";
import { useLeadership, useOrgChapters, useOrgCouncils } from "../hooks/useOrgDirectory";
import { cn } from "../lib/utils";

export function SearchDialog() {
  const { t } = useLocale();
  const { content } = useCms();
  const { chapters } = useOrgChapters();
  const { councils } = useOrgCouncils();
  const { leadership } = useLeadership("global");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    function escape(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    const items = [
      ...content.news.map((item) => ({ title: item.title, to: `/news/${item.slug}`, kind: "News" })),
      ...content.eventHighlights.map((item) => ({ title: item.title, to: `/events/${item.id}`, kind: "Event" })),
      ...catalogSeedEvents.map((item) => ({ title: item.title, to: `/events/${item.id}`, kind: "Event" })),
      ...leadership.map((item) => ({ title: `${item.personName} — ${item.positionTitle}`, to: "/leadership", kind: "Leadership" })),
      ...content.galleryImages.map((item) => ({ title: item.alt, to: "/gallery", kind: "Gallery" })),
      ...chapters.map((item) => ({ title: `${item.name} ${t("nav.chapters")}`, to: `/chapters/${item.id}`, kind: t("nav.chapters") })),
      ...councils.map((item) => ({ title: item.name, to: `/councils/${item.id}`, kind: t("nav.councils") })),
      { title: t("nav.councils"), to: "/councils", kind: t("nav.councils") },
      { title: t("nav.yuva"), to: "/yuva", kind: t("nav.yuva") },
      { title: t("nav.resources"), to: "/resources", kind: t("nav.resources") },
      { title: t("nav.ipfCares"), to: "/support#community", kind: t("nav.support") },
      { title: t("nav.membership"), to: "/membership", kind: t("nav.join") },
    ];
    return items.filter((item) => item.title.toLowerCase().includes(query)).slice(0, 8);
  }, [content, q, t, chapters, councils, leadership]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--ipf-line)] text-[var(--ipf-navy)] hover:bg-[var(--ipf-ivory)]"
        aria-label={t("nav.search")}
        onClick={() => setOpen(true)}
      >
        <Search size={16} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] bg-[var(--ipf-navy)]/50 p-4" role="dialog" aria-modal="true" aria-label={t("nav.search")} onClick={() => setOpen(false)}>
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
