import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
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
  const [tab, setTab] = useState<"hero" | "gallery" | "events" | "news" | "sections">("hero");
  const [pageKey, setPageKey] = useState<CmsPageKey>("home");

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
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign-in failed");
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
        <div className="mx-auto max-w-md border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">IPF UAE</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--ipf-navy)]">Content desk</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">
            Update photographs, events, news and extra page sections without changing code.
          </p>
          <label className="mt-6 grid gap-1 text-sm font-medium text-[var(--ipf-navy)]">
            Password
            <input className="ipf-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <div className="mt-4">
            <Button type="button" onClick={() => void signIn()}>
              Sign in
            </Button>
          </div>
          {status ? <p className="mt-4 text-sm text-[var(--ipf-muted)]">{status}</p> : null}
        </div>
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
        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["hero", "Home hero"],
              ["gallery", "Gallery"],
              ["events", "Events"],
              ["news", "News"],
              ["sections", "Page sections"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`border px-3 py-2 text-sm ${tab === id ? "border-[var(--ipf-navy)] bg-[var(--ipf-navy)] text-white" : "border-[var(--ipf-line)] text-[var(--ipf-navy)]"}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
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
              <article key={event.id} className="border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="ipf-input" value={event.title} onChange={(e) => {
                    const eventHighlights = [...content.eventHighlights];
                    eventHighlights[eventIndex] = { ...event, title: e.target.value };
                    setContent({ ...content, eventHighlights });
                  }} />
                  <input className="ipf-input" value={event.date} onChange={(e) => {
                    const eventHighlights = [...content.eventHighlights];
                    eventHighlights[eventIndex] = { ...event, date: e.target.value };
                    setContent({ ...content, eventHighlights });
                  }} />
                </div>
                <textarea className="ipf-input mt-3 min-h-24" value={event.body ?? ""} onChange={(e) => {
                  const eventHighlights = [...content.eventHighlights];
                  eventHighlights[eventIndex] = { ...event, body: e.target.value };
                  setContent({ ...content, eventHighlights });
                }} />
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
              </article>
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
              <article key={item.slug} className="border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-4">
                <input className="ipf-input" value={item.title} onChange={(e) => {
                  const news = [...content.news];
                  news[index] = { ...item, title: e.target.value };
                  setContent({ ...content, news });
                }} />
                <input className="ipf-input mt-2" value={item.image} onChange={(e) => {
                  const news = [...content.news];
                  news[index] = { ...item, image: e.target.value };
                  setContent({ ...content, news });
                }} />
                <input className="mt-2 block w-full text-sm" type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file, (src) => {
                    const news = [...content.news];
                    news[index] = { ...item, image: src };
                    setContent({ ...content, news });
                  });
                }} />
                <textarea className="ipf-input mt-2 min-h-24" value={item.body} onChange={(e) => {
                  const news = [...content.news];
                  news[index] = { ...item, body: e.target.value };
                  setContent({ ...content, news });
                }} />
              </article>
            ))}
          </div>
        ) : null}

        {tab === "sections" ? (
          <div className="space-y-4">
            <label className="grid max-w-sm gap-1 text-sm font-medium text-[var(--ipf-navy)]">
              Page
              <select className="ipf-input" value={pageKey} onChange={(event) => setPageKey(event.target.value as CmsPageKey)}>
                {cmsPageKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">
              Add a carousel, text block, photo grid or call-to-action. New sections appear at the bottom of that page.
            </p>
            {extras.map((section, index) => (
              <article key={section.id} className="border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    className="ipf-input"
                    value={section.type}
                    onChange={(event) => updateSection(pageKey, index, { ...section, type: event.target.value as CmsSection["type"] })}
                  >
                    <option value="carousel">Image carousel</option>
                    <option value="photoGrid">Photo grid</option>
                    <option value="richText">Text section</option>
                    <option value="cta">Call to action</option>
                  </select>
                  <input className="ipf-input" value={section.title} onChange={(event) => updateSection(pageKey, index, { ...section, title: event.target.value })} />
                </div>
                <textarea className="ipf-input mt-3 min-h-20" value={section.description ?? section.body ?? ""} onChange={(event) => updateSection(pageKey, index, { ...section, description: event.target.value, body: event.target.value })} />
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
                <button
                  type="button"
                  className="mt-3 text-sm text-[var(--ipf-muted)] underline"
                  onClick={() => {
                    const next = extras.filter((_, itemIndex) => itemIndex !== index);
                    setContent({ ...content, extras: { ...content.extras, [pageKey]: next } });
                  }}
                >
                  Remove section
                </button>
              </article>
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
      </div>
    </main>
  );

  function updateSection(page: CmsPageKey, index: number, section: CmsSection) {
    const next = [...(content.extras[page] ?? [])];
    next[index] = section;
    setContent({ ...content, extras: { ...content.extras, [page]: next } });
  }
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
          <div key={`${item.src}-${index}`} className="grid gap-3 border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-3 sm:grid-cols-[96px,1fr]">
            {item.src ? <img src={item.src} alt="" className="h-20 w-full object-cover" /> : <div className="h-20 bg-[var(--ipf-line)]" />}
            <div className="grid gap-2">
              <input className="ipf-input" placeholder="Image path" value={item.src} onChange={(event) => {
                const next = [...items];
                next[index] = { ...item, src: event.target.value };
                onChange(next);
              }} />
              <input className="ipf-input" placeholder="Title" value={item.title ?? ""} onChange={(event) => {
                const next = [...items];
                next[index] = { ...item, title: event.target.value };
                onChange(next);
              }} />
              <input className="ipf-input" placeholder="Caption" value={item.caption ?? item.alt} onChange={(event) => {
                const next = [...items];
                next[index] = { ...item, caption: event.target.value, alt: event.target.value };
                onChange(next);
              }} />
              <input className="block text-sm" type="file" accept="image/*" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(file, index);
              }} />
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
