import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { SimpleSelect } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { defaultCmsContent } from "../cms/defaults";
import { cmsPageKeys, type CmsContent, type CmsPageKey, type CmsSection } from "../cms/types";
import { api } from "../lib/api";
import { requireSupabaseAuth, supabaseAuth } from "../lib/supabase";

function newId() {
  return `section-${Date.now()}`;
}

export default function CmsPage() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRole] = useState<"central" | "chapter">("central");
  const [scopeType, setScopeType] = useState<"global" | "chapter" | "council">("global");
  const [chapterName, setChapterName] = useState("Central desk");
  const [content, setContent] = useState<CmsContent>(defaultCmsContent);
  const [status, setStatus] = useState("");
  const [tab, setTab] = useState<"overview" | "hero" | "gallery" | "events" | "news" | "leadership" | "sections" | "inbox">("overview");
  const [pageKey, setPageKey] = useState<CmsPageKey>("home");
  const [inbox, setInbox] = useState<{
    inquiries: { id: string; createdAt: string; intent: string; name: string; email: string; phone?: string; emirate?: string; message?: string }[];
    rsvps: { id: string; createdAt: string; eventTitle: string; name: string; email: string; phone?: string; registrationNo?: string }[];
    volunteers: { id: string; createdAt: string; eventTitle: string; name: string; email: string; membershipNo: string; status: string }[];
    donations: { id: string; createdAt: string; name: string; email: string; amountAed: number; note?: string; status: string }[];
    members: { id: string; membershipNo: string; name: string; email: string; phone: string; emirate: string; createdAt: string; kind?: string }[];
    yuva: { id: string; membershipNo: string; name: string; email: string; phone: string; emirate: string; createdAt: string }[];
  } | null>(null);

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
      const { error } = await requireSupabaseAuth().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw error;
      const admin = await api<{ admin: { name: string; role: string; scopeType: string; scopeId?: string } }>("/api/admin/session");
      const result = { role: admin.admin.scopeType === "global" ? "central" as const : "chapter" as const, chapterName: admin.admin.name };
      setScopeType(admin.admin.scopeType as "global" | "chapter" | "council");
      setSignedIn(true);
      setRole(result.role);
      setChapterName(result.chapterName ?? "Central desk");
      if (result.role === "chapter") setTab("inbox");
      const loaded = await fetch("/api/cms/content");
      if (loaded.ok) setContent((await loaded.json()) as CmsContent);
      else setContent(defaultCmsContent);
      setStatus(result.role === "chapter" ? `Signed in to ${result.chapterName}.` : "Signed in to the central desk.");
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

  useEffect(() => {
    void api<{ admin: { name: string; scopeType: string } }>("/api/admin/session")
      .then(async (data) => {
        setSignedIn(true);
        const nextRole = data.admin.scopeType === "global" ? "central" : "chapter";
        setScopeType(data.admin.scopeType as "global" | "chapter" | "council");
        setRole(nextRole);
        setChapterName(data.admin.name ?? "Central desk");
        if (nextRole === "chapter") setTab("inbox");
        try {
          const loaded = await api<CmsContent>("/api/cms/content");
          setContent({ ...defaultCmsContent, ...loaded, extras: { ...defaultCmsContent.extras, ...(loaded.extras ?? {}) } });
        } catch {
          setContent(defaultCmsContent);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    void api("/api/cms/inbox")
      .then((data) => setInbox(data as NonNullable<typeof inbox>))
      .catch((error: unknown) => setStatus(error instanceof Error ? error.message : "Could not load inbox"));
  }, [signedIn]);

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
      <main className="min-h-screen bg-[var(--ipf-navy)] px-4 py-16">
        <Card
          className="mx-auto max-w-lg"
          size="lg"
          eyebrow="IPF UAE"
          title="Content desk"
          description="Sign in with your assigned Supabase administrator account. Access is limited to your chapter or council scope."
        >
          <Field label="Email" htmlFor="cms-email" className="mb-4">
            <Input id="cms-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
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
    <main className="min-h-screen bg-[var(--ipf-ivory)] lg:flex">
      <aside className="bg-[var(--ipf-navy)] px-4 py-6 text-white lg:w-64 lg:shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ipf-gold)]">IPF desk</p>
        <h1 className="mt-2 text-lg font-bold">{chapterName}</h1>
        <p className="mt-1 text-xs text-white/70">{scopeType === "council" ? "Council admin" : scopeType === "chapter" ? "Chapter admin" : "Central admin"}</p>
        <nav className="mt-6 grid gap-1">
          {(role === "central"
            ? [
                ["overview", "Command centre"],
                ["hero", "Home hero"],
                ["gallery", "Gallery"],
                ["events", "Events"],
                ["news", "News"],
                ["leadership", "Leadership"],
                ["sections", "Page sections"],
                ["inbox", "Inbox"],
              ]
            : [["inbox", "Chapter inbox"]]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`rounded-lg px-3 py-2 text-left text-sm ${tab === value ? "bg-white/15 font-semibold" : "text-white/80 hover:bg-white/10"}`}
              onClick={() => {
                setTab(value as typeof tab);
                if (value === "inbox") void loadInbox();
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-8 space-y-2">
          {role === "central" ? (
            <Button type="button" variant="gold" className="w-full" onClick={() => void save()}>
              Save to website
            </Button>
          ) : null}
          <Button asChild variant="secondary" className="w-full">
            <a href="/">View site</a>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => {
              if (supabaseAuth) void supabaseAuth.auth.signOut();
              setSignedIn(false);
              setInbox(null);
              setStatus("");
            }}
          >
            Sign out
          </Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 px-4 py-6 lg:px-8">
        {status ? <p className="mb-4 text-sm text-[var(--ipf-muted)]">{status}</p> : null}

        {tab === "overview" && role === "central" ? (
          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Central oversight</p>
              <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Organisation command centre</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">One view for membership, Yuva, event participation and content awaiting central action. Chapter and council teams create within their assigned scope; publication remains centrally governed.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Members", inbox?.members.length ?? 0, "Lifetime registrations"],
                ["IPF Yuva", inbox?.yuva.length ?? 0, "Volunteer identities"],
                ["Event registrations", inbox?.rsvps.length ?? 0, "All tracked entries"],
                ["Volunteer assignments", inbox?.volunteers.length ?? 0, "Service participation"],
              ].map(([label, value, note]) => <Card key={String(label)} size="sm" eyebrow={String(note)} title={String(value)}><p className="text-sm font-semibold text-[var(--ipf-muted)]">{String(label)}</p></Card>)}
            </div>
            <Card title="Approval pipeline" description="Reusable governance for events, activities, news and social posts.">
              <div className="grid gap-2 sm:grid-cols-4 xl:grid-cols-8">
                {["Draft", "Submitted", "Under review", "Changes", "Approved", "Scheduled", "Published", "Rejected"].map((state, index) => <div key={state} className={`rounded-lg border p-3 text-center text-xs font-semibold ${index === 1 || index === 2 ? "border-[var(--ipf-saffron)] bg-orange-50 text-[var(--ipf-navy)]" : "border-[var(--ipf-line)] bg-[var(--ipf-ivory)] text-[var(--ipf-muted)]"}`}>{state}</div>)}
              </div>
            </Card>
            <Card title="Role & scope model" description="Permissions are evaluated by both role and organisational scope.">
              <div className="grid gap-3 md:grid-cols-5">
                {[
                  ["Super admin", "Global · settings, roles, audit"],
                  ["Content admin", "Global · review & publish"],
                  ["Chapter admin", "Assigned emirate only"],
                  ["Council admin", "Assigned council only"],
                  ["Editor", "Assigned drafts only"],
                ].map(([name, scope]) => <div key={name} className="rounded-xl bg-[var(--ipf-ivory)] p-4"><p className="text-sm font-bold text-[var(--ipf-navy)]">{name}</p><p className="mt-2 text-xs leading-5 text-[var(--ipf-muted)]">{scope}</p></div>)}
              </div>
            </Card>
          </div>
        ) : null}

        {tab === "hero" && role === "central" ? (
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
              Dated programmes are stored in the events table. Upcoming / past, category, emirate and free filters on the public Events page read from that table.
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
                    placeholder="Display date"
                  />
                  <Input
                    value={event.startsAt ?? ""}
                    onChange={(e) => {
                      const eventHighlights = [...content.eventHighlights];
                      eventHighlights[eventIndex] = { ...event, startsAt: e.target.value };
                      setContent({ ...content, eventHighlights });
                    }}
                    placeholder="ISO start (2026-09-05T18:00)"
                  />
                  <Input
                    value={event.location ?? ""}
                    onChange={(e) => {
                      const eventHighlights = [...content.eventHighlights];
                      eventHighlights[eventIndex] = { ...event, location: e.target.value };
                      setContent({ ...content, eventHighlights });
                    }}
                    placeholder="Location"
                  />
                  <SimpleSelect
                    value={event.category ?? "Community"}
                    onValueChange={(category) => {
                      const eventHighlights = [...content.eventHighlights];
                      eventHighlights[eventIndex] = { ...event, category };
                      setContent({ ...content, eventHighlights });
                    }}
                    placeholder="Category"
                    options={["Community", "Cultural", "Welfare", "Sports", "Youth", "Religious", "National"]}
                  />
                  <SimpleSelect
                    value={event.emirate ?? "uae"}
                    onValueChange={(emirate) => {
                      const eventHighlights = [...content.eventHighlights];
                      eventHighlights[eventIndex] = { ...event, emirate };
                      setContent({ ...content, eventHighlights });
                    }}
                    placeholder="Emirate"
                    options={[
                      { value: "uae", label: "UAE-wide" },
                      { value: "dubai", label: "Dubai" },
                      { value: "abu-dhabi", label: "Abu Dhabi" },
                      { value: "sharjah", label: "Sharjah" },
                      { value: "ajman", label: "Ajman" },
                      { value: "al-ain", label: "Al Ain" },
                      { value: "ras-al-khaimah", label: "RAK" },
                      { value: "fujairah", label: "Fujairah" },
                      { value: "umm-al-quwain", label: "UAQ" },
                    ]}
                  />
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-[var(--ipf-navy)]">
                  <input
                    type="checkbox"
                    checked={event.isFree !== false}
                    onChange={(e) => {
                      const eventHighlights = [...content.eventHighlights];
                      eventHighlights[eventIndex] = { ...event, isFree: e.target.checked };
                      setContent({ ...content, eventHighlights });
                    }}
                  />
                  Free admission
                </label>
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
                    { id: newId(), title: "New IPF event", date: "", location: "", body: "", slides: [], category: "Community", emirate: "uae", startsAt: "", isFree: true },
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
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--ipf-navy)]">
                    {role === "chapter" ? `${chapterName} inbox` : "Central inbox"}
                  </h2>
                  <p className="mt-1 text-sm leading-7 text-[var(--ipf-muted)]">
                    {role === "chapter"
                      ? "Members, IPF Yuva and event duty from this emirate."
                      : "Members, Yuva, event registrations, volunteer duty, inquiries and pledges."}
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => void loadInbox()}>
                  Refresh
                </Button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Inquiries", inbox?.inquiries.length ?? 0],
                  ["Members", inbox?.members.length ?? 0],
                  ["IPF Yuva", inbox?.yuva.length ?? 0],
                  ["Registrations", inbox?.rsvps.length ?? 0],
                  ["Yuva duty", inbox?.volunteers.length ?? 0],
                ].map(([label, count]) => (
                  <div key={String(label)} className="rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ipf-muted)]">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-[var(--ipf-navy)]">{count}</p>
                  </div>
                ))}
              </div>
            </div>
            <InboxList
              title="Inquiries"
              empty="No inquiries yet."
              headings={["Date", "Intent", "Name", "Email", "Message"]}
              rows={(inbox?.inquiries ?? []).map((item) => [
                item.createdAt.slice(0, 10),
                item.intent,
                item.name,
                item.email,
                item.message ?? "",
              ])}
            />
            <InboxList
              title="Event registrations"
              empty="No event registrations yet."
              headings={["Date", "Event", "ID", "Name", "Email"]}
              rows={(inbox?.rsvps ?? []).map((item) => [
                item.createdAt.slice(0, 10),
                item.eventTitle,
                item.registrationNo ?? "",
                item.name,
                item.email,
              ])}
            />
            <InboxList
              title="Yuva volunteers on events"
              empty="No Yuva volunteers assigned to events yet."
              headings={["Date", "Event", "Yuva ID", "Name", "Email", "Status"]}
              rows={(inbox?.volunteers ?? []).map((item) => [
                item.createdAt.slice(0, 10),
                item.eventTitle,
                item.membershipNo,
                item.name,
                item.email,
                item.status,
              ])}
            />
            {role === "central" ? (
              <InboxList
                title="Donation pledges"
                empty="No pledges yet."
                headings={["Date", "Pledge", "Name", "Email", "Note"]}
                rows={(inbox?.donations ?? []).map((item) => [
                  item.createdAt.slice(0, 10),
                  `${item.status} · AED ${item.amountAed}`,
                  item.name,
                  item.email,
                  item.note ?? "",
                ])}
              />
            ) : null}
            <InboxList
              title="Members"
              empty="No member accounts yet."
              headings={["Date", "Membership no.", "Name", "Email", "Chapter"]}
              rows={(inbox?.members ?? []).map((item) => [
                item.createdAt.slice(0, 10),
                item.membershipNo,
                item.name,
                item.email,
                item.emirate,
              ])}
            />
            <InboxList
              title="IPF Yuva"
              empty="No Yuva volunteers yet."
              headings={["Date", "Yuva ID", "Name", "Email", "Chapter"]}
              rows={(inbox?.yuva ?? []).map((item) => [
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

function InboxList({
  title,
  empty,
  headings,
  rows,
}: {
  title: string;
  empty: string;
  headings: string[];
  rows: string[][];
}) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[var(--ipf-navy)]">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--ipf-muted)]">{empty}</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--ipf-ivory)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ipf-muted)]">
              <tr>
                {headings.map((heading) => (
                  <th key={heading} className="px-3 py-2">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`} className="border-t border-[var(--ipf-line)]">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="max-w-xs px-3 py-2.5 align-top text-[var(--ipf-navy)]">
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
