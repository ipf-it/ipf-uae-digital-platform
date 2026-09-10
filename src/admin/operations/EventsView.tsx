import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/Dialog";
import { DropdownMenu, DropdownMenuButton, DropdownMenuContent, DropdownMenuItem } from "../../components/ui/DropdownMenu";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { SimpleSelect } from "../../components/ui/Select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Textarea } from "../../components/ui/Textarea";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { useAdmin } from "../AdminProvider";

type AdminEvent = {
  id: string;
  title: string;
  event_date: string;
  location: string;
  body: string;
  category: string;
  workflow_status: string;
  published: boolean;
  slides?: { src: string; alt?: string }[];
  memberCount?: number;
  volunteerCount?: number;
};

const categories = ["Community", "Cultural", "Welfare", "Sports", "Youth", "Religious", "National"];
const statuses = ["draft", "submitted", "changes_requested", "rejected", "approved", "published"];
const blankForm = { title: "", eventDate: "", location: "", body: "", category: "Community", slides: [] as { src: string; alt?: string }[] };

const statusTone: Record<string, "navy" | "saffron" | "green" | "paper"> = {
  draft: "paper",
  submitted: "saffron",
  changes_requested: "saffron",
  rejected: "paper",
  approved: "green",
  published: "green",
};

export default function EventsView() {
  const { isGlobalAdmin } = useAdmin();
  const toast = useToast();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);

  async function load() {
    const result = await api<{ events: AdminEvent[]; nextCursor: string | null }>("/api/admin/events");
    setEvents(result.events);
    setNextCursor(result.nextCursor);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load events"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await api<{ events: AdminEvent[]; nextCursor: string | null }>(`/api/admin/events?after=${encodeURIComponent(nextCursor)}`);
      setEvents((prev) => [...prev, ...result.events]);
      setNextCursor(result.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(blankForm);
    setDialogOpen(true);
  }

  function openEdit(item: AdminEvent) {
    setEditingId(item.id);
    setForm({ title: item.title, eventDate: item.event_date, location: item.location, body: item.body, category: item.category, slides: item.slides ?? [] });
    setDialogOpen(true);
  }

  async function saveEvent(event: FormEvent) {
    event.preventDefault();
    const wasEditing = editingId;
    try {
      await api(editingId ? `/api/admin/events/${encodeURIComponent(editingId)}` : "/api/admin/events", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save event");
      return;
    }
    toast.success(wasEditing ? (isGlobalAdmin ? "Event updated." : "Event updated as a draft.") : "Event created.");
    setDialogOpen(false);
    try {
      await load();
    } catch {
      toast.error("Saved, but the event list could not refresh. Reload the page to see it.");
    }
  }

  async function upload(file: File) {
    try {
      const result = await api<{ src: string }>("/api/admin/upload", {
        method: "POST",
        headers: { "x-file-name": file.name, "x-file-type": file.type },
        body: file,
      });
      setForm((value) => ({ ...value, slides: [...value.slides, { src: result.src, alt: value.title }] }));
      toast.success("Image uploaded. Save the event to attach it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload image");
    }
  }

  async function submit(id: string) {
    try {
      await api(`/api/admin/events/${encodeURIComponent(id)}/submit`, { method: "POST" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit event");
      return;
    }
    toast.success("Event submitted for super-admin approval.");
    try {
      await load();
    } catch {
      toast.error("Submitted, but the event list could not refresh. Reload the page to see it.");
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((item) => {
      if (statusFilter && item.workflow_status !== statusFilter) return false;
      if (categoryFilter && item.category !== categoryFilter) return false;
      if (q && !item.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [events, search, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--ipf-navy)]">Events</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--ipf-muted)]">
            {isGlobalAdmin ? "Global events publish directly." : "Local events remain drafts until a super admin approves them."}
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          New event
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Input placeholder="Search events" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search events" />
        </div>
        <div className="w-44">
          <SimpleSelect value={statusFilter} onValueChange={setStatusFilter} placeholder="All statuses" options={statuses} />
        </div>
        <div className="w-44">
          <SimpleSelect value={categoryFilter} onValueChange={setCategoryFilter} placeholder="All categories" options={categories} />
        </div>
        {statusFilter || categoryFilter || search ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setStatusFilter("");
              setCategoryFilter("");
              setSearch("");
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <Table>
        <TableCaption>Events</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Title</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Attending</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.title}</TableCell>
              <TableCell>{item.event_date || "—"}</TableCell>
              <TableCell>
                <Badge tone={statusTone[item.workflow_status] ?? "paper"}>{item.workflow_status}</Badge>
              </TableCell>
              <TableCell>
                {item.memberCount ?? 0} · {item.volunteerCount ?? 0} volunteering
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuButton />
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => openEdit(item)}>Edit</DropdownMenuItem>
                    {!isGlobalAdmin && item.workflow_status !== "submitted" ? (
                      <DropdownMenuItem onSelect={() => void submit(item.id)}>Submit for approval</DropdownMenuItem>
                    ) : null}
                    {item.workflow_status === "published" ? (
                      <DropdownMenuItem asChild>
                        <a href={`/events/${item.id}`} target="_blank" rel="noreferrer">
                          View on site
                        </a>
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No events match these filters.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      {nextCursor ? (
        <Button type="button" variant="outline" className="w-full" onClick={() => void loadMore()} disabled={loadingMore}>
          {loadingMore ? "Loading…" : "Load more events"}
        </Button>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogTitle>{editingId ? "Edit event" : "Create event"}</DialogTitle>
          <DialogDescription>{editingId ? "Update this event's details." : "Fill in the details for a new event."}</DialogDescription>
          <form className="mt-4 grid gap-4" onSubmit={saveEvent}>
            <Field label="Event title" htmlFor="event-title" required>
              <Input id="event-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" htmlFor="event-date">
                <Input id="event-date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
              </Field>
              <Field label="Location" htmlFor="event-location">
                <Input id="event-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </Field>
            </div>
            <Field label="Category" htmlFor="event-category">
              <SimpleSelect id="event-category" value={form.category} onValueChange={(category) => setForm({ ...form, category })} placeholder="Category" options={categories} />
            </Field>
            <Field label="Description" htmlFor="event-body">
              <Textarea id="event-body" className="min-h-24" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </Field>
            <Field label="Event pictures" htmlFor="event-image">
              <Input
                id="event-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                }}
              />
            </Field>
            {form.slides.length > 0 ? <p className="text-xs text-[var(--ipf-muted)]">{form.slides.length} image(s) attached</p> : null}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? "Save changes" : "Create event"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
