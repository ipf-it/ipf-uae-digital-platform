import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { SimpleSelect } from "../../components/ui/Select";
import { SegmentedTabs } from "../../components/ui/Tabs";
import { Textarea } from "../../components/ui/Textarea";
import { defaultCmsContent } from "../../cms/defaults";
import { cmsPageKeys, type CmsContent, type CmsPageKey, type CmsSection } from "../../cms/types";
import { api } from "../../lib/api";
import { useToast } from "../../components/ui/Toast";
import { EditorList } from "../EditorList";

function newId() {
  return `section-${Date.now()}`;
}

type Section = "hero" | "gallery" | "news" | "leadership" | "sections";

const sectionItems: { value: Section; label: string }[] = [
  { value: "hero", label: "Home hero" },
  { value: "gallery", label: "Gallery" },
  { value: "news", label: "News" },
  { value: "leadership", label: "Leadership" },
  { value: "sections", label: "Page sections" },
];

export default function ContentTab() {
  const toast = useToast();
  const [content, setContent] = useState<CmsContent>(defaultCmsContent);
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState<Section>("hero");
  const [pageKey, setPageKey] = useState<CmsPageKey>("home");

  const extras = content.extras[pageKey] ?? [];

  const mediaOptions = useMemo(() => {
    const srcs = [
      ...content.heroSlides.map((item) => item.src),
      ...content.galleryImages.map((item) => item.src),
      ...content.eventHighlights.flatMap((item) => item.slides.map((slide) => slide.src)),
    ];
    return [...new Set(srcs)];
  }, [content]);

  useEffect(() => {
    void api<CmsContent>("/api/cms/content")
      .then((loaded) => setContent({ ...defaultCmsContent, ...loaded, extras: { ...defaultCmsContent.extras, ...(loaded.extras ?? {}) } }))
      .catch(() => setContent(defaultCmsContent))
      .finally(() => setReady(true));
  }, []);

  async function save() {
    try {
      await api("/api/cms/content", { method: "PUT", body: JSON.stringify(content) });
      toast.success("Saved. Refresh the public pages to see updates.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  }

  async function upload(file: File, apply: (src: string) => void) {
    try {
      const result = await api<{ src: string }>("/api/cms/upload", {
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

  function updateSection(page: CmsPageKey, index: number, updated: CmsSection) {
    const next = [...(content.extras[page] ?? [])];
    next[index] = updated;
    setContent({ ...content, extras: { ...content.extras, [page]: next } });
  }

  if (!ready) return <p className="text-sm text-[var(--ipf-muted)]">Loading site content…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Site content</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Content editor</h2>
        </div>
        <Button type="button" variant="gold" onClick={() => void save()}>
          Save to website
        </Button>
      </div>

      <SegmentedTabs value={section} onValueChange={setSection} items={sectionItems} />

      {section === "hero" ? (
        <EditorList
          title="Home hero carousel"
          hint="These photographs rotate on the home page. Add a title and caption for each."
          items={content.heroSlides}
          mediaOptions={mediaOptions}
          onChange={(heroSlides) => setContent({ ...content, heroSlides })}
          onUpload={(file, index) =>
            void upload(file, (src) => {
              const next = [...content.heroSlides];
              next[index] = { ...next[index], src };
              setContent({ ...content, heroSlides: next });
            })
          }
          onAdd={() => setContent({ ...content, heroSlides: [...content.heroSlides, { src: mediaOptions[0] ?? "", alt: "IPF photograph" }] })}
        />
      ) : null}

      {section === "gallery" ? (
        <EditorList
          title="Gallery photographs"
          hint="Used by the home carousel, gallery page and any new photo sections."
          items={content.galleryImages}
          mediaOptions={mediaOptions}
          onChange={(galleryImages) => setContent({ ...content, galleryImages })}
          onUpload={(file, index) =>
            void upload(file, (src) => {
              const next = [...content.galleryImages];
              next[index] = { ...next[index], src };
              setContent({ ...content, galleryImages: next });
            })
          }
          onAdd={() => setContent({ ...content, galleryImages: [...content.galleryImages, { src: "", alt: "New gallery photograph" }] })}
        />
      ) : null}

      {section === "news" ? (
        <div className="space-y-4">
          {content.news.map((item, index) => (
            <Card key={item.slug} size="sm">
              <div className="grid gap-2">
                <Input
                  value={item.title}
                  placeholder="Headline"
                  onChange={(e) => {
                    const news = [...content.news];
                    news[index] = { ...item, title: e.target.value };
                    setContent({ ...content, news });
                  }}
                />
                <Input
                  value={item.image}
                  placeholder="Image path"
                  onChange={(e) => {
                    const news = [...content.news];
                    news[index] = { ...item, image: e.target.value };
                    setContent({ ...content, news });
                  }}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      void upload(file, (src) => {
                        const news = [...content.news];
                        news[index] = { ...item, image: src };
                        setContent({ ...content, news });
                      });
                  }}
                />
                <Textarea
                  className="min-h-24"
                  value={item.body}
                  placeholder="Article body"
                  onChange={(e) => {
                    const news = [...content.news];
                    news[index] = { ...item, body: e.target.value };
                    setContent({ ...content, news });
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {section === "leadership" ? (
        <div className="space-y-4">
          <p className="text-sm leading-7 text-[var(--ipf-muted)]">Central Committee photographs and roles shown on the home page and Leadership page.</p>
          {content.leadership.map((member, index) => (
            <Card key={`${member.name}-${index}`} size="sm">
              <div className="grid gap-2">
                <Input
                  value={member.name}
                  placeholder="Name"
                  onChange={(e) => {
                    const leadership = [...content.leadership];
                    leadership[index] = { ...member, name: e.target.value };
                    setContent({ ...content, leadership });
                  }}
                />
                <Input
                  value={member.role}
                  placeholder="Role"
                  onChange={(e) => {
                    const leadership = [...content.leadership];
                    leadership[index] = { ...member, role: e.target.value };
                    setContent({ ...content, leadership });
                  }}
                />
                <Input
                  value={member.image}
                  placeholder="Image path"
                  onChange={(e) => {
                    const leadership = [...content.leadership];
                    leadership[index] = { ...member, image: e.target.value };
                    setContent({ ...content, leadership });
                  }}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      void upload(file, (src) => {
                        const leadership = [...content.leadership];
                        leadership[index] = { ...member, image: src };
                        setContent({ ...content, leadership });
                      });
                  }}
                />
              </div>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={() => setContent({ ...content, leadership: [...content.leadership, { name: "", role: "", image: "" }] })}>
            Add member
          </Button>
        </div>
      ) : null}

      {section === "sections" ? (
        <div className="space-y-4">
          <Field label="Page" htmlFor="cms-page" className="max-w-sm">
            <SimpleSelect id="cms-page" value={pageKey} onValueChange={(value) => setPageKey(value as CmsPageKey)} placeholder="Select page" options={cmsPageKeys} />
          </Field>
          <p className="text-sm leading-7 text-[var(--ipf-muted)]">Add a carousel, text block, photo grid or call-to-action. New sections appear at the bottom of that page.</p>
          {extras.map((item, index) => (
            <Card key={item.id} size="sm">
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <SimpleSelect
                    value={item.type}
                    onValueChange={(value) => updateSection(pageKey, index, { ...item, type: value as CmsSection["type"] })}
                    placeholder="Section type"
                    options={[
                      { value: "carousel", label: "Image carousel" },
                      { value: "photoGrid", label: "Photo grid" },
                      { value: "richText", label: "Text section" },
                      { value: "cta", label: "Call to action" },
                    ]}
                  />
                  <Input value={item.title} placeholder="Section title" onChange={(event) => updateSection(pageKey, index, { ...item, title: event.target.value })} />
                </div>
                <Textarea
                  className="min-h-20"
                  value={item.description ?? item.body ?? ""}
                  placeholder="Section text"
                  onChange={(event) => updateSection(pageKey, index, { ...item, description: event.target.value, body: event.target.value })}
                />
                {item.type === "carousel" || item.type === "photoGrid" ? (
                  <EditorList
                    title="Section photographs"
                    items={item.slides ?? []}
                    mediaOptions={mediaOptions}
                    onChange={(slides) => updateSection(pageKey, index, { ...item, slides })}
                    onUpload={(file, slideIndex) =>
                      void upload(file, (src) => {
                        const slides = [...(item.slides ?? [])];
                        slides[slideIndex] = { ...slides[slideIndex], src };
                        updateSection(pageKey, index, { ...item, slides });
                      })
                    }
                    onAdd={() => updateSection(pageKey, index, { ...item, slides: [...(item.slides ?? []), { src: "", alt: item.title }] })}
                  />
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setContent({ ...content, extras: { ...content.extras, [pageKey]: extras.filter((_, i) => i !== index) } })}
                >
                  Remove section
                </Button>
              </div>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setContent({
                ...content,
                extras: { ...content.extras, [pageKey]: [...extras, { id: newId(), type: "carousel", title: "New section", description: "", slides: [] }] },
              })
            }
          >
            Add section
          </Button>
        </div>
      ) : null}
    </div>
  );
}
