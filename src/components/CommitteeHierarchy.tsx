import { PersonIdentity } from "./ui/PersonIdentity";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/Table";
import type { LeadershipEntry } from "../hooks/useOrgDirectory";

/** Renders a committee as a visual hierarchy — the most senior role prominent and alone at the
 * top, the next tier in a row below, the rest in a grid — instead of one flat list. Entries are
 * already sorted by seniority (appointments.display_order) by the API; this only groups them into
 * tiers for display. Entries without a photo on file (common for the wider/extended committee)
 * render in a simple table underneath instead of as photo cards. */
export function CommitteeHierarchy({ entries, tableCaption }: { entries: LeadershipEntry[]; tableCaption?: string }) {
  const withPhoto = entries.filter((entry) => entry.personImage);
  const withoutPhoto = entries.filter((entry) => !entry.personImage);
  const [leader, ...rest] = withPhoto;
  const secondTier = rest.slice(0, 3);
  const thirdTier = rest.slice(3);

  if (withPhoto.length === 0 && withoutPhoto.length === 0) return null;

  return (
    <div className="space-y-10">
      {leader ? (
        <div className="flex justify-center">
          <PersonIdentity src={leader.personImage} alt={leader.personName} name={leader.personName} role={leader.positionTitle} size="lg" layout="stack" />
        </div>
      ) : null}
      {secondTier.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
          {secondTier.map((entry) => (
            <PersonIdentity key={entry.id} src={entry.personImage} alt={entry.personName} name={entry.personName} role={entry.positionTitle} size="md" layout="stack" />
          ))}
        </div>
      ) : null}
      {thirdTier.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {thirdTier.map((entry) => (
            <PersonIdentity key={entry.id} src={entry.personImage} alt={entry.personName} name={entry.personName} role={entry.positionTitle} size="sm" layout="stack" />
          ))}
        </div>
      ) : null}
      {withoutPhoto.length > 0 ? (
        <Table>
          {tableCaption ? <caption className="sr-only">{tableCaption}</caption> : null}
          <TableHead>
            <TableRow>
              <TableHeader>Role</TableHeader>
              <TableHeader>Member</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {withoutPhoto.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium text-[var(--ipf-navy)]">{entry.positionTitle}</TableCell>
                <TableCell>{entry.personName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </div>
  );
}

// Rosters with real office-bearer data run 10-30+ people (a chapter/council executive committee
// is not a short list), and nearly none of them have a photo on file. A flat one-per-row list at
// that length is a long, hard-to-scan scroll with no visual structure. Grouping by role first —
// in a sensible seniority order, since the API itself only guarantees alphabetical-by-name within
// a scope, not by role — and laying each group out as a multi-column grid of compact cards reads
// like an actual committee roster instead of a spreadsheet dump.
// More specific phrases must come before the shorter substrings they contain (e.g. "joint
// secretary" before bare "secretary") since matching below is substring-based, not exact.
const ROLE_PRIORITY = [
  "convenor", "co-convenor", "general secretary", "joint secretary", "secretary",
  "joint treasurer", "treasurer", "media incharge", "events organizing incharge",
  "csr activity incharge", "coordinator", "mentor", "advisor",
];

function roleRank(title: string) {
  const normalized = title.toLowerCase();
  const index = ROLE_PRIORITY.findIndex((role) => normalized.includes(role));
  if (index !== -1) return index;
  // "Committee Member" / "Executive Member" and anything else unrecognised sorts last, together.
  return ROLE_PRIORITY.length;
}

/** Compact variant for a chapter/council's committee section — grouped by role (Convenor first,
 * Committee Members last), each group laid out as a responsive grid rather than one long column.
 * Shows a contact line only when the office bearer has opted to display it publicly. */
export function CommitteeList({ entries }: { entries: LeadershipEntry[] }) {
  const groups = new Map<string, LeadershipEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.positionTitle) ?? [];
    list.push(entry);
    groups.set(entry.positionTitle, list);
  }
  const sortedGroups = [...groups.entries()].sort((a, b) => roleRank(a[0]) - roleRank(b[0]));

  return (
    <div className="space-y-6">
      {sortedGroups.map(([title, members]) => (
        <div key={title}>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ipf-muted)]">
            {title}
            {members.length > 1 ? ` (${members.length})` : ""}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {members.map((entry) => (
              <div key={entry.id} className="min-w-0">
                <PersonIdentity src={entry.personImage} alt={entry.personName} name={entry.personName} size="sm" />
                {entry.contactPhone || entry.contactEmail ? (
                  <p className="mt-1 pl-[84px] text-xs text-[var(--ipf-muted)] sm:pl-[88px]">
                    {[entry.contactPhone, entry.contactEmail].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
