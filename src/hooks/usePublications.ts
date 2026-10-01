import { useEffect, useState } from "react";
import { api } from "../lib/api";

export type Publication = {
  id: string;
  publication_type: string;
  title: string;
  edition: string;
  description: string;
  cover_image: string;
  file_url: string;
  featured_on_homepage: boolean;
};

/** Live Drishti e-Magazine (and any future publication type) directory — replaces the old
 * hardcoded drishtiEditions array. Falls back to an empty list (never throws). */
export function usePublications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    api<{ publications: Publication[] }>("/api/publications")
      .then((result) => {
        if (active) setPublications(result.publications);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return { publications, ready };
}
