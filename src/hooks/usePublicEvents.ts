import { useEffect, useMemo, useState } from "react";
import { catalogSeedEvents, cmsEventToPublic, filterPublicEvents, type EventListQuery, type PublicEvent } from "../data/eventCatalog";
import { useCms } from "../cms/ContentProvider";
import { api } from "../lib/api";

export function usePublicEvents(query: EventListQuery) {
  const { content } = useCms();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [ready, setReady] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fallback = useMemo(() => {
    const fromCms = content.eventHighlights.map(cmsEventToPublic);
    const byId = new Map<string, PublicEvent>();
    // Seed catalog first, CMS-authored events last, so a CMS override wins on a shared id —
    // matches usePublicEvent's single-event precedence below.
    for (const event of [...catalogSeedEvents, ...fromCms]) byId.set(event.id, event);
    return filterPublicEvents([...byId.values()], query);
  }, [content.eventHighlights, query.tab, query.category, query.emirate, query.free]);

  function buildParams(after?: string | null) {
    const params = new URLSearchParams();
    if (query.tab) params.set("tab", query.tab);
    if (query.category && query.category !== "All") params.set("category", query.category);
    if (query.emirate) params.set("emirate", query.emirate);
    if (query.free) params.set("free", "1");
    if (after) params.set("after", after);
    return params;
  }

  useEffect(() => {
    let active = true;
    setReady(false);
    api<{ events: PublicEvent[]; nextCursor: string | null }>(`/api/events?${buildParams().toString()}`)
      .then((result) => {
        if (!active) return;
        setEvents(result.events);
        setNextCursor(result.nextCursor);
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setEvents(fallback);
        setNextCursor(null);
        setReady(true);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback, query.tab, query.category, query.emirate, query.free]);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await api<{ events: PublicEvent[]; nextCursor: string | null }>(`/api/events?${buildParams(nextCursor).toString()}`);
      setEvents((prev) => [...prev, ...result.events]);
      setNextCursor(result.nextCursor);
    } catch {
      // Leave the current page as-is; "Load more" simply stays visible for a retry.
    } finally {
      setLoadingMore(false);
    }
  }

  return { events, ready, hasMore: Boolean(nextCursor), loadingMore, loadMore };
}

export function usePublicEvent(id: string) {
  const { content } = useCms();
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [counts, setCounts] = useState({ memberCount: 0, volunteerCount: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    api<{ event: PublicEvent; memberCount: number; volunteerCount: number }>(`/api/events/${encodeURIComponent(id)}`)
      .then((result) => {
        if (!active) return;
        setEvent(result.event);
        setCounts({ memberCount: result.memberCount, volunteerCount: result.volunteerCount });
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

  return { event, ready, ...counts };
}
