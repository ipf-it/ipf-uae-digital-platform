import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { useAdmin } from "../AdminProvider";
import { EditorList } from "../EditorList";

type GalleryItem = { src: string; alt: string; title?: string; caption?: string };

type TenantContent = {
  scope_type: string;
  scope_id: string;
  workflow_status: string;
  intro: string;
  highlights: string[];
  hero_image: string;
  gallery: GalleryItem[];
};

const statusLabel: Record<string, string> = {
  draft: "Draft — not visible on the public site yet",
  submitted: "Submitted — awaiting super-admin review",
  changes_requested: "Changes requested — edit and resubmit",
  rejected: "Rejected — edit and resubmit when ready",
  approved: "Approved",
  published: "Published — live on the public site",
};

export default function TenantContentTab() {
  const { admin } = useAdmin();
  const toast = useToast();
  const [content, setContent] = useState<TenantContent | null>(null);
  const [ready, setReady] = useState(false);

  async function load() {
    const result = await api<{ content: TenantContent }>("/api/admin/tenant-content");
    setContent(result.content);
  }

  useEffect(() => {
    void load()
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load your page"))
      .finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (!content) return;
    try {
      const result = await api<{ content: TenantContent }>("/api/admin/tenant-content", {
        method: "PUT",
        body: JSON.stringify({
          intro: content.intro,
          highlights: content.highlights.map((item) => item.trim()).filter(Boolean),
          heroImage: content.hero_image,
          gallery: content.gallery,
        }),
      });
      setContent(result.content);
      toast.success("Saved as a draft.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your page");
    }
  }

  async function submit() {
    try {
      await api("/api/admin/tenant-content/submit", { method: "POST" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit your page");
      return;
    }
    toast.success("Submitted for super-admin approval.");
    try {
      await load();
    } catch {
      toast.error("Submitted, but the page could not refresh. Reload to see the latest status.");
    }
  }

  async function upload(file: File, apply: (src: string) => void) {
    try {
      const result = await api<{ src: string }>("/api/admin/upload", {
        method: "POST",
        headers: { "x-file-name": file.name, "x-file-type": file.type },
        body: file,
      });
      apply(result.src);
      toast.success(`Uploaded ${file.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload image");
    }
  }

  if (!ready) return <p className="text-sm text-[var(--ipf-muted)]">Loading your page…</p>;
  if (!content) return null;

  const scopeLabel = admin?.scopeType === "council" ? "council" : "chapter";
  const highlights = content.highlights.length ? content.highlights : [""];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Your {scopeLabel} page</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Landing page content</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ipf-muted)]">
            Edit your public {scopeLabel} page — intro text, what you're organising, and photos. Changes go live only after a super admin approves them.
          </p>
        </div>
        <span className="rounded-full bg-[var(--ipf-ivory)] px-3 py-1 text-xs font-semibold uppercase text-[var(--ipf-navy)]">
          {statusLabel[content.workflow_status] ?? content.workflow_status}
        </span>
      </div>

      <Card title="Introduction">
        <div className="grid gap-4">
          <Field label="Intro text" htmlFor="tenant-intro">
            <Textarea
              id="tenant-intro"
              className="min-h-28"
              value={content.intro}
              onChange={(e) => setContent({ ...content, intro: e.target.value })}
            />
          </Field>
          <Field label="Hero image" htmlFor="tenant-hero-image">
            <Input
              id="tenant-hero-image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file, (src) => setContent({ ...content, hero_image: src }));
              }}
            />
            {content.hero_image ? <img src={content.hero_image} alt="" className="mt-3 h-32 w-full rounded-lg object-cover" /> : null}
          </Field>
        </div>
      </Card>

      <Card title="What you're conducting / organising">
        <div className="space-y-2">
          {highlights.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                placeholder="e.g. Monthly community welfare drive"
                onChange={(e) => {
                  const next = [...highlights];
                  next[index] = e.target.value;
                  setContent({ ...content, highlights: next });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setContent({ ...content, highlights: highlights.filter((_, i) => i !== index) })}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setContent({ ...content, highlights: [...highlights, ""] })}>
            Add line
          </Button>
        </div>
      </Card>

      <Card title="Photos">
        <EditorList
          title="Gallery"
          hint="Photos shown on your public page, each with an optional title and caption."
          items={content.gallery}
          onChange={(gallery) => setContent({ ...content, gallery })}
          onUpload={(file, index) =>
            void upload(file, (src) => {
              const next = [...content.gallery];
              next[index] = { ...next[index], src };
              setContent({ ...content, gallery: next });
            })
          }
          onAdd={() => setContent({ ...content, gallery: [...content.gallery, { src: "", alt: "" }] })}
        />
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => void save()}>
          Save draft
        </Button>
        <Button type="button" variant="outline" onClick={() => void submit()} disabled={content.workflow_status === "submitted"}>
          Submit for approval
        </Button>
      </div>
    </div>
  );
}
