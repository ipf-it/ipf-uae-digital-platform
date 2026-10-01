import { useEffect, useState, type FormEvent } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/Dialog";
import { DropdownMenu, DropdownMenuButton, DropdownMenuContent, DropdownMenuItem } from "../../components/ui/DropdownMenu";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Textarea } from "../../components/ui/Textarea";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { useAdmin } from "../AdminProvider";

type AdminActivity = {
  id: string;
  title: string;
  summary: string;
  body: string;
  image: string;
  start_date: string | null;
  end_date: string | null;
  featured_on_homepage: boolean;
  workflow_status: string;
};

const blankForm = { title: "", summary: "", body: "", image: "", startDate: "", endDate: "", featuredOnHomepage: false };

const statusTone: Record<string, "navy" | "saffron" | "green" | "paper"> = {
  draft: "paper",
  submitted: "saffron",
  changes_requested: "saffron",
  rejected: "paper",
  approved: "green",
  published: "green",
};

export default function ActivitiesView() {
  const { isGlobalAdmin } = useAdmin();
  const toast = useToast();
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const result = await api<{ activities: AdminActivity[] }>("/api/admin/activities");
    setActivities(result.activities);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load activities"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(blankForm);
    setDialogOpen(true);
  }

  function openEdit(item: AdminActivity) {
    setEditingId(item.id);
    setForm({ title: item.title, summary: item.summary, body: item.body, image: item.image, startDate: item.start_date ?? "", endDate: item.end_date ?? "", featuredOnHomepage: item.featured_on_homepage });
    setDialogOpen(true);
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const result = await api<{ src: string }>("/api/admin/upload", { method: "POST", headers: { "x-file-name": file.name, "x-file-type": file.type }, body: file });
      setForm((value) => ({ ...value, image: result.src }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload image");
    } finally {
      setUploading(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const wasEditing = editingId;
    try {
      await api(editingId ? `/api/admin/activities/${encodeURIComponent(editingId)}` : "/api/admin/activities", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save activity");
      return;
    }
    toast.success(wasEditing ? (isGlobalAdmin ? "Activity updated." : "Activity updated as a draft.") : "Activity created.");
    setDialogOpen(false);
    await load().catch(() => undefined);
  }

  async function remove(id: string) {
    try {
      await api(`/api/admin/activities/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove activity");
      return;
    }
    toast.success("Activity removed.");
    await load().catch(() => undefined);
  }

  async function submit(id: string) {
    try {
      await api(`/api/admin/activities/${encodeURIComponent(id)}/submit`, { method: "POST" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit activity");
      return;
    }
    toast.success("Activity submitted for super-admin approval.");
    await load().catch(() => undefined);
  }

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm leading-7 text-[var(--ipf-muted)]">
        Recurring programmes, campaigns and government interactions — separate from one-off Events, with an optional homepage feature flag.
      </p>
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          Add activity
        </Button>
      </div>
      <Table>
        <TableCaption>Activities & Initiatives</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Title</TableHeader>
            <TableHeader>Dates</TableHeader>
            <TableHeader>Homepage</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.title}</TableCell>
              <TableCell>{[item.start_date, item.end_date].filter(Boolean).join(" – ") || "—"}</TableCell>
              <TableCell>
                <Badge tone={item.featured_on_homepage ? "green" : "paper"}>{item.featured_on_homepage ? "Featured" : "No"}</Badge>
              </TableCell>
              <TableCell>
                <Badge tone={statusTone[item.workflow_status] ?? "paper"}>{item.workflow_status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuButton />
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => openEdit(item)}>Edit</DropdownMenuItem>
                    {!isGlobalAdmin && item.workflow_status === "draft" ? (
                      <DropdownMenuItem onSelect={() => void submit(item.id)}>Submit for approval</DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem onSelect={() => void remove(item.id)}>Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogTitle>{editingId ? "Edit activity" : "Add activity"}</DialogTitle>
          <DialogDescription>{editingId ? "Update this activity's details." : "Fill in the details for a new activity or initiative."}</DialogDescription>
          <form className="mt-4 grid gap-4" onSubmit={save}>
            <Field label="Title" htmlFor="activity-title" required>
              <Input id="activity-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Short summary" htmlFor="activity-summary">
              <Input id="activity-summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </Field>
            <Field label="Full description" htmlFor="activity-body">
              <Textarea id="activity-body" className="min-h-24" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date" htmlFor="activity-start">
                <Input id="activity-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </Field>
              <Field label="End date (optional)" htmlFor="activity-end">
                <Input id="activity-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </Field>
            </div>
            <Field label="Image" htmlFor="activity-image">
              <Input id="activity-image" type="file" accept="image/*" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); }} />
              {form.image ? <img src={form.image} alt="" className="mt-3 h-32 w-full rounded-lg object-cover" /> : null}
            </Field>
            <label className="flex items-center gap-2 text-sm text-[var(--ipf-navy)]">
              <input type="checkbox" checked={form.featuredOnHomepage} onChange={(e) => setForm({ ...form, featuredOnHomepage: e.target.checked })} />
              Feature on homepage
            </label>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {editingId ? "Save changes" : "Create activity"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
