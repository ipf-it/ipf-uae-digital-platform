import { useEffect, useState } from "react";
import { api } from "../lib/api";

export type ScopeStats = { memberCount: number; volunteerCount: number; upcomingEventCount: number };

const empty: ScopeStats = { memberCount: 0, volunteerCount: 0, upcomingEventCount: 0 };

/** Live registration/volunteer/upcoming-event counts for one chapter or council. */
export function useScopeStats(scopeType: "chapter" | "council", scopeId: string) {
  const [stats, setStats] = useState<ScopeStats>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);
    api<ScopeStats>(`/api/public/scope-stats?scopeType=${scopeType}&scopeId=${encodeURIComponent(scopeId)}`)
      .then((result) => {
        if (!active) return;
        setStats(result);
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setStats(empty);
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [scopeType, scopeId]);

  return { stats, ready };
}
