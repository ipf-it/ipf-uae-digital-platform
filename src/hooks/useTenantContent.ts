import { useEffect, useState } from "react";
import { api } from "../lib/api";

export type TenantContent = {
  intro: string;
  highlights: string[];
  hero_image: string;
  gallery: { src: string; alt: string; title?: string; caption?: string }[];
  updated_at: string;
};

/** Fetches a chapter/council's approved landing-page content. Returns `null` while loading or if
 * nothing has been authored/approved yet, so callers can fall back to today's static copy. */
export function useTenantContent(scopeType: "chapter" | "council", scopeId: string) {
  const [content, setContent] = useState<TenantContent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);
    api<{ content: TenantContent | null }>(`/api/tenant-content/${scopeType}/${encodeURIComponent(scopeId)}`)
      .then((result) => {
        if (!active) return;
        setContent(result.content);
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setContent(null);
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [scopeType, scopeId]);

  return { content, ready };
}
