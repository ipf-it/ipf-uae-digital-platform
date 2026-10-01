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

type Sponsor = {
  id: string;
  name: string;
  logo: string;
  website: string;
  tier: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  description: string;
  active: boolean;
  display_order: number;
};

const blankSponsor = { name: "", logo: "", website: "", tier: "", contact_person: "", contact_phone: "", contact_email: "", description: "", active: true, display_order: 0 };

export default function SponsorsView() {
  const toast = useToast();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankSponsor);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const result = await api<{ sponsors: Sponsor[] }>("/api/admin/sponsors");
    setSponsors(result.sponsors);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load sponsors"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...blankSponsor, display_order: sponsors.length });
    setDialogOpen(true);
  }

  function openEdit(sponsor: Sponsor) {
    setEditingId(sponsor.id);
    setForm({ ...sponsor });
    setDialogOpen(true);
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const result = await api<{ src: string }>("/api/admin/upload", { method: "POST", headers: { "x-file-name": file.name, "x-file-type": file.type }, body: file });
      setForm((value) => ({ ...value, logo: result.src }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload logo");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error("A sponsor name is required");
      return;
    }
    try {
      await api(editingId ? `/api/admin/sponsors/${encodeURIComponent(editingId)}` : "/api/admin/sponsors", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          name: form.name,
          logo: form.logo,
          website: form.website,
          tier: form.tier,
          contactPerson: form.contact_person,
          contactPhone: form.contact_phone,
          contactEmail: form.contact_email,
          description: form.description,
          active: form.active,
          displayOrder: form.display_order,
        }),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save sponsor");
      return;
    }
    toast.success(editingId ? "Sponsor updated." : "Sponsor added.");
    setDialogOpen(false);
    await load().catch(() => undefined);
  }

  async function remove(id: string) {
    try {
      await api(`/api/admin/sponsors/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove sponsor");
      return;
    }
    toast.success("Sponsor removed.");
    await load().catch(() => undefined);
  }

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm leading-7 text-[var(--ipf-muted)]">
        Organisation-level sponsors shown on the public Sponsors page. Link a sponsor to a specific event from that event's edit dialog in the Events tab.
      </p>
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          Add sponsor
        </Button>
      </div>
      <Table>
        <TableCaption>Sponsors</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Logo</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Tier</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...sponsors].sort((a, b) => a.display_order - b.display_order).map((sponsor) => (
            <TableRow key={sponsor.id}>
              <TableCell>
                {sponsor.logo ? <img src={sponsor.logo} alt={sponsor.name} loading="lazy" decoding="async" className="h-10 w-16 object-contain" /> : <span className="text-xs text-[var(--ipf-muted)]">—</span>}
              </TableCell>
              <TableCell className="font-semibold text-[var(--ipf-navy)]">{sponsor.name}</TableCell>
              <TableCell>{sponsor.tier || "—"}</TableCell>
              <TableCell>
                <Badge tone={sponsor.active ? "green" : "paper"}>{sponsor.active ? "Active" : "Inactive"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuButton />
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => openEdit(sponsor)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void remove(sponsor.id)}>Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogTitle>{editingId ? "Edit sponsor" : "Add sponsor"}</DialogTitle>
          <DialogDescription>Shown on the public Sponsors page, and on any event it's linked to.</DialogDescription>
          <div className="mt-4 grid gap-4">
            <Field label="Sponsor name" htmlFor="sponsor-name">
              <Input id="sponsor-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Logo" htmlFor="sponsor-logo">
              <Input id="sponsor-logo" type="file" accept="image/*" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); }} />
              {form.logo ? <img src={form.logo} alt="" className="mt-3 h-16 w-32 object-contain" /> : null}
            </Field>
            <Field label="Website" htmlFor="sponsor-website">
              <Input id="sponsor-website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
            </Field>
            <Field label="Tier (e.g. Gold, Silver, Community Partner)" htmlFor="sponsor-tier">
              <Input id="sponsor-tier" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} />
            </Field>
            <Field label="Description" htmlFor="sponsor-desc">
              <Textarea id="sponsor-desc" className="min-h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact person" htmlFor="sponsor-contact-person">
                <Input id="sponsor-contact-person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
              </Field>
              <Field label="Contact phone" htmlFor="sponsor-contact-phone">
                <Input id="sponsor-contact-phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
              </Field>
            </div>
            <Field label="Contact email" htmlFor="sponsor-contact-email">
              <Input id="sponsor-contact-email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            </Field>
            <Field label="Display order (lower shows first)" htmlFor="sponsor-order">
              <Input id="sponsor-order" type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) || 0 })} />
            </Field>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void save()} disabled={uploading}>
                {editingId ? "Save changes" : "Add sponsor"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
