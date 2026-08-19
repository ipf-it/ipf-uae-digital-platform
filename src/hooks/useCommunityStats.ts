import { useEffect, useState } from "react";
import { api } from "../lib/api";

export type CommunityCounts = {
  members: number;
  yuva: number;
  events: number;
  chapters: number;
};

const fallbackChapters = 8;

export function useCommunityStats(eventsFallback: number) {
  const [counts, setCounts] = useState<CommunityCounts>({
    members: 0,
    yuva: 0,
    events: eventsFallback,
    chapters: fallbackChapters,
  });

  useEffect(() => {
    let active = true;
    api<CommunityCounts>("/api/stats")
      .then((data) => {
        if (!active) return;
        setCounts({
          members: Number(data.members) || 0,
          yuva: Number(data.yuva) || 0,
          events: Number(data.events) || eventsFallback,
          chapters: Number(data.chapters) || fallbackChapters,
        });
      })
      .catch(() => {
        if (!active) return;
        setCounts({
          members: 0,
          yuva: 0,
          events: eventsFallback,
          chapters: fallbackChapters,
        });
      });
    return () => {
      active = false;
    };
  }, [eventsFallback]);

  return counts;
}
