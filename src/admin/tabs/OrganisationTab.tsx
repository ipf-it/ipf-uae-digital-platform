import { useEffect, useState } from "react";
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

type Position = { id: string; slug: string; level: string; display_order: number; translations: Translations };

type Appointment = {
  id: string;
  person_name: string;
  person_image: string;
  position_id: string;
  scope_type: "global" | "chapter" | "council";
  scope_id: string | null;
  status: string;
  positions: { slug: string; level: string } | null;
};

const localeOptions = locales.map((item) => ({ value: item.id, label: item.name }));

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

function LeadershipView() {
  const toast = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ personName: "", personImage: "", positionId: "", scopeType: "global" as "global" | "chapter" | "council", scopeId: "" });

  async function load() {
    const [a, p] = await Promise.all([
      api<{ appointments: Appointment[] }>("/api/admin/org/appointments"),
      api<{ positions: Position[] }>("/api/admin/org/positions"),
    ]);
    setAppointments(a.appointments);
    setPositions(p.positions);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load leadership"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setForm({ personName: "", personImage: "", positionId: positions[0]?.id ?? "", scopeType: "global", scopeId: "" });
    setDialogOpen(true);
  }

  async function create() {
    if (!form.personName.trim() || !form.positionId) {
      toast.error("A person name and position are required");
      return;
    }
    try {
      await api("/api/admin/org/appointments", {
        method: "POST",
        body: JSON.stringify({
          personName: form.personName.trim(),
          personImage: form.personImage,
          positionId: form.positionId,
          scopeType: form.scopeType,
          scopeId: form.scopeType === "global" ? null : form.scopeId,
        }),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create appointment");
      return;
    }
    toast.success("Appointment created.");
    setDialogOpen(false);
    await load().catch(() => undefined);
  }

  async function endAppointment(id: string) {
    try {
      await api(`/api/admin/org/appointments/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not end this appointment");
      return;
    }
    toast.success("Appointment ended.");
    await load().catch(() => undefined);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          New appointment
        </Button>
      </div>
      <Table>
        <TableCaption>Appointments</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Person</TableHeader>
            <TableHeader>Position</TableHeader>
            <TableHeader>Scope</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.person_name}</TableCell>
              <TableCell>{item.positions?.slug ?? ""}</TableCell>
              <TableCell>
                <Badge tone="paper">{item.scope_type === "global" ? "Central" : `${item.scope_type}: ${item.scope_id}`}</Badge>
              </TableCell>
              <TableCell>
                <Badge tone={item.status === "active" ? "green" : "paper"}>{item.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {item.status === "active" ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => void endAppointment(item.id)}>
                    End
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogTitle>New appointment</DialogTitle>
          <DialogDescription>Appoint a person to a position, centrally or for one chapter/council.</DialogDescription>
          <div className="mt-4 grid gap-4">
            <Field label="Person name" htmlFor="apt-name">
              <Input id="apt-name" value={form.personName} onChange={(e) => setForm({ ...form, personName: e.target.value })} />
            </Field>
            <Field label="Position" htmlFor="apt-position">
              <SimpleSelect
                id="apt-position"
                value={form.positionId}
                onValueChange={(positionId) => setForm({ ...form, positionId })}
                placeholder="Select position"
                options={positions.map((p) => ({ value: p.id, label: p.translations.en?.title || p.slug }))}
              />
            </Field>
            <Field label="Scope" htmlFor="apt-scope">
              <SimpleSelect
                id="apt-scope"
                value={form.scopeType}
                onValueChange={(scopeType) => setForm({ ...form, scopeType: scopeType as typeof form.scopeType })}
                placeholder="Scope"
                options={[{ value: "global", label: "Central" }, { value: "chapter", label: "Chapter" }, { value: "council", label: "Council" }]}
              />
            </Field>
            {form.scopeType !== "global" ? (
              <Field label={`${form.scopeType === "chapter" ? "Chapter" : "Council"} id`} htmlFor="apt-scope-id">
                <Input id="apt-scope-id" value={form.scopeId} onChange={(e) => setForm({ ...form, scopeId: e.target.value })} placeholder="e.g. dubai / telangana" />
              </Field>
            ) : null}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void create()}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrganisationTab() {
  const [tab, setTab] = useState<"chapters" | "councils" | "leadership">("chapters");
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Organisation</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Chapters, councils & leadership</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
          The organisational directory shown across the public site — add a new chapter/council or change leadership without a code deploy, in any of the site's supported languages.
        </p>
      </div>
      <SegmentedTabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: "chapters", label: "Chapters" },
          { value: "councils", label: "Councils" },
          { value: "leadership", label: "Leadership" },
        ]}
      />
      {tab === "chapters" ? <ChaptersView /> : null}
      {tab === "councils" ? <CouncilsView /> : null}
      {tab === "leadership" ? <LeadershipView /> : null}
    </div>
  );
}
