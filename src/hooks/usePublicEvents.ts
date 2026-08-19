import { useEffect, useMemo, useState } from "react";
import { catalogSeedEvents, cmsEventToPublic, filterPublicEvents, type EventListQuery, type PublicEvent } from "../data/eventCatalog";
import { useCms } from "../cms/ContentProvider";
import { api } from "../lib/api";

export function usePublicEvents(query: EventListQuery) {
  const { content } = useCms();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [ready, setReady] = useState(false);

  const fallback = useMemo(() => {
    const fromCms = content.eventHighlights.map(cmsEventToPublic);
    const byId = new Map<string, PublicEvent>();
    for (const event of [...fromCms, ...catalogSeedEvents]) byId.set(event.id, event);
    return filterPublicEvents([...byId.values()], query);
  }, [content.eventHighlights, query.tab, query.category, query.emirate, query.free]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (query.tab) params.set("tab", query.tab);
    if (query.category && query.category !== "All") params.set("category", query.category);
    if (query.emirate) params.set("emirate", query.emirate);
    if (query.free) params.set("free", "1");
    api<{ events: PublicEvent[] }>(`/api/events?${params.toString()}`)
      .then((result) => {
        if (!active) return;
        setEvents(result.events);
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setEvents(fallback);
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [fallback, query.tab, query.category, query.emirate, query.free]);

  return { events, ready };
}

export function usePublicEvent(id: string) {
  const { content } = useCms();
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    api<{ event: PublicEvent }>(`/api/events/${encodeURIComponent(id)}`)
      .then((result) => {
        if (!active) return;
        setEvent(result.event);
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        const fromCms = content.eventHighlights.find((item) => item.id === id);
        const fromSeed = catalogSeedEvents.find((item) => item.id === id);
        setEvent(fromCms ? cmsEventToPublic(fromCms) : fromSeed ?? null);
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [id, content.eventHighlights]);

  return { event, ready };
}
