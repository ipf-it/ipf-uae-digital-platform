import { useEffect, useState, type FormEvent } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { StatPill } from "../../components/ui/StatPill";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { useAdmin } from "../AdminProvider";

type Member = { id: string; membershipNo: string; name: string; email: string; phone: string; emirate: string; homeState: string; createdAt: string; isVolunteer: boolean };
type Donation = { id: string; createdAt: string; name: string; email: string; amountAed: number; note?: string; status: string };
type People = {
  members: Member[];
  yuva: Member[];
  donations: Donation[];
  peopleQuery?: string;
  peopleMayBeTruncated?: boolean;
};

export default function PeopleTab() {
  const { isGlobalAdmin } = useAdmin();
  const toast = useToast();
  const [people, setPeople] = useState<People | null>(null);
  const [searchInput, setSearchInput] = useState("");

  async function load(q?: string) {
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      setPeople(await api<People>(`/api/cms/inbox${params}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load people");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    void load(searchInput);
  }

  function clearSearch() {
    setSearchInput("");
    void load();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">People</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Members & IPF Yuva</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            {isGlobalAdmin ? "Every registered member, IPF Yuva volunteer, and donation pledge." : "Members and IPF Yuva registered in your chapter/council."}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void load(people?.peopleQuery)}>
          Refresh
        </Button>
      </div>

      <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <Input
            aria-label="Search members and Yuva by name, email, or membership number"
            placeholder="Search by name, email, or membership no."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
        {people?.peopleQuery ? (
          <Button type="button" variant="ghost" onClick={clearSearch}>
            Clear
          </Button>
        ) : null}
      </form>
      {people?.peopleMayBeTruncated ? (
        <p className="text-sm text-[var(--ipf-muted)]">Showing the 500 most recently created members/Yuva — search above to find someone specific.</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatPill label="Members" value={String(people?.members.length ?? 0)} />
        <StatPill label="IPF Yuva" value={String(people?.yuva.length ?? 0)} />
        {isGlobalAdmin ? <StatPill label="Donation pledges" value={String(people?.donations.length ?? 0)} /> : null}
      </div>

      <section>
        <h3 className="text-lg font-bold text-[var(--ipf-navy)]">All members</h3>
        {(people?.members.length ?? 0) === 0 ? (
          <p className="mt-2 text-sm text-[var(--ipf-muted)]">No member accounts yet.</p>
        ) : (
          <div className="mt-3">
            <Table>
              <TableCaption>All members</TableCaption>
              <TableHead>
                <TableRow>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Membership no.</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Chapter</TableHeader>
                  <TableHeader>Home state</TableHeader>
                  <TableHeader>Volunteer</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {(people?.members ?? []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.createdAt.slice(0, 10)}</TableCell>
                    <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.membershipNo}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.emirate}</TableCell>
                    <TableCell>{item.homeState}</TableCell>
                    <TableCell>{item.isVolunteer ? <Badge tone="green">Yes</Badge> : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold text-[var(--ipf-navy)]">IPF Yuva volunteers</h3>
        {(people?.yuva.length ?? 0) === 0 ? (
          <p className="mt-2 text-sm text-[var(--ipf-muted)]">No members have opted in as IPF Yuva volunteers yet.</p>
        ) : (
          <div className="mt-3">
            <Table>
              <TableCaption>IPF Yuva volunteers</TableCaption>
              <TableHead>
                <TableRow>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Membership no.</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Chapter</TableHeader>
                  <TableHeader>Home state</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {(people?.yuva ?? []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.createdAt.slice(0, 10)}</TableCell>
                    <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.membershipNo}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.emirate}</TableCell>
                    <TableCell>{item.homeState}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {isGlobalAdmin ? (
        <section>
          <h3 className="text-lg font-bold text-[var(--ipf-navy)]">Donation pledges</h3>
          {(people?.donations.length ?? 0) === 0 ? (
            <p className="mt-2 text-sm text-[var(--ipf-muted)]">No pledges yet.</p>
          ) : (
            <div className="mt-3">
              <Table>
                <TableCaption>Donation pledges</TableCaption>
                <TableHead>
                  <TableRow>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Pledge</TableHeader>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Note</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(people?.donations ?? []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.createdAt.slice(0, 10)}</TableCell>
                      <TableCell>
                        {item.status} · AED {item.amountAed}
                      </TableCell>
                      <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.name}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{item.note ?? ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
