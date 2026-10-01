import { useEffect, useState } from "react";
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
import { locales } from "../../i18n/locales";
import { EditorList } from "../EditorList";
import { useAdmin } from "../AdminProvider";

type Translations = Record<string, { eyebrow?: string; title?: string; description?: string; body?: string }>;
type Slide = { src: string; alt: string; title?: string; caption?: string };
type ButtonItem = { label: string; to: string };
type StatItem = { label: string; value?: string };

type Section = {
  id: string;
  type: "richText" | "photoGrid" | "carousel" | "cta" | "statList" | "imageText";
  position: number;
  workflow_status: string;
  image: string;
  slides: Slide[];
  buttons: ButtonItem[];
  stats: StatItem[];
  starts_at: string | null;
  ends_at: string | null;
  priority: number;
  translations: Translations;
};

const PAGE_OPTIONS = [
  { value: "home", label: "Homepage (hero & key sections)" },
  { value: "about", label: "About IPF" },
  { value: "history", label: "History" },
  { value: "governance", label: "Governance" },
  { value: "membership", label: "Membership" },
  { value: "yuva", label: "IPF Yuva" },
  { value: "privileges", label: "Privileges" },
  { value: "testimonials", label: "Testimonials" },
  { value: "discover-india", label: "Discover India" },
  { value: "support", label: "Support" },
  { value: "contact", label: "Contact" },
  { value: "jobs", label: "Jobs" },
  { value: "donate", label: "Donate" },
  { value: "resources", label: "Resources" },
  { value: "home-extras", label: "Home page (extra sections)" },
];

const typeOptions = [
  { value: "richText", label: "Text" },
  { value: "imageText", label: "Image + text" },
  { value: "statList", label: "List / cards" },
  { value: "photoGrid", label: "Photo grid" },
  { value: "carousel", label: "Photo carousel" },
  { value: "cta", label: "Call to action" },
];

const localeOptions = locales.map((item) => ({ value: item.id, label: item.name }));

const statusLabel: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted for review",
  changes_requested: "Changes requested",
  rejected: "Rejected",
  approved: "Approved",
  published: "Published",
};

