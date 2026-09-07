import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import type { PublicEvent } from "../data/eventCatalog";
import { eventEmirates } from "../data/eventCatalog";
import { useLocale } from "../i18n/LocaleProvider";

function emirateLabel(id: string) {
  return eventEmirates.find((item) => item.id === id)?.label ?? id;
}

export function EventCard({ event }: { event: PublicEvent }) {
  const { t } = useLocale();
  return (
    <Link to={`/events/${event.id}`} className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ipf-saffron)]">
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] shadow-[0_8px_24px_rgba(11,31,58,0.06)] transition group-hover:-translate-y-0.5 group-hover:border-[var(--ipf-navy)]/40 group-hover:shadow-[0_14px_32px_rgba(11,31,58,0.1)]">
        <div className="relative aspect-[16/10] bg-[var(--ipf-navy)]">
          {event.image ? (
            <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
          ) : null}
          <span className="absolute left-3 top-3 rounded-full bg-[var(--ipf-navy)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            {event.category}
          </span>
          {event.isFree ? (
            <span className="absolute right-3 top-3 rounded-full bg-[var(--ipf-green)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              {t("page.events.free")}
            </span>
          ) : null}
        </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ipf-green)]">
          <CalendarDays className="size-3.5" />
          {event.date}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-[var(--ipf-navy)]">
          {event.title}
        </h3>
        {event.location ? (
          <p className="mt-2 inline-flex items-start gap-1.5 text-sm text-[var(--ipf-muted)]">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            {event.location}
            {event.emirate ? ` · ${emirateLabel(event.emirate)}` : ""}
          </p>
        ) : null}
        <div className="mt-auto pt-4">
          <span className="inline-flex min-h-11 items-center rounded-lg bg-[var(--ipf-navy)] px-3 text-xs font-semibold text-white">
            {t("page.events.viewEvent")}
          </span>
        </div>
      </div>
    </article>
    </Link>
  );
}
