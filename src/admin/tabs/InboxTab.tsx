import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { StatPill } from "../../components/ui/StatPill";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { api } from "../../lib/api";
import { useToast } from "../../components/ui/Toast";
import { useAdmin } from "../AdminProvider";

type Inbox = {
  inquiries: { id: string; createdAt: string; intent: string; name: string; email: string; phone?: string; emirate?: string; message?: string }[];
  rsvps: { id: string; createdAt: string; eventTitle: string; name: string; email: string; phone?: string; registrationNo?: string }[];
  volunteers: { id: string; createdAt: string; eventTitle: string; name: string; email: string; membershipNo: string; status: string }[];
  donations: { id: string; createdAt: string; name: string; email: string; amountAed: number; note?: string; status: string }[];
  members: { id: string; membershipNo: string; name: string; email: string; phone: string; emirate: string; homeState: string; createdAt: string; isVolunteer: boolean }[];
  yuva: { id: string; membershipNo: string; name: string; email: string; phone: string; emirate: string; homeState: string; createdAt: string }[];
  peopleQuery?: string;
  peopleMayBeTruncated?: boolean;
};

function InboxTable({ title, empty, headings, rows }: { title: string; empty: string; headings: string[]; rows: string[][] }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[var(--ipf-navy)]">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--ipf-muted)]">{empty}</p>
      ) : (
        <div className="mt-3">
          <Table>
            <TableCaption>{title}</TableCaption>
            <TableHead>
              <TableRow>
                {headings.map((heading) => (
                  <TableHeader key={heading}>{heading}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={`${title}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="max-w-xs align-top">
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

export default function InboxTab() {
  const { isGlobalAdmin } = useAdmin();
  const toast = useToast();
  const [inbox, setInbox] = useState<Inbox | null>(null);
  const [searchInput, setSearchInput] = useState("");

  async function load(q?: string) {
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      setInbox(await api<Inbox>(`/api/cms/inbox${params}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load inbox");
    }
  }

  useEffect(() => {
    void load();
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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Inbox</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">
            {isGlobalAdmin ? "Central inbox" : "Chapter inbox"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            {isGlobalAdmin
              ? "Members, Yuva, event registrations, volunteer duty, inquiries and pledges."
              : "Members, IPF Yuva and event duty from this emirate."}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void load(inbox?.peopleQuery)}>
          Refresh
        </Button>
      </div>

      <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <Input
            aria-label="Search members and Yuva by name, email, or membership number"
            placeholder="Search members/Yuva by name, email, or membership no."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
        {inbox?.peopleQuery ? (
          <Button type="button" variant="ghost" onClick={clearSearch}>
            Clear
          </Button>
        ) : null}
      </form>
      {inbox?.peopleMayBeTruncated ? (
        <p className="text-sm text-[var(--ipf-muted)]">
          Showing the 500 most recently created members/Yuva — search above to find someone specific.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatPill label="Inquiries" value={String(inbox?.inquiries.length ?? 0)} />
        <StatPill label="Members" value={String(inbox?.members.length ?? 0)} />
        <StatPill label="IPF Yuva" value={String(inbox?.yuva.length ?? 0)} />
        <StatPill label="Registrations" value={String(inbox?.rsvps.length ?? 0)} />
        <StatPill label="Yuva duty" value={String(inbox?.volunteers.length ?? 0)} />
      </div>

      <InboxTable
        title="Inquiries"
        empty="No inquiries yet."
        headings={["Date", "Intent", "Name", "Email", "Message"]}
        rows={(inbox?.inquiries ?? []).map((item) => [item.createdAt.slice(0, 10), item.intent, item.name, item.email, item.message ?? ""])}
      />
      <InboxTable
        title="Event registrations"
        empty="No event registrations yet."
        headings={["Date", "Event", "ID", "Name", "Email"]}
        rows={(inbox?.rsvps ?? []).map((item) => [item.createdAt.slice(0, 10), item.eventTitle, item.registrationNo ?? "", item.name, item.email])}
      />
      <InboxTable
        title="Yuva volunteers on events"
        empty="No Yuva volunteers assigned to events yet."
        headings={["Date", "Event", "Yuva ID", "Name", "Email", "Status"]}
        rows={(inbox?.volunteers ?? []).map((item) => [item.createdAt.slice(0, 10), item.eventTitle, item.membershipNo, item.name, item.email, item.status])}
      />
      {isGlobalAdmin ? (
        <InboxTable
          title="Donation pledges"
          empty="No pledges yet."
          headings={["Date", "Pledge", "Name", "Email", "Note"]}
          rows={(inbox?.donations ?? []).map((item) => [item.createdAt.slice(0, 10), `${item.status} · AED ${item.amountAed}`, item.name, item.email, item.note ?? ""])}
        />
      ) : null}
      <InboxTable
        title="All members"
        empty="No member accounts yet."
        headings={["Date", "Membership no.", "Name", "Email", "Chapter", "Home state", "Volunteer"]}
        rows={(inbox?.members ?? []).map((item) => [
          item.createdAt.slice(0, 10),
          item.membershipNo,
          item.name,
          item.email,
          item.emirate,
          item.homeState,
          item.isVolunteer ? "Yes" : "",
        ])}
      />
      <InboxTable
        title="IPF Yuva volunteers"
        empty="No members have opted in as IPF Yuva volunteers yet."
        headings={["Date", "Membership no.", "Name", "Email", "Chapter", "Home state"]}
        rows={(inbox?.yuva ?? []).map((item) => [item.createdAt.slice(0, 10), item.membershipNo, item.name, item.email, item.emirate, item.homeState])}
      />
    </div>
  );
}
