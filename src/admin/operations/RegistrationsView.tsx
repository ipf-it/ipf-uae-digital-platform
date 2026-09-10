import { useEffect, useMemo, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { SimpleSelect } from "../../components/ui/Select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";

type Rsvp = { id: string; createdAt: string; eventTitle: string; name: string; email: string; phone?: string; registrationNo?: string };
type Volunteer = { id: string; createdAt: string; eventTitle: string; name: string; email: string; membershipNo: string; status: string };
type Inbox = { rsvps: Rsvp[]; volunteers: Volunteer[] };

export default function RegistrationsView() {
  const toast = useToast();
  const [inbox, setInbox] = useState<Inbox | null>(null);
  const [eventFilter, setEventFilter] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setInbox(await api<Inbox>("/api/cms/inbox"));
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load registrations"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eventOptions = useMemo(() => {
    const titles = new Set([...(inbox?.rsvps ?? []).map((r) => r.eventTitle), ...(inbox?.volunteers ?? []).map((v) => v.eventTitle)]);
    return [...titles].sort();
  }, [inbox]);

  const rsvps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (inbox?.rsvps ?? []).filter((item) => {
      if (eventFilter && item.eventTitle !== eventFilter) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [inbox, eventFilter, search]);

  const volunteers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (inbox?.volunteers ?? []).filter((item) => {
      if (eventFilter && item.eventTitle !== eventFilter) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [inbox, eventFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--ipf-navy)]">Registrations & duty</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--ipf-muted)]">Who's attending as a member, and who's on volunteer duty, per event.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search registrations" />
        </div>
        <div className="w-56">
          <SimpleSelect value={eventFilter} onValueChange={setEventFilter} placeholder="All events" options={eventOptions} />
        </div>
        {eventFilter || search ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setEventFilter("");
              setSearch("");
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <section>
        <h4 className="text-lg font-bold text-[var(--ipf-navy)]">Event registrations</h4>
        {rsvps.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--ipf-muted)]">No registrations match these filters.</p>
        ) : (
          <div className="mt-3">
            <Table>
              <TableCaption>Event registrations</TableCaption>
              <TableHead>
                <TableRow>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Event</TableHeader>
                  <TableHeader>ID</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Email</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rsvps.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.createdAt.slice(0, 10)}</TableCell>
                    <TableCell>{item.eventTitle}</TableCell>
                    <TableCell>{item.registrationNo ?? "—"}</TableCell>
                    <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section>
        <h4 className="text-lg font-bold text-[var(--ipf-navy)]">Volunteer duty</h4>
        {volunteers.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--ipf-muted)]">No volunteer duty matches these filters.</p>
        ) : (
          <div className="mt-3">
            <Table>
              <TableCaption>Volunteer duty</TableCaption>
              <TableHead>
                <TableRow>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Event</TableHeader>
                  <TableHeader>Yuva ID</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {volunteers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.createdAt.slice(0, 10)}</TableCell>
                    <TableCell>{item.eventTitle}</TableCell>
                    <TableCell>{item.membershipNo}</TableCell>
                    <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.name}</TableCell>
                    <TableCell>
                      <Badge tone={item.status === "attended" ? "green" : "paper"}>{item.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