function TranslationFields({ translations, onChange, type }: { translations: Translations; onChange: (next: Translations) => void; type: Section["type"] }) {
  const [locale, setLocale] = useState("en");
  const current = translations[locale] ?? {};
  const set = (fields: Partial<Translations[string]>) => onChange({ ...translations, [locale]: { ...current, ...fields } });
  return (
    <div className="space-y-3 rounded-lg border border-[var(--ipf-line)] p-3">
      <Field label="Editing language" htmlFor="section-locale">
        <SimpleSelect id="section-locale" value={locale} onValueChange={setLocale} placeholder="Language" options={localeOptions} />
      </Field>
      {type !== "cta" ? (
        <Field label="Eyebrow (small label above the title)" htmlFor="section-eyebrow">
          <Input id="section-eyebrow" value={current.eyebrow ?? ""} onChange={(e) => set({ eyebrow: e.target.value })} />
        </Field>
      ) : null}
      <Field label="Title" htmlFor="section-title">
        <Input id="section-title" value={current.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
      </Field>
      <Field label="Description (short subtitle)" htmlFor="section-desc">
        <Textarea id="section-desc" className="min-h-16" value={current.description ?? ""} onChange={(e) => set({ description: e.target.value })} />
      </Field>
      {type === "richText" || type === "imageText" ? (
        <Field label="Body text" htmlFor="section-body" hint="One paragraph per blank line. Start a line with • to make it a bullet list instead.">
          <Textarea id="section-body" className="min-h-32" value={current.body ?? ""} onChange={(e) => set({ body: e.target.value })} />
        </Field>
      ) : null}
    </div>
  );
}

const blankSection = (pageId: string, position: number): Omit<Section, "id" | "workflow_status"> & { pageId: string } => ({
  pageId,
  type: "richText",
  position,
  image: "",
  slides: [],
  buttons: [],
  stats: [],
  starts_at: null,
  ends_at: null,
  priority: 0,
  translations: {},
});

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type HomeFields = {
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_intro: string;
  president_quote_title: string;
  president_quote_body: string;
  who_eyebrow: string;
  who_title: string;
  who_body: string;
  join_eyebrow: string;
  join_title: string;
  join_desc: string;
};

const blankHomeFields: HomeFields = {
  hero_badge: "", hero_title: "", hero_subtitle: "", hero_intro: "",
  president_quote_title: "", president_quote_body: "",
  who_eyebrow: "", who_title: "", who_body: "",
  join_eyebrow: "", join_title: "", join_desc: "",
};

/** The homepage's actual hero/key-section text — fixed named fields (not generic blocks, since
 * the homepage's layout is bespoke) — editable in any of the site's languages, same locale-switcher
 * pattern as every other translated content type this session. Missing languages are filled in
 * automatically by machine translation on save (see server/translate.ts). */
function HomeContentEditor() {
  const toast = useToast();
  const [translations, setTranslations] = useState<Record<string, HomeFields>>({});
  const [locale, setLocale] = useState("en");
  const [saving, setSaving] = useState(false);

  async function load() {
    const result = await api<{ translations: Record<string, HomeFields> }>("/api/admin/home-content");
    setTranslations(result.translations);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load homepage content"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = translations[locale] ?? blankHomeFields;
  const set = (fields: Partial<HomeFields>) => setTranslations({ ...translations, [locale]: { ...current, ...fields } });

  async function save() {
    setSaving(true);
    try {
      await api("/api/admin/home-content", { method: "PUT", body: JSON.stringify({ translations }) });
      toast.success("Homepage updated. Missing languages were filled in automatically.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save homepage content");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-[var(--ipf-line)] bg-white p-4">
      <p className="text-sm leading-6 text-[var(--ipf-muted)]">
        This is the actual hero and key-section text shown at the top of <strong>ipf-uae-digital-platform.vercel.app</strong>. Edit in one language — every other supported language is translated automatically when you save.
      </p>
      <Field label="Editing language" htmlFor="home-locale">
        <SimpleSelect id="home-locale" value={locale} onValueChange={setLocale} placeholder="Language" options={localeOptions} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Hero badge" htmlFor="home-badge">
          <Input id="home-badge" value={current.hero_badge} onChange={(e) => set({ hero_badge: e.target.value })} />
        </Field>
        <Field label="Hero subtitle" htmlFor="home-subtitle">
          <Input id="home-subtitle" value={current.hero_subtitle} onChange={(e) => set({ hero_subtitle: e.target.value })} />
        </Field>
      </div>
      <Field label="Hero title" htmlFor="home-title">
        <Input id="home-title" value={current.hero_title} onChange={(e) => set({ hero_title: e.target.value })} />
      </Field>
      <Field label="Hero intro paragraph" htmlFor="home-hero-intro">
        <Textarea id="home-hero-intro" className="min-h-20" value={current.hero_intro} onChange={(e) => set({ hero_intro: e.target.value })} />
      </Field>
      <Field label="President's message heading" htmlFor="home-pres-title">
        <Input id="home-pres-title" value={current.president_quote_title} onChange={(e) => set({ president_quote_title: e.target.value })} />
      </Field>
      <Field label="President's quote" htmlFor="home-pres-body">
        <Textarea id="home-pres-body" className="min-h-20" value={current.president_quote_body} onChange={(e) => set({ president_quote_body: e.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Who we are — eyebrow" htmlFor="home-who-eyebrow">
          <Input id="home-who-eyebrow" value={current.who_eyebrow} onChange={(e) => set({ who_eyebrow: e.target.value })} />
        </Field>
        <Field label="Who we are — title" htmlFor="home-who-title">
          <Input id="home-who-title" value={current.who_title} onChange={(e) => set({ who_title: e.target.value })} />
        </Field>
      </div>
      <Field label="Who we are — body" htmlFor="home-who-body">
        <Textarea id="home-who-body" className="min-h-20" value={current.who_body} onChange={(e) => set({ who_body: e.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Join section eyebrow" htmlFor="home-join-eyebrow">
          <Input id="home-join-eyebrow" value={current.join_eyebrow} onChange={(e) => set({ join_eyebrow: e.target.value })} />
        </Field>
        <Field label="Join section title" htmlFor="home-join-title">
          <Input id="home-join-title" value={current.join_title} onChange={(e) => set({ join_title: e.target.value })} />
        </Field>
      </div>
      <Field label="Join section description" htmlFor="home-join-desc">
        <Textarea id="home-join-desc" className="min-h-16" value={current.join_desc} onChange={(e) => set({ join_desc: e.target.value })} />
      </Field>
      <div className="flex justify-end">
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save homepage content"}
        </Button>
      </div>
    </div>
  );
}

export default function PagesTab() {
  const { isGlobalAdmin } = useAdmin();
  const toast = useToast();
  const [pageId, setPageId] = useState(PAGE_OPTIONS[0].value);
  const [sections, setSections] = useState<Section[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankSection(pageId, 0));
  const [uploading, setUploading] = useState(false);

  async function load(forPageId: string) {
    const result = await api<{ sections: Section[] }>(`/api/admin/pages/${encodeURIComponent(forPageId)}/sections`);
    setSections(result.sections);
  }

  useEffect(() => {
    void load(pageId).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load this page"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  function openCreate() {
    setEditingId(null);
    setForm(blankSection(pageId, sections.length));
    setDialogOpen(true);
  }

  function openEdit(section: Section) {
    setEditingId(section.id);
    setForm({
      pageId,
      type: section.type,
      position: section.position,
      image: section.image,
      slides: section.slides,
      buttons: section.buttons,
      stats: section.stats,
      starts_at: section.starts_at,
      ends_at: section.ends_at,
      priority: section.priority,
      translations: { ...section.translations },
    });
    setDialogOpen(true);
  }

  async function upload(file: File, apply: (src: string) => void) {
    setUploading(true);
    try {
      const result = await api<{ src: string }>("/api/admin/upload", { method: "POST", headers: { "x-file-name": file.name, "x-file-type": file.type }, body: file });
      apply(result.src);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload image");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    const payload = {
      type: form.type,
      position: form.position,
      image: form.image,
      slides: form.slides,
      buttons: form.buttons,
      stats: form.stats,
      startsAt: form.starts_at,
      endsAt: form.ends_at,
      priority: form.priority,
      translations: form.translations,
    };
    try {
      if (editingId) {
        await api(`/api/admin/pages/${encodeURIComponent(pageId)}/sections/${encodeURIComponent(editingId)}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await api(`/api/admin/pages/${encodeURIComponent(pageId)}/sections`, { method: "POST", body: JSON.stringify(payload) });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save this section");
      return;
    }
    toast.success(isGlobalAdmin ? (editingId ? "Section updated." : "Section added.") : editingId ? "Section updated as a draft." : "Section added as a draft — submit it for approval when ready.");
    setDialogOpen(false);
    await load(pageId).catch(() => undefined);
  }

  async function remove(id: string) {
    try {
      await api(`/api/admin/pages/${encodeURIComponent(pageId)}/sections/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove this section");
      return;
    }
    toast.success("Section removed.");
    await load(pageId).catch(() => undefined);
  }

  async function submit(id: string) {
    try {
      await api(`/api/admin/pages/${encodeURIComponent(pageId)}/sections/${encodeURIComponent(id)}/submit`, { method: "POST" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit this section");
      return;
    }
    toast.success("Section submitted for super-admin approval.");
    await load(pageId).catch(() => undefined);
  }

  async function move(section: Section, direction: -1 | 1) {
    const ordered = [...sections].sort((a, b) => a.position - b.position);
    const index = ordered.findIndex((item) => item.id === section.id);
    const swapWith = ordered[index + direction];
    if (!swapWith) return;
    try {
      await Promise.all([
        api(`/api/admin/pages/${encodeURIComponent(pageId)}/sections/${encodeURIComponent(section.id)}`, { method: "PUT", body: JSON.stringify({ position: swapWith.position }) }),
        api(`/api/admin/pages/${encodeURIComponent(pageId)}/sections/${encodeURIComponent(swapWith.id)}`, { method: "PUT", body: JSON.stringify({ position: section.position }) }),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reorder sections");
      return;
    }
    await load(pageId).catch(() => undefined);
  }

  const ordered = [...sections].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Pages</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Page content</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
          Every block below is what's actually shown on the live page, in this order — add, edit, reorder, or remove blocks, in any of the site's supported languages, no code deploy needed.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-xs">
          <SimpleSelect value={pageId} onValueChange={setPageId} placeholder="Page" options={PAGE_OPTIONS} />
        </div>
        {pageId !== "home" ? (
          <Button type="button" onClick={openCreate}>
            Add section
          </Button>
        ) : null}
      </div>
      {pageId === "home" ? <HomeContentEditor /> : null}
      {pageId !== "home" ? (
      <>
      <Table>
        <TableCaption>Sections on this page, in display order</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Order</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Title (EN)</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {ordered.map((section, index) => (
            <TableRow key={section.id}>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => void move(section, -1)}>
                    ↑
                  </Button>
                  <Button type="button" variant="ghost" size="sm" disabled={index === ordered.length - 1} onClick={() => void move(section, 1)}>
                    ↓
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <Badge tone="paper">{typeOptions.find((t) => t.value === section.type)?.label ?? section.type}</Badge>
              </TableCell>
              <TableCell className="font-semibold text-[var(--ipf-navy)]">{section.translations.en?.title || "(untitled)"}</TableCell>
              <TableCell>
                <Badge tone={section.workflow_status === "published" ? "green" : "paper"}>{statusLabel[section.workflow_status] ?? section.workflow_status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuButton />
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => openEdit(section)}>Edit</DropdownMenuItem>
                    {!isGlobalAdmin && section.workflow_status === "draft" ? (
                      <DropdownMenuItem onSelect={() => void submit(section.id)}>Submit for approval</DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem onSelect={() => void remove(section.id)}>Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogTitle>{editingId ? "Edit section" : "Add section"}</DialogTitle>
          <DialogDescription>Changes go live immediately for a global admin.</DialogDescription>
          <div className="mt-4 grid gap-4">
            <Field label="Section type" htmlFor="section-type">
              <SimpleSelect id="section-type" value={form.type} onValueChange={(type) => setForm({ ...form, type: type as Section["type"] })} placeholder="Type" options={typeOptions} disabled={!!editingId} />
            </Field>
            <TranslationFields translations={form.translations} onChange={(translations) => setForm({ ...form, translations })} type={form.type} />

            <div className="grid gap-4 rounded-lg border border-[var(--ipf-line)] p-3 sm:grid-cols-2">
              <Field label="Show from (optional)" htmlFor="section-starts" hint="Leave blank to show immediately once published.">
                <Input
                  id="section-starts"
                  type="datetime-local"
                  value={toLocalInputValue(form.starts_at)}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </Field>
              <Field label="Show until (optional)" htmlFor="section-ends" hint="Leave blank to show indefinitely.">
                <Input
                  id="section-ends"
                  type="datetime-local"
                  value={toLocalInputValue(form.ends_at)}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </Field>
              <Field label="Priority (higher shows first, above normal position order)" htmlFor="section-priority">
                <Input id="section-priority" type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) || 0 })} />
              </Field>
            </div>

            {form.type === "imageText" || form.type === "statList" ? (
              <Field label="Image (optional)" htmlFor="section-image">
                <Input id="section-image" type="file" accept="image/*" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file, (src) => setForm((f) => ({ ...f, image: src }))); }} />
                {form.image ? <img src={form.image} alt="" className="mt-3 h-32 w-full rounded-lg object-cover" /> : null}
              </Field>
            ) : null}

            {form.type === "statList" ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[var(--ipf-navy)]">List items</p>
                {form.stats.map((item, i) => (
                  <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1fr,auto]">
                    <Input placeholder="Text (or stat value, e.g. 500+)" value={item.value ?? ""} onChange={(e) => { const next = [...form.stats]; next[i] = { ...item, value: e.target.value }; setForm({ ...form, stats: next }); }} />
                    <Input placeholder="Label" value={item.label} onChange={(e) => { const next = [...form.stats]; next[i] = { ...item, label: e.target.value }; setForm({ ...form, stats: next }); }} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, stats: form.stats.filter((_, idx) => idx !== i) })}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, stats: [...form.stats, { label: "", value: "" }] })}>
                  Add item
                </Button>
                <p className="text-xs text-[var(--ipf-muted)]">Leave "value" empty for a plain bullet list; fill it in (e.g. "500+") to show as stat cards instead.</p>
              </div>
            ) : null}

            {form.type === "cta" ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[var(--ipf-navy)]">Buttons</p>
                {form.buttons.map((button, i) => (
                  <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1fr,auto]">
                    <Input placeholder="Label" value={button.label} onChange={(e) => { const next = [...form.buttons]; next[i] = { ...button, label: e.target.value }; setForm({ ...form, buttons: next }); }} />
                    <Input placeholder="Link (e.g. /register)" value={button.to} onChange={(e) => { const next = [...form.buttons]; next[i] = { ...button, to: e.target.value }; setForm({ ...form, buttons: next }); }} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, buttons: form.buttons.filter((_, idx) => idx !== i) })}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, buttons: [...form.buttons, { label: "", to: "" }] })}>
                  Add button
                </Button>
              </div>
            ) : null}

            {form.type === "photoGrid" || form.type === "carousel" ? (
              <EditorList
                title="Photos"
                items={form.slides}
                onChange={(slides) => setForm({ ...form, slides })}
                onUpload={(file, index) => void upload(file, (src) => { const next = [...form.slides]; next[index] = { ...next[index], src }; setForm({ ...form, slides: next }); })}
                onAdd={() => setForm({ ...form, slides: [...form.slides, { src: "", alt: "" }] })}
              />
            ) : null}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void save()} disabled={uploading}>
                {editingId ? "Save changes" : "Add section"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </>
      ) : null}
    </div>
  );
}
