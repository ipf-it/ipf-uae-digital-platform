import { useEffect, useState } from "react";
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

type Publication = {
  id: string;
  publication_type: string;
  title: string;
  edition: string;
  description: string;
  cover_image: string;
  file_url: string;
  featured_on_homepage: boolean;
  display_order: number;
  active: boolean;
};

const blankForm = { publicationType: "Drishti", title: "", edition: "", description: "", coverImage: "", fileUrl: "", featuredOnHomepage: false, displayOrder: 0, active: true };

export default function PublicationsTab() {
  const toast = useToast();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const result = await api<{ publications: Publication[] }>("/api/admin/publications");
    setPublications(result.publications);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load publications"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...blankForm, displayOrder: publications.length });
    setDialogOpen(true);
  }

  function openEdit(item: Publication) {
    setEditingId(item.id);
    setForm({
      publicationType: item.publication_type,
      title: item.title,
      edition: item.edition,
      description: item.description,
      coverImage: item.cover_image,
      fileUrl: item.file_url,
      featuredOnHomepage: item.featured_on_homepage,
      displayOrder: item.display_order,
      active: item.active,
    });
    setDialogOpen(true);
  }

  async function uploadCover(file: File) {
    setUploading(true);
    try {
      const result = await api<{ src: string }>("/api/admin/upload", { method: "POST", headers: { "x-file-name": file.name, "x-file-type": file.type }, body: file });
      setForm((value) => ({ ...value, coverImage: result.src }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload cover image");
    } finally {
      setUploading(false);
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const result = await api<{ src: string }>("/api/admin/upload", { method: "POST", headers: { "x-file-name": file.name, "x-file-type": file.type }, body: file });
      setForm((value) => ({ ...value, fileUrl: result.src }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload file");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!form.title.trim()) {
      toast.error("A title is required");
      return;
    }
    try {
      await api(editingId ? `/api/admin/publications/${encodeURIComponent(editingId)}` : "/api/admin/publications", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save publication");
      return;
    }
    toast.success(editingId ? "Publication updated." : "Publication added.");
    setDialogOpen(false);
    await load().catch(() => undefined);
  }

  async function remove(id: string) {
    try {
      await api(`/api/admin/publications/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove publication");
      return;
    }
    toast.success("Publication removed.");
    await load().catch(() => undefined);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Publications</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Drishti e-Magazine & publications</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
          Add a new edition with a cover image and a reader link (or an uploaded PDF) — no code deploy needed.
        </p>
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          Add publication
        </Button>
      </div>
      <Table>
        <TableCaption>Publications</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Cover</TableHeader>
            <TableHeader>Title</TableHeader>
            <TableHeader>Edition</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...publications].sort((a, b) => a.display_order - b.display_order).map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.cover_image ? <img src={item.cover_image} alt={item.title} loading="lazy" decoding="async" className="h-12 w-10 object-cover" /> : "—"}</TableCell>
              <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.title}</TableCell>
              <TableCell>{item.edition}</TableCell>
              <TableCell>
                <Badge tone={item.active ? "green" : "paper"}>{item.active ? "Active" : "Hidden"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuButton />
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => openEdit(item)}>Edit</DropdownMenuItem>
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
          <DialogTitle>{editingId ? "Edit publication" : "Add publication"}</DialogTitle>
          <DialogDescription>Shown on the public Drishti / Publications page.</DialogDescription>
          <div className="mt-4 grid gap-4">
            <Field label="Title" htmlFor="pub-title">
              <Input id="pub-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Edition / issue label (e.g. January 2026)" htmlFor="pub-edition">
              <Input id="pub-edition" value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })} />
            </Field>
            <Field label="Description (optional)" htmlFor="pub-desc">
              <Textarea id="pub-desc" className="min-h-16" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Cover image" htmlFor="pub-cover">
              <Input id="pub-cover" type="file" accept="image/*" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadCover(file); }} />
              {form.coverImage ? <img src={form.coverImage} alt="" className="mt-3 h-32 w-28 object-cover" /> : null}
            </Field>
            <Field label="Reader link or uploaded PDF" htmlFor="pub-file" hint="Paste an external reader link (fliphtml5, issuu) or upload a PDF file below.">
              <Input id="pub-file" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://" />
            </Field>
            <Field label="Or upload a PDF" htmlFor="pub-file-upload">
              <Input id="pub-file-upload" type="file" accept="application/pdf" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadFile(file); }} />
            </Field>
            <Field label="Display order (lower shows first)" htmlFor="pub-order">
              <Input id="pub-order" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 0 })} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-[var(--ipf-navy)]">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Visible on the public site
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--ipf-navy)]">
              <input type="checkbox" checked={form.featuredOnHomepage} onChange={(e) => setForm({ ...form, featuredOnHomepage: e.target.checked })} />
              Feature on homepage
            </label>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void save()} disabled={uploading}>
                {editingId ? "Save changes" : "Add publication"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
