import { useEffect, useState } from "react";
import { api } from "../lib/api";

export type Activity = {
  id: string;
  title: string;
  summary: string;
  body: string;
  image: string;
  start_date: string | null;
  end_date: string | null;
  featured_on_homepage: boolean;
};

/** Live recurring programmes/campaigns — distinct from one-off Events. Falls back to an empty
 * list (never throws) so a transient API failure degrades gracefully. */
export function useActivities(homepageOnly = false) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    api<{ activities: Activity[] }>(`/api/activities${homepageOnly ? "?homepage=1" : ""}`)
      .then((result) => {
        if (active) setActivities(result.activities);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [homepageOnly]);

  return { activities, ready };
}
