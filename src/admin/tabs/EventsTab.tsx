import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { SimpleSelect } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { useToast } from "../../components/ui/Toast";
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

const blankForm = { title: "", eventDate: "", location: "", body: "", category: "Community", slides: [] as { src: string; alt?: string }[] };

export default function EventsTab() {
  const { isGlobalAdmin } = useAdmin();
  const toast = useToast();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
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

  function edit(item: AdminEvent) {
    setEditingId(item.id);
    setForm({ title: item.title, eventDate: item.event_date, location: item.location, body: item.body, category: item.category, slides: item.slides ?? [] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(blankForm);
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
    cancelEdit();
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

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Events</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Event management</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
          {isGlobalAdmin ? "Global events publish directly." : "Local events remain drafts until a super admin approves them."}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <form onSubmit={saveEvent}>
          <Card title={editingId ? "Edit event" : "Create event"}>
            <div className="grid gap-4">
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
              <div className="flex gap-3">
                <Button type="submit">{editingId ? "Save changes" : "Create event"}</Button>
                {editingId ? (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>
        </form>

        <div className="space-y-3">
          {events.map((item) => (
            <Card key={item.id} title={item.title} description={`${item.event_date || "Date pending"} · ${item.location || "Location pending"}`}>
              <p className="text-sm text-[var(--ipf-muted)]">
                {item.memberCount ?? 0} attending · {item.volunteerCount ?? 0} volunteering
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[var(--ipf-ivory)] px-3 py-1 text-xs font-semibold uppercase">{item.workflow_status}</span>
                <Button type="button" variant="outline" onClick={() => edit(item)}>
                  Edit
                </Button>
                {!isGlobalAdmin && item.workflow_status !== "submitted" ? (
                  <Button type="button" onClick={() => void submit(item.id)}>
                    Submit for approval
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
          {nextCursor ? (
            <Button type="button" variant="outline" className="w-full" onClick={() => void loadMore()} disabled={loadingMore}>
              {loadingMore ? "Loading…" : "Load more events"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
