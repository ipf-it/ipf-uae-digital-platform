import { useEffect, useMemo, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { SimpleSelect } from "../../components/ui/Select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { useAdmin } from "../AdminProvider";

type Inquiry = {
  id: string;
  createdAt: string;
  intent: string;
  name: string;
  email: string;
  phone?: string;
  emirate?: string;
  message?: string;
  status: string;
};

const intents = ["contact", "support", "membership", "jobs"];
const statuses = ["new", "in_progress", "resolved"];
const statusLabel: Record<string, string> = { new: "New", in_progress: "In progress", resolved: "Resolved" };

export default function SupportTab() {
  const { isGlobalAdmin } = useAdmin();
  const toast = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [intentFilter, setIntentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    const result = await api<{ inquiries: Inquiry[] }>("/api/cms/inbox");
    setInquiries(result.inquiries);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load submissions"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus(id: string, status: string) {
    setInquiries((prev) => (prev ? prev.map((item) => (item.id === id ? { ...item, status } : item)) : prev));
    try {
      await api(`/api/admin/inquiries/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update status");
      await load().catch(() => undefined);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (inquiries ?? []).filter((item) => {
      if (intentFilter && item.intent !== intentFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [inquiries, intentFilter, statusFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Support</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Submissions from the website</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            {isGlobalAdmin
              ? "Contact, support, membership and jobs enquiries submitted by visitors across the whole site."
              : "Contact and support enquiries submitted by visitors in your chapter."}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search submissions" />
        </div>
        <div className="w-44">
          <SimpleSelect value={intentFilter} onValueChange={setIntentFilter} placeholder="All types" options={intents} />
        </div>
        <div className="w-44">
          <SimpleSelect value={statusFilter} onValueChange={setStatusFilter} placeholder="All statuses" options={statuses.map((value) => ({ value, label: statusLabel[value] }))} />
        </div>
        {intentFilter || statusFilter || search ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIntentFilter("");
              setStatusFilter("");
              setSearch("");
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <Table>
        <TableCaption>Submissions</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Date</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Message</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {inquiries === null ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading…
              </TableCell>
            </TableRow>
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No submissions match these filters.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.createdAt.slice(0, 10)}</TableCell>
                <TableCell>
                  <Badge tone="paper">{item.intent}</Badge>
                </TableCell>
                <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell className="max-w-xs">{item.message || "—"}</TableCell>
                <TableCell className="min-w-40">
                  <SimpleSelect
                    value={item.status}
                    onValueChange={(status) => void setStatus(item.id, status)}
                    placeholder="Status"
                    options={statuses.map((value) => ({ value, label: statusLabel[value] }))}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
