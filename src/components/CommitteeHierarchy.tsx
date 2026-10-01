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

/** Compact variant for a sidebar card (chapter/council officer list) — the API already returns
 * these alphabetically by name for a chapter/council scope (vs. seniority order for the Central
 * Committee), so this renders in whatever order it receives rather than re-sorting. Shows a
 * contact line when the office bearer has opted to display it publicly. */
export function CommitteeList({ entries }: { entries: LeadershipEntry[] }) {
  return (
    <div className="grid gap-4">
      {entries.map((entry) => (
        <div key={entry.id}>
          <PersonIdentity src={entry.personImage} alt={entry.personName} name={entry.personName} role={entry.positionTitle} size="sm" />
          {entry.contactPhone || entry.contactEmail ? (
            <p className="mt-1 pl-[84px] text-xs text-[var(--ipf-muted)] sm:pl-[88px]">
              {[entry.contactPhone, entry.contactEmail].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
