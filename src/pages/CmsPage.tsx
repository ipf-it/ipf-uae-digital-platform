import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { SimpleSelect } from "../components/ui/Select";
import { SegmentedTabs } from "../components/ui/Tabs";
import { Textarea } from "../components/ui/Textarea";
import { defaultCmsContent } from "../cms/defaults";
import { cmsPageKeys, type CmsContent, type CmsPageKey, type CmsSection } from "../cms/types";

const tokenKey = "ipf-cms-token";

async function api(path: string, init?: RequestInit) {
  const token = sessionStorage.getItem(tokenKey);
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Request failed");
  }
  return response.json();
}

function newId() {
  return `section-${Date.now()}`;
}

export default function CmsPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => sessionStorage.getItem(tokenKey) ?? "");
  const [content, setContent] = useState<CmsContent>(defaultCmsContent);
  const [status, setStatus] = useState("");
  const [tab, setTab] = useState<"hero" | "gallery" | "events" | "news" | "leadership" | "sections" | "inbox">("hero");
  const [pageKey, setPageKey] = useState<CmsPageKey>("home");
  const [inbox, setInbox] = useState<{
    inquiries: { id: string; createdAt: string; intent: string; name: string; email: string; phone?: string; emirate?: string; message?: string }[];
    rsvps: { id: string; createdAt: string; eventTitle: string; name: string; email: string; phone?: string }[];
    donations: { id: string; createdAt: string; name: string; email: string; amountAed: number; note?: string; status: string }[];
    members: { id: string; membershipNo: string; name: string; email: string; phone: string; emirate: string; createdAt: string }[];
  } | null>(null);

  const signedIn = Boolean(token);
  const extras = content.extras[pageKey] ?? [];

  const mediaOptions = useMemo(() => {
    const srcs = [
      ...content.heroSlides.map((item) => item.src),
      ...content.galleryImages.map((item) => item.src),
      ...content.eventHighlights.flatMap((item) => item.slides.map((slide) => slide.src)),
    ];
    return [...new Set(srcs)];
  }, [content]);

  async function signIn() {
    try {
      const result = (await api("/api/cms/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })) as { token: string };
      sessionStorage.setItem(tokenKey, result.token);
      setToken(result.token);
      const loaded = await fetch("/api/cms/content");
      if (loaded.ok) setContent((await loaded.json()) as CmsContent);
      else setContent(defaultCmsContent);
      setStatus("Signed in. Changes save to the site content file.");
      void loadInbox();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign-in failed");
    }
  }

  async function loadInbox() {
    try {
      const data = (await api("/api/cms/inbox")) as NonNullable<typeof inbox>;
      setInbox(data);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load inbox");
    }
  }

  async function save() {
    try {
      await api("/api/cms/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      setStatus("Saved. Refresh the public pages to see updates.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    }
  }

  async function upload(file: File, apply: (src: string) => void) {
    const result = (await api("/api/cms/upload", {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "x-file-name": file.name,
        "x-file-type": file.type,
      },
      body: file,
    })) as { src: string };
    apply(result.src);
    setStatus(`Uploaded ${file.name}`);
  }

  if (!signedIn) {
    return (
      <main className="min-h-screen bg-[var(--ipf-ivory)] px-4 py-16">
        <Card
          className="mx-auto max-w-md"
          size="lg"
          eyebrow="IPF UAE"
          title="Content desk"
          description="Update photographs, events, news and extra page sections without changing code."
        >
          <Field label="Password" htmlFor="cms-password">
            <Input
              id="cms-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <div className="mt-4">
            <Button type="button" onClick={() => void signIn()}>
              Sign in
            </Button>
          </div>
          {status ? <p className="mt-4 text-sm text-[var(--ipf-muted)]">{status}</p> : null}
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--ipf-ivory)]">
      <header className="border-b border-[var(--ipf-line)] bg-[var(--ipf-paper)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">CMS</p>
            <h1 className="text-xl font-bold text-[var(--ipf-navy)]">Indian People's Forum UAE</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void save()}>
              Save to website
            </Button>
            <Button asChild variant="outline">
              <a href="/">View site</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {status ? <p className="mb-4 text-sm text-[var(--ipf-muted)]">{status}</p> : null}
        <div className="mb-6">
          <SegmentedTabs
            value={tab}
            onValueChange={(value) => {
              setTab(value);
              if (value === "inbox") void loadInbox();
            }}
            items={[
              { value: "hero", label: "Home hero" },
              { value: "gallery", label: "Gallery" },
              { value: "events", label: "Events" },
              { value: "news", label: "News" },
              { value: "leadership", label: "Leadership" },
              { value: "sections", label: "Page sections" },
              { value: "inbox", label: "Inbox" },
            ]}
          />
        </div>

        {tab === "hero" ? (
          <EditorList
            title="Home hero carousel"
            hint="These five major programmes rotate on the home page, as on ipf-uae.org. Add a title and caption for each photograph."
            items={content.heroSlides}
            mediaOptions={mediaOptions}
            onChange={(heroSlides) => setContent({ ...content, heroSlides })}
            onUpload={(file, index) => void upload(file, (src) => {
              const next = [...content.heroSlides];
              next[index] = { ...next[index], src };
              setContent({ ...content, heroSlides: next });
            })}
            onAdd={() => setContent({ ...content, heroSlides: [...content.heroSlides, { src: mediaOptions[0] ?? "", alt: "IPF photograph" }] })}
          />
        ) : null}

        {tab === "gallery" ? (
          <EditorList
            title="Gallery photographs"
            hint="Used by the home carousel, gallery page and any new photo sections."
            items={content.galleryImages}
            mediaOptions={mediaOptions}
            onChange={(galleryImages) => setContent({ ...content, galleryImages })}
            onUpload={(file, index) => void upload(file, (src) => {
              const next = [...content.galleryImages];
              next[index] = { ...next[index], src };
              setContent({ ...content, galleryImages: next });
            })}
            onAdd={() => setContent({ ...content, galleryImages: [...content.galleryImages, { src: "", alt: "New gallery photograph" }] })}
          />
        ) : null}

        {tab === "events" ? (
          <div className="space-y-6">
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">
              Add a dated event with a photograph carousel. These appear on the Events page above the annual calendar.
            </p>
            {content.eventHighlights.map((event, eventIndex) => (
              <Card key={event.id} size="sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={event.title}
                    onChange={(e) => {
                      const eventHighlights = [...content.eventHighlights];
                      eventHighlights[eventIndex] = { ...event, title: e.target.value };
                      setContent({ ...content, eventHighlights });
                    }}
                    placeholder="Event title"
                  />
                  <Input
                    value={event.date}
                    onChange={(e) => {
                      const eventHighlights = [...content.eventHighlights];
                      eventHighlights[eventIndex] = { ...event, date: e.target.value };
                      setContent({ ...content, eventHighlights });
                    }}
                    placeholder="Date"
                  />
                </div>
                <Textarea
                  className="mt-3 min-h-24"
                  value={event.body ?? ""}
                  onChange={(e) => {
                    const eventHighlights = [...content.eventHighlights];
                    eventHighlights[eventIndex] = { ...event, body: e.target.value };
                    setContent({ ...content, eventHighlights });
                  }}
                  placeholder="Event description"
                />
                <EditorList
                  title="Event photographs"
                  items={event.slides}
                  mediaOptions={mediaOptions}
                  onChange={(slides) => {
                    const eventHighlights = [...content.eventHighlights];
                    eventHighlights[eventIndex] = { ...event, slides };
                    setContent({ ...content, eventHighlights });
                  }}
                  onUpload={(file, index) => void upload(file, (src) => {
                    const eventHighlights = [...content.eventHighlights];
                    const slides = [...event.slides];
                    slides[index] = { ...slides[index], src };
                    eventHighlights[eventIndex] = { ...event, slides };
                    setContent({ ...content, eventHighlights });
                  })}
                  onAdd={() => {
                    const eventHighlights = [...content.eventHighlights];
                    eventHighlights[eventIndex] = { ...event, slides: [...event.slides, { src: "", alt: event.title }] };
                    setContent({ ...content, eventHighlights });
                  }}
                />
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setContent({
                  ...content,
                  eventHighlights: [
                    ...content.eventHighlights,
                    { id: newId(), title: "New IPF event", date: "", location: "", body: "", slides: [] },
                  ],
                })
              }
            >
              Add event
            </Button>
          </div>
        ) : null}

        {tab === "news" ? (
          <div className="space-y-4">
            {content.news.map((item, index) => (
              <Card key={item.slug} size="sm">
                <Input
                  value={item.title}
                  onChange={(e) => {
                    const news = [...content.news];
                    news[index] = { ...item, title: e.target.value };
                    setContent({ ...content, news });
                  }}
                  placeholder="Headline"
                />
                <Input
                  className="mt-2"
                  value={item.image}
                  onChange={(e) => {
                    const news = [...content.news];
                    news[index] = { ...item, image: e.target.value };
                    setContent({ ...content, news });
                  }}
                  placeholder="Image path"
                />
                <Input
                  className="mt-2"
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
                  className="mt-2 min-h-24"
                  value={item.body}
                  onChange={(e) => {
                    const news = [...content.news];
                    news[index] = { ...item, body: e.target.value };
                    setContent({ ...content, news });
                  }}
                  placeholder="Article body"
                />
              </Card>
            ))}
          </div>
        ) : null}

        {tab === "leadership" ? (
          <div className="space-y-4">
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">
              Central Committee photographs and roles shown on the home page and Leadership page.
            </p>
            {content.leadership.map((member, index) => (
              <Card key={`${member.name}-${index}`} size="sm">
                <Input
                  value={member.name}
                  onChange={(e) => {
                    const leadership = [...content.leadership];
                    leadership[index] = { ...member, name: e.target.value };
                    setContent({ ...content, leadership });
                  }}
                  placeholder="Name"
                />
                <Input
                  className="mt-2"
                  value={member.role}
                  onChange={(e) => {
                    const leadership = [...content.leadership];
                    leadership[index] = { ...member, role: e.target.value };
                    setContent({ ...content, leadership });
                  }}
                  placeholder="Role"
                />
                <Input
                  className="mt-2"
                  value={member.image}
                  onChange={(e) => {
                    const leadership = [...content.leadership];
                    leadership[index] = { ...member, image: e.target.value };
                    setContent({ ...content, leadership });
                  }}
                  placeholder="Image path"
                />
                <Input
                  className="mt-2"
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
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setContent({
                  ...content,
                  leadership: [...content.leadership, { name: "", role: "", image: "" }],
                })
              }
            >
              Add member
            </Button>
          </div>
        ) : null}

        {tab === "sections" ? (
          <div className="space-y-4">
            <Field label="Page" htmlFor="cms-page" className="max-w-sm">
              <SimpleSelect
                id="cms-page"
                value={pageKey}
                onValueChange={(value) => setPageKey(value as CmsPageKey)}
                placeholder="Select page"
                options={cmsPageKeys}
              />
            </Field>
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">
              Add a carousel, text block, photo grid or call-to-action. New sections appear at the bottom of that page.
            </p>
            {extras.map((section, index) => (
              <Card key={section.id} size="sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <SimpleSelect
                    value={section.type}
                    onValueChange={(value) =>
                      updateSection(pageKey, index, { ...section, type: value as CmsSection["type"] })
                    }
                    placeholder="Section type"
                    options={[
                      { value: "carousel", label: "Image carousel" },
                      { value: "photoGrid", label: "Photo grid" },
                      { value: "richText", label: "Text section" },
                      { value: "cta", label: "Call to action" },
                    ]}
                  />
                  <Input
                    value={section.title}
                    onChange={(event) => updateSection(pageKey, index, { ...section, title: event.target.value })}
                    placeholder="Section title"
                  />
                </div>
                <Textarea
                  className="mt-3 min-h-20"
                  value={section.description ?? section.body ?? ""}
                  onChange={(event) =>
                    updateSection(pageKey, index, {
                      ...section,
                      description: event.target.value,
                      body: event.target.value,
                    })
                  }
                  placeholder="Section text"
                />
                {section.type === "carousel" || section.type === "photoGrid" ? (
                  <EditorList
                    title="Section photographs"
                    items={section.slides ?? []}
                    mediaOptions={mediaOptions}
                    onChange={(slides) => updateSection(pageKey, index, { ...section, slides })}
                    onUpload={(file, slideIndex) => void upload(file, (src) => {
                      const slides = [...(section.slides ?? [])];
                      slides[slideIndex] = { ...slides[slideIndex], src };
                      updateSection(pageKey, index, { ...section, slides });
                    })}
                    onAdd={() => updateSection(pageKey, index, { ...section, slides: [...(section.slides ?? []), { src: "", alt: section.title }] })}
                  />
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    const next = extras.filter((_, itemIndex) => itemIndex !== index);
                    setContent({ ...content, extras: { ...content.extras, [pageKey]: next } });
                  }}
                >
                  Remove section
                </Button>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setContent({
                  ...content,
                  extras: {
                    ...content.extras,
                    [pageKey]: [
                      ...extras,
                      { id: newId(), type: "carousel", title: "New section", description: "", slides: [] },
                    ],
                  },
                })
              }
            >
              Add section
            </Button>
          </div>
        ) : null}

        {tab === "inbox" ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">
                Inquiries, RSVPs, donation pledges and member accounts recorded by the local CMS API.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => void loadInbox()}>
                Refresh
              </Button>
            </div>
            <InboxList
              title="Inquiries"
              empty="No inquiries yet."
              rows={(inbox?.inquiries ?? []).map((item) => [
                item.createdAt.slice(0, 10),
                item.intent,
                item.name,
                item.email,
                item.message ?? "",
              ])}
            />
            <InboxList
              title="Event RSVPs"
              empty="No RSVPs yet."
              rows={(inbox?.rsvps ?? []).map((item) => [
                item.createdAt.slice(0, 10),
                item.eventTitle,
                item.name,
                item.email,
                item.phone ?? "",
              ])}
            />
            <InboxList
              title="Donation pledges"
              empty="No pledges yet."
              rows={(inbox?.donations ?? []).map((item) => [
                item.createdAt.slice(0, 10),
                `${item.status} · AED ${item.amountAed}`,
                item.name,
                item.email,
                item.note ?? "",
              ])}
            />
            <InboxList
              title="Members"
              empty="No member accounts yet."
              rows={(inbox?.members ?? []).map((item) => [
                item.createdAt.slice(0, 10),
                item.membershipNo,
                item.name,
                item.email,
                item.emirate,
              ])}
            />
          </div>
        ) : null}
      </div>
    </main>
  );

  function updateSection(page: CmsPageKey, index: number, section: CmsSection) {
    const next = [...(content.extras[page] ?? [])];
    next[index] = section;
    setContent({ ...content, extras: { ...content.extras, [page]: next } });
  }
}

function InboxList({ title, empty, rows }: { title: string; empty: string; rows: string[][] }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[var(--ipf-navy)]">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--ipf-muted)]">{empty}</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)]">
          <table className="min-w-full text-left text-sm">
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`} className="border-t border-[var(--ipf-line)] first:border-0">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="max-w-xs px-3 py-2 align-top text-[var(--ipf-navy)]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

type EditorListProps = {
  title: string;
  hint?: string;
  items: { src: string; alt: string; title?: string; caption?: string }[];
  mediaOptions: string[];
  onChange: (items: { src: string; alt: string; title?: string; caption?: string }[]) => void;
  onUpload: (file: File, index: number) => void;
  onAdd: () => void;
};

function EditorList({ title, hint, items, onChange, onUpload, onAdd }: EditorListProps) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[var(--ipf-navy)]">{title}</h2>
      {hint ? <p className="mt-1 text-sm leading-6 text-[var(--ipf-muted)]">{hint}</p> : null}
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={`${item.src}-${index}`} className="grid gap-3 overflow-hidden rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-3 shadow-[0_8px_24px_rgba(11,31,58,0.06)] sm:grid-cols-[96px,1fr]">
            {item.src ? <img src={item.src} alt="" className="h-20 w-full rounded-lg object-cover" /> : <div className="h-20 rounded-lg bg-[var(--ipf-line)]" />}
            <div className="grid gap-2">
              <Input
                placeholder="Image path"
                value={item.src}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...item, src: event.target.value };
                  onChange(next);
                }}
              />
              <Input
                placeholder="Title"
                value={item.title ?? ""}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...item, title: event.target.value };
                  onChange(next);
                }}
              />
              <Input
                placeholder="Caption"
                value={item.caption ?? item.alt}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...item, caption: event.target.value, alt: event.target.value };
                  onChange(next);
                }}
              />
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onUpload(file, index);
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Button type="button" variant="outline" onClick={onAdd}>
          Add photograph
        </Button>
      </div>
    </section>
  );
}
