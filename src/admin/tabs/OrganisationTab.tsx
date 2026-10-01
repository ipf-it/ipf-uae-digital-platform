import { useEffect, useMemo, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/Dialog";
import { DropdownMenu, DropdownMenuButton, DropdownMenuContent, DropdownMenuItem } from "../../components/ui/DropdownMenu";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { SegmentedTabs } from "../../components/ui/Tabs";
import { SimpleSelect } from "../../components/ui/Select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Textarea } from "../../components/ui/Textarea";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { locales } from "../../i18n/locales";
import { useAdmin } from "../AdminProvider";

type Translations = Record<string, { name?: string; description?: string; title?: string }>;

type Chapter = {
  id: string;
  emirate_code: string;
  contact_email: string;
  contact_phone: string;
  facebook_url: string;
  image: string;
  active: boolean;
  translations: Translations;
};

type Council = Chapter & { kind: "state" | "special"; region: string };

type Position = { id: string; slug: string; level: "central" | "chapter" | "council"; display_order: number; translations: Translations };

type Appointment = {
  id: string;
  person_name: string;
  person_image: string;
  position_id: string;
  scope_type: "global" | "chapter" | "council";
  scope_id: string | null;
  status: string;
  workflow_status: string;
  display_order: number;
  bio: string;
  contact_phone: string;
  contact_email: string;
  social_links: { label: string; url: string }[];
  show_contact: boolean;
  membership_no: string;
  positions: { slug: string; level: string } | null;
};

const localeOptions = locales.map((item) => ({ value: item.id, label: item.name }));

const levelForScope: Record<"global" | "chapter" | "council", "central" | "chapter" | "council"> = {
  global: "central",
  chapter: "chapter",
  council: "council",
};

function TranslationFields({
  translations,
  onChange,
  fields,
}: {
  translations: Translations;
  onChange: (next: Translations) => void;
  fields: ("name" | "description" | "title")[];
}) {
  const [locale, setLocale] = useState("en");
  const current = translations[locale] ?? {};
  return (
    <div className="space-y-3 rounded-lg border border-[var(--ipf-line)] p-3">
      <Field label="Editing language" htmlFor="org-locale">
        <SimpleSelect id="org-locale" value={locale} onValueChange={setLocale} placeholder="Language" options={localeOptions} />
      </Field>
      {fields.includes("name") ? (
        <Field label="Name" htmlFor="org-name">
          <Input id="org-name" value={current.name ?? ""} onChange={(e) => onChange({ ...translations, [locale]: { ...current, name: e.target.value } })} />
        </Field>
      ) : null}
      {fields.includes("title") ? (
        <Field label="Title" htmlFor="org-title">
          <Input id="org-title" value={current.title ?? ""} onChange={(e) => onChange({ ...translations, [locale]: { ...current, title: e.target.value } })} />
        </Field>
      ) : null}
      {fields.includes("description") ? (
        <Field label="Description" htmlFor="org-description">
          <Textarea id="org-description" className="min-h-20" value={current.description ?? ""} onChange={(e) => onChange({ ...translations, [locale]: { ...current, description: e.target.value } })} />
        </Field>
      ) : null}
    </div>
  );
}

function ChaptersView() {
  const toast = useToast();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Chapter | null>(null);

  async function load() {
    const result = await api<{ chapters: Chapter[] }>("/api/admin/org/chapters");
    setChapters(result.chapters);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load chapters"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEdit(chapter: Chapter) {
    setEditing({ ...chapter, translations: { ...chapter.translations } });
    setDialogOpen(true);
  }

  function openCreate() {
    setEditing({ id: "", emirate_code: "", contact_email: "", contact_phone: "", facebook_url: "", image: "", active: true, translations: {} });
    setDialogOpen(true);
  }

  async function save() {
    if (!editing) return;
    try {
      await api(editing.id && chapters.some((c) => c.id === editing.id) ? `/api/admin/org/chapters/${encodeURIComponent(editing.id)}` : "/api/admin/org/chapters", {
        method: chapters.some((c) => c.id === editing.id) ? "PUT" : "POST",
        body: JSON.stringify({
          id: editing.id,
          emirateCode: editing.emirate_code,
          contactEmail: editing.contact_email,
          contactPhone: editing.contact_phone,
          facebookUrl: editing.facebook_url,
          image: editing.image,
          active: editing.active,
          translations: editing.translations,
        }),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save chapter");
      return;
    }
    toast.success("Chapter saved.");
    setDialogOpen(false);
    await load().catch(() => undefined);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          New chapter
        </Button>
      </div>
      <Table>
        <TableCaption>Chapters</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Id</TableHeader>
            <TableHeader>Name (EN)</TableHeader>
            <TableHeader>Active</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {chapters.map((chapter) => (
            <TableRow key={chapter.id}>
              <TableCell className="font-mono text-xs">{chapter.id}</TableCell>
              <TableCell className="font-semibold text-[var(--ipf-navy)]">{chapter.translations.en?.name ?? ""}</TableCell>
              <TableCell>
                <Badge tone={chapter.active ? "green" : "paper"}>{chapter.active ? "Active" : "Inactive"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuButton />
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => openEdit(chapter)}>Edit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogTitle>{editing?.id ? "Edit chapter" : "New chapter"}</DialogTitle>
          <DialogDescription>Chapter details shown on its public page.</DialogDescription>
          {editing ? (
            <div className="mt-4 grid gap-4">
              <Field label="Chapter id (e.g. dubai)" htmlFor="chapter-id">
                <Input id="chapter-id" value={editing.id} disabled={chapters.some((c) => c.id === editing.id)} onChange={(e) => setEditing({ ...editing, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })} />
              </Field>
              <TranslationFields translations={editing.translations} onChange={(translations) => setEditing({ ...editing, translations })} fields={["name", "description"]} />
              <Field label="Contact email" htmlFor="chapter-email">
                <Input id="chapter-email" value={editing.contact_email} onChange={(e) => setEditing({ ...editing, contact_email: e.target.value })} />
              </Field>
              <Field label="Facebook URL" htmlFor="chapter-fb">
                <Input id="chapter-fb" value={editing.facebook_url} onChange={(e) => setEditing({ ...editing, facebook_url: e.target.value })} />
              </Field>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void save()}>
                  Save
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CouncilsView() {
  const toast = useToast();
  const [councils, setCouncils] = useState<Council[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Council | null>(null);

  async function load() {
    const result = await api<{ councils: Council[] }>("/api/admin/org/councils");
    setCouncils(result.councils);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load councils"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEdit(council: Council) {
    setEditing({ ...council, translations: { ...council.translations } });
    setDialogOpen(true);
  }

  function openCreate() {
    setEditing({ id: "", kind: "state", region: "", emirate_code: "", contact_email: "", contact_phone: "", facebook_url: "", image: "", active: true, translations: {} });
    setDialogOpen(true);
  }

  async function save() {
    if (!editing) return;
    try {
      await api(councils.some((c) => c.id === editing.id) ? `/api/admin/org/councils/${encodeURIComponent(editing.id)}` : "/api/admin/org/councils", {
        method: councils.some((c) => c.id === editing.id) ? "PUT" : "POST",
        body: JSON.stringify({
          id: editing.id,
          kind: editing.kind,
          region: editing.region,
          contactEmail: editing.contact_email,
          image: editing.image,
          active: editing.active,
          translations: editing.translations,
        }),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save council");
      return;
    }
    toast.success("Council saved.");
    setDialogOpen(false);
    await load().catch(() => undefined);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          New council
        </Button>
      </div>
      <Table>
        <TableCaption>Councils</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Id</TableHeader>
            <TableHeader>Name (EN)</TableHeader>
            <TableHeader>Kind</TableHeader>
            <TableHeader>Active</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {councils.map((council) => (
            <TableRow key={council.id}>
              <TableCell className="font-mono text-xs">{council.id}</TableCell>
              <TableCell className="font-semibold text-[var(--ipf-navy)]">{council.translations.en?.name ?? ""}</TableCell>
              <TableCell>
                <Badge tone="paper">{council.kind}</Badge>
              </TableCell>
              <TableCell>
                <Badge tone={council.active ? "green" : "paper"}>{council.active ? "Active" : "Inactive"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuButton />
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => openEdit(council)}>Edit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogTitle>{editing?.id && councils.some((c) => c.id === editing.id) ? "Edit council" : "New council"}</DialogTitle>
          <DialogDescription>Council details shown on its public page.</DialogDescription>
          {editing ? (
            <div className="mt-4 grid gap-4">
              <Field label="Council id (e.g. telangana)" htmlFor="council-id">
                <Input id="council-id" value={editing.id} disabled={councils.some((c) => c.id === editing.id)} onChange={(e) => setEditing({ ...editing, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })} />
              </Field>
              <Field label="Kind" htmlFor="council-kind">
                <SimpleSelect id="council-kind" value={editing.kind} onValueChange={(kind) => setEditing({ ...editing, kind: kind as "state" | "special" })} placeholder="Kind" options={[{ value: "state", label: "State" }, { value: "special", label: "Special" }]} />
              </Field>
              <Field label="Region label" htmlFor="council-region">
                <Input id="council-region" value={editing.region} onChange={(e) => setEditing({ ...editing, region: e.target.value })} />
              </Field>
              <TranslationFields translations={editing.translations} onChange={(translations) => setEditing({ ...editing, translations })} fields={["name", "description"]} />
              <Field label="Contact email" htmlFor="council-email">
                <Input id="council-email" value={editing.contact_email} onChange={(e) => setEditing({ ...editing, contact_email: e.target.value })} />
              </Field>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void save()}>
                  Save
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PositionsView() {
  const toast = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);

  async function load() {
    const result = await api<{ positions: Position[] }>("/api/admin/org/positions");
    setPositions(result.positions);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load positions"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEdit(position: Position) {
    setEditing({ ...position, translations: { ...position.translations } });
    setDialogOpen(true);
  }

  function openCreate() {
    setEditing({ id: "", slug: "", level: "chapter", display_order: 0, translations: {} });
    setDialogOpen(true);
  }

  async function save() {
    if (!editing) return;
    if (!editing.slug.trim()) {
      toast.error("A slug is required");
      return;
    }
    const isExisting = positions.some((p) => p.id === editing.id);
    try {
      await api(isExisting ? `/api/admin/org/positions/${encodeURIComponent(editing.id)}` : "/api/admin/org/positions", {
        method: isExisting ? "PUT" : "POST",
        body: JSON.stringify({
          slug: editing.slug.trim(),
          level: editing.level,
          displayOrder: editing.display_order,
          translations: editing.translations,
        }),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save position");
      return;
    }
    toast.success("Position saved.");
    setDialogOpen(false);
    await load().catch(() => undefined);
  }

  const levelLabel: Record<string, string> = { central: "Central (global)", chapter: "Chapter", council: "Council" };

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm leading-7 text-[var(--ipf-muted)]">
        Define the committee roles available at each level — seniority (lowest number first) controls the order members appear in on the public site.
      </p>
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          New position
        </Button>
      </div>
      <Table>
        <TableCaption>Positions</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Title (EN)</TableHeader>
            <TableHeader>Level</TableHeader>
            <TableHeader>Seniority</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...positions].sort((a, b) => (a.level === b.level ? a.display_order - b.display_order : a.level.localeCompare(b.level))).map((position) => (
            <TableRow key={position.id}>
              <TableCell className="font-semibold text-[var(--ipf-navy)]">{position.translations.en?.title || position.slug}</TableCell>
              <TableCell>
                <Badge tone="paper">{levelLabel[position.level] ?? position.level}</Badge>
              </TableCell>
              <TableCell>{position.display_order}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuButton />
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => openEdit(position)}>Edit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogTitle>{editing?.id ? "Edit position" : "New position"}</DialogTitle>
          <DialogDescription>A committee role that can be assigned to a person at the matching level.</DialogDescription>
          {editing ? (
            <div className="mt-4 grid gap-4">
              <Field label="Slug (internal id, e.g. chapter-treasurer)" htmlFor="position-slug">
                <Input id="position-slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })} />
              </Field>
              <Field label="Level" htmlFor="position-level">
                <SimpleSelect
                  id="position-level"
                  value={editing.level}
                  onValueChange={(level) => setEditing({ ...editing, level: level as Position["level"] })}
                  placeholder="Level"
                  options={[{ value: "central", label: "Central (global)" }, { value: "chapter", label: "Chapter" }, { value: "council", label: "Council" }]}
                />
              </Field>
              <Field label="Seniority (lower shows first)" htmlFor="position-order">
                <Input id="position-order" type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) || 0 })} />
              </Field>
              <TranslationFields translations={editing.translations} onChange={(translations) => setEditing({ ...editing, translations })} fields={["title"]} />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void save()}>
                  Save
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const blankAppointmentForm = {
  personName: "",
  personImage: "",
  positionId: "",
  displayOrder: 0,
  bio: "",
  contactPhone: "",
  contactEmail: "",
  socialLinks: [] as { label: string; url: string }[],
  showContact: false,
  membershipNo: "",
};

function LeadershipView({ isGlobalAdmin, scopeType: fixedScopeType, scopeId: fixedScopeId }: { isGlobalAdmin: boolean; scopeType?: "global" | "chapter" | "council"; scopeId?: string | null }) {
  const toast = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...blankAppointmentForm, scopeType: (fixedScopeType ?? "global") as "global" | "chapter" | "council", scopeId: fixedScopeId ?? "" });
  const [uploading, setUploading] = useState(false);

  async function load() {
    const params = new URLSearchParams();
    if (fixedScopeType) params.set("scopeType", fixedScopeType);
    const [a, p] = await Promise.all([
      api<{ appointments: Appointment[] }>(`/api/admin/org/appointments${params.toString() ? `?${params}` : ""}`),
      api<{ positions: Position[] }>("/api/admin/org/positions"),
    ]);
    setAppointments(a.appointments);
    setPositions(p.positions);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load committee"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const relevantPositions = useMemo(() => {
    const level = levelForScope[form.scopeType];
    return positions.filter((p) => p.level === level).sort((a, b) => a.display_order - b.display_order);
  }, [positions, form.scopeType]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...blankAppointmentForm, scopeType: fixedScopeType ?? "global", scopeId: fixedScopeId ?? "", positionId: "" });
    setDialogOpen(true);
  }

  function openEdit(item: Appointment) {
    setEditingId(item.id);
    setForm({
      personName: item.person_name,
      personImage: item.person_image,
      positionId: item.position_id,
      displayOrder: item.display_order,
      scopeType: item.scope_type,
      scopeId: item.scope_id ?? "",
      bio: item.bio,
      contactPhone: item.contact_phone,
      contactEmail: item.contact_email,
      socialLinks: item.social_links ?? [],
      showContact: item.show_contact,
      membershipNo: item.membership_no,
    });
    setDialogOpen(true);
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const result = await api<{ src: string }>("/api/admin/upload", {
        method: "POST",
        headers: { "x-file-name": file.name, "x-file-type": file.type },
        body: file,
      });
      setForm((value) => ({ ...value, personImage: result.src }));
      toast.success("Photo uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload photo");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!form.personName.trim() || !form.positionId) {
      toast.error("A person name and position are required");
      return;
    }
    if (form.scopeType !== "global" && !form.scopeId.trim()) {
      toast.error("A chapter or council id is required");
      return;
    }
    const payload = {
      personName: form.personName.trim(),
      personImage: form.personImage,
      positionId: form.positionId,
      scopeType: form.scopeType,
      scopeId: form.scopeType === "global" ? null : form.scopeId,
      displayOrder: form.displayOrder,
      bio: form.bio,
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
      socialLinks: form.socialLinks,
      showContact: form.showContact,
      membershipNo: form.membershipNo,
    };
    try {
      if (editingId) {
        await api(`/api/admin/org/appointments/${encodeURIComponent(editingId)}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await api("/api/admin/org/appointments", { method: "POST", body: JSON.stringify(payload) });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save committee member");
      return;
    }
    toast.success(
      isGlobalAdmin
        ? editingId ? "Committee member updated." : "Committee member added."
        : editingId ? "Saved as a draft — submit it for approval when ready." : "Added as a draft — submit it for approval when ready.",
    );
    setDialogOpen(false);
    await load().catch(() => undefined);
  }

  async function endAppointment(id: string) {
    try {
      await api(`/api/admin/org/appointments/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove this committee member");
      return;
    }
    toast.success("Committee member removed.");
    await load().catch(() => undefined);
  }

  async function submitAppointment(id: string) {
    try {
      await api(`/api/admin/org/appointments/${encodeURIComponent(id)}/submit`, { method: "POST" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit this committee member");
      return;
    }
    toast.success("Submitted for super-admin approval.");
    await load().catch(() => undefined);
  }

  const workflowLabel: Record<string, string> = {
    draft: "Draft",
    submitted: "Awaiting approval",
    changes_requested: "Changes requested",
    rejected: "Rejected",
    approved: "Approved",
    published: "Published",
  };

  const sorted = [...appointments].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          Add committee member
        </Button>
      </div>
      <Table>
        <TableCaption>Committee members</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Photo</TableHeader>
            <TableHeader>Person</TableHeader>
            <TableHeader>Position</TableHeader>
            {isGlobalAdmin ? <TableHeader>Scope</TableHeader> : null}
            <TableHeader>Seniority</TableHeader>
            <TableHeader>Status</TableHeader>
            {!isGlobalAdmin ? <TableHeader>Approval</TableHeader> : null}
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.person_image ? (
                  <img src={item.person_image} alt={item.person_name} loading="lazy" decoding="async" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ipf-ivory)] text-xs text-[var(--ipf-muted)]">—</span>
                )}
              </TableCell>
              <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.person_name}</TableCell>
              <TableCell>{item.positions?.slug ?? ""}</TableCell>
              {isGlobalAdmin ? (
                <TableCell>
                  <Badge tone="paper">{item.scope_type === "global" ? "Central" : `${item.scope_type}: ${item.scope_id}`}</Badge>
                </TableCell>
              ) : null}
              <TableCell>{item.display_order}</TableCell>
              <TableCell>
                <Badge tone={item.status === "active" ? "green" : "paper"}>{item.status}</Badge>
              </TableCell>
              {!isGlobalAdmin ? (
                <TableCell>
                  <Badge tone={item.workflow_status === "published" ? "green" : item.workflow_status === "rejected" ? "paper" : "saffron"}>
                    {workflowLabel[item.workflow_status] ?? item.workflow_status}
                  </Badge>
                </TableCell>
              ) : null}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuButton />
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => openEdit(item)}>Edit</DropdownMenuItem>
                    {!isGlobalAdmin && item.workflow_status === "draft" ? (
                      <DropdownMenuItem onSelect={() => void submitAppointment(item.id)}>Submit for approval</DropdownMenuItem>
                    ) : null}
                    {item.status === "active" ? (
                      <DropdownMenuItem onSelect={() => void endAppointment(item.id)}>Remove</DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogTitle>{editingId ? "Edit committee member" : "Add committee member"}</DialogTitle>
          <DialogDescription>
            {isGlobalAdmin ? "Appoint a person to a position, centrally or for one chapter/council." : "Appoint a person to a position within your own chapter/council."}
          </DialogDescription>
          <div className="mt-4 grid gap-4">
            <Field label="Person name" htmlFor="apt-name">
              <Input id="apt-name" value={form.personName} onChange={(e) => setForm({ ...form, personName: e.target.value })} />
            </Field>
            <Field label="Photo" htmlFor="apt-photo">
              <Input
                id="apt-photo"
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                }}
              />
              {form.personImage ? <img src={form.personImage} alt="" className="mt-3 h-20 w-20 rounded-full object-cover" /> : null}
            </Field>
            {isGlobalAdmin ? (
              <Field label="Scope" htmlFor="apt-scope">
                <SimpleSelect
                  id="apt-scope"
                  value={form.scopeType}
                  onValueChange={(scopeType) => setForm({ ...form, scopeType: scopeType as typeof form.scopeType, positionId: "" })}
                  placeholder="Scope"
                  options={[{ value: "global", label: "Central" }, { value: "chapter", label: "Chapter" }, { value: "council", label: "Council" }]}
                />
              </Field>
            ) : null}
            {isGlobalAdmin && form.scopeType !== "global" ? (
              <Field label={`${form.scopeType === "chapter" ? "Chapter" : "Council"} id`} htmlFor="apt-scope-id">
                <Input id="apt-scope-id" value={form.scopeId} onChange={(e) => setForm({ ...form, scopeId: e.target.value })} placeholder="e.g. dubai / telangana" />
              </Field>
            ) : null}
            <Field label="Position" htmlFor="apt-position">
              <SimpleSelect
                id="apt-position"
                value={form.positionId}
                onValueChange={(positionId) => setForm({ ...form, positionId })}
                placeholder={relevantPositions.length ? "Select position" : "No positions defined for this level yet"}
                options={relevantPositions.map((p) => ({ value: p.id, label: p.translations.en?.title || p.slug }))}
              />
            </Field>
            <Field label="Seniority (lower shows first)" htmlFor="apt-order">
              <Input id="apt-order" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 0 })} />
            </Field>
            <Field label="Short bio (optional)" htmlFor="apt-bio">
              <Textarea id="apt-bio" className="min-h-20" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </Field>
            <Field label="Membership number (optional)" htmlFor="apt-membership-no" hint="Lets this office bearer be matched to their member account for future sorting.">
              <Input id="apt-membership-no" value={form.membershipNo} onChange={(e) => setForm({ ...form, membershipNo: e.target.value })} placeholder="IPF-000000" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact phone (optional)" htmlFor="apt-contact-phone">
                <Input id="apt-contact-phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              </Field>
              <Field label="Contact email (optional)" htmlFor="apt-contact-email">
                <Input id="apt-contact-email" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--ipf-navy)]">
              <input type="checkbox" checked={form.showContact} onChange={(e) => setForm({ ...form, showContact: e.target.checked })} />
              Show this phone/email publicly on the website
            </label>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--ipf-navy)]">Social links (optional)</p>
              {form.socialLinks.map((link, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1fr,auto]">
                  <Input placeholder="Label (e.g. LinkedIn)" value={link.label} onChange={(e) => { const next = [...form.socialLinks]; next[i] = { ...link, label: e.target.value }; setForm({ ...form, socialLinks: next }); }} />
                  <Input placeholder="URL" value={link.url} onChange={(e) => { const next = [...form.socialLinks]; next[i] = { ...link, url: e.target.value }; setForm({ ...form, socialLinks: next }); }} />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, socialLinks: form.socialLinks.filter((_, idx) => idx !== i) })}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, socialLinks: [...form.socialLinks, { label: "", url: "" }] })}>
                Add link
              </Button>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void save()} disabled={uploading}>
                {editingId ? "Save changes" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrganisationTab() {
  const { admin, isGlobalAdmin } = useAdmin();
  const [tab, setTab] = useState<"chapters" | "councils" | "positions" | "leadership">("leadership");

  if (!admin) return null;

  const scopeLabel = admin.scopeType === "council" ? "council" : "chapter";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Organisation</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">
          {isGlobalAdmin ? "Chapters, councils & leadership" : `Your ${scopeLabel} committee`}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
          {isGlobalAdmin
            ? "The organisational directory shown across the public site — add a new chapter/council, define committee roles, or change leadership without a code deploy, in any of the site's supported languages."
            : "Add, edit, or remove your committee members — their photo, role and seniority order — shown on your public page and the central Leadership page."}
        </p>
      </div>
      {isGlobalAdmin ? (
        <SegmentedTabs
          value={tab}
          onValueChange={setTab}
          items={[
            { value: "chapters", label: "Chapters" },
            { value: "councils", label: "Councils" },
            { value: "positions", label: "Positions" },
            { value: "leadership", label: "Leadership" },
          ]}
        />
      ) : null}
      {isGlobalAdmin && tab === "chapters" ? <ChaptersView /> : null}
      {isGlobalAdmin && tab === "councils" ? <CouncilsView /> : null}
      {isGlobalAdmin && tab === "positions" ? <PositionsView /> : null}
      {isGlobalAdmin && tab === "leadership" ? <LeadershipView isGlobalAdmin /> : null}
      {!isGlobalAdmin ? <LeadershipView isGlobalAdmin={false} scopeType={admin.scopeType} scopeId={admin.scopeId} /> : null}
    </div>
  );
}
