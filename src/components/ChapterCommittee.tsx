import type { LeadershipEntry } from "../hooks/useOrgDirectory";

/* ───────────────────────────────────────────────────────────────────────
 * ChapterCommittee — premium portrait grid for a chapter's committee.
 *
 * Renders every published chapter appointment as a consistent portrait
 * tile: square-cropped photo, name, position title, optional approved
 * public contact. Supports arbitrarily many members (the IPF 2026 brief
 * calls for comfortable room for ≥10 per chapter).
 *
 * Layout
 *   xl: 4 columns
 *   lg: 3 columns
 *   sm: 2 columns
 *   mobile: 1 column
 *
 * Privacy
 *   The server-side /api/org/leadership handler only returns public_contact
 *   fields that are explicitly flagged for public display, so anything we
 *   receive here is pre-approved. No membership number is ever surfaced.
 *
 * Missing photo
 *   The <img> onError handler replaces the broken image with a neutral
 *   ivory monogram tile so the grid remains visually consistent and no
 *   portrait is ever fabricated.
 * ─────────────────────────────────────────────────────────────────── */

const GOLD_INK = "#8B6A1F";
const NAVY = "var(--ipf-navy)";
const INK = "#1c2430";
const MUTED = "#55606d";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ChapterCommittee({ entries }: { entries: LeadershipEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <ul
      role="list"
      className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7 xl:grid-cols-4"
    >
      {entries.map((entry) => {
        const safeInitials = initials(entry.personName);
        return (
          <li key={entry.id} className="min-w-0">
            <article className="flex h-full flex-col overflow-hidden rounded-[18px] bg-[#FFFDF8] shadow-[0_6px_20px_rgba(11,31,58,0.08)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(11,31,58,0.14)]">
              {/* Portrait — square aspect, consistent crop. */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#F3EADC]">
                {entry.personImage ? (
                  <img
                    src={entry.personImage}
                    alt={`${entry.personName}, ${entry.positionTitle}`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-top"
                    onError={(e) => {
                      // Hide the broken <img> so the ivory monogram tile
                      // behind it shows. No fabricated portrait, no alt
                      // text landing in the frame.
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center font-serif text-[2.4rem] font-bold tracking-tight"
                  style={{ color: `${GOLD_INK}66` }}
                >
                  {safeInitials}
                </div>
              </div>

              {/* Identity + role */}
              <div className="flex flex-1 flex-col px-5 py-4">
                <p
                  className="text-[0.62rem] font-bold uppercase tracking-[0.22em]"
                  style={{ color: GOLD_INK }}
                >
                  {entry.positionTitle}
                </p>
                <h3
                  className="mt-1.5 font-serif text-[1.05rem] font-bold leading-tight tracking-tight"
                  style={{ color: NAVY }}
                >
                  {entry.personName}
                </h3>
                {entry.bio ? (
                  <p
                    className="mt-2 line-clamp-3 text-[0.82rem] leading-relaxed"
                    style={{ color: INK }}
                  >
                    {entry.bio}
                  </p>
                ) : null}
                {entry.contactPhone || entry.contactEmail ? (
                  <p
                    className="mt-auto pt-3 text-[0.72rem] leading-relaxed"
                    style={{ color: MUTED }}
                  >
                    {[entry.contactPhone, entry.contactEmail].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
