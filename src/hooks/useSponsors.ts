import { useEffect, useState } from "react";
import { api } from "../lib/api";

export type Sponsor = {
  id: string;
  name: string;
  logo: string;
  website: string;
  tier: string;
  description: string;
};

/** Live organisation-level sponsor directory. Falls back to an empty list (never throws) so a
 * transient API failure degrades to "no sponsors shown yet" rather than a broken page. */
export function useSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    api<{ sponsors: Sponsor[] }>("/api/sponsors")
      .then((result) => {
        if (active) setSponsors(result.sponsors);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return { sponsors, ready };
}

/** Sponsors linked to one specific event (empty if none, or if the event has no sponsors). */
export function useEventSponsors(eventId: string) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    let active = true;
    if (!eventId) return;
    api<{ sponsors: Sponsor[] }>(`/api/events/${encodeURIComponent(eventId)}/sponsors`)
      .then((result) => {
        if (active) setSponsors(result.sponsors);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [eventId]);

  return { sponsors };
}
