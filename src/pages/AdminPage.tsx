import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { requireSupabaseAuth, supabaseAuth } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";

type Admin = { id: string; email: string; name: string; role: string; scopeType: "global" | "chapter" | "council"; scopeId: string | null };
type AdminEvent = { id: string; title: string; event_date: string; location: string; body: string; category: string; workflow_status: string; published: boolean; slides?: { src: string; alt?: string }[] };
type Approval = { id: string; entity_type: string; entity_id: string; status: string; scope_type: string; scope_id: string; created_at: string };
type Dashboard = { counts: { events: number; people: number; approvals: number }; pending: Approval[] };

const blank = { title: "", eventDate: "", location: "", body: "", category: "Community", slides: [] as { src: string; alt?: string }[] };

export default function AdminPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const [tab, setTab] = useState<"dashboard" | "events" | "approvals">("dashboard");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  async function load() {
    const [{ admin: current }, eventData, dashboardData] = await Promise.all([
      api<{ admin: Admin }>("/api/admin/session"),
      api<{ events: AdminEvent[] }>("/api/admin/events"),
      api<Dashboard>("/api/admin/dashboard"),
    ]);
    setAdmin(current);
    setEvents(eventData.events);
    setDashboard(dashboardData);
  }

  useEffect(() => {
    void requireSupabaseAuth().auth.getUser().then(({ data }) => {
      if (data.user) setMustChangePassword(data.user.user_metadata?.must_change_password === true);
      return load();
    }).catch(() => undefined);
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    const { error } = await requireSupabaseAuth().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return setStatus(error.message);
    try {
      const { data } = await requireSupabaseAuth().auth.getUser();
      setMustChangePassword(data.user?.user_metadata?.must_change_password === true);
      await load();
    } catch (error) { await supabaseAuth?.auth.signOut(); setStatus(error instanceof Error ? error.message : "Administrator access denied"); }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 12) return setStatus("Use at least 12 characters for the new password.");
    const auth = requireSupabaseAuth();
    const { data: userData } = await auth.auth.getUser();
    const { error } = await auth.auth.updateUser({ password: newPassword, data: { ...(userData.user?.user_metadata ?? {}), must_change_password: false } });
    if (error) return setStatus(error.message);
    setNewPassword(""); setMustChangePassword(false); setStatus("Password changed successfully.");
  }

  function edit(item: AdminEvent) {
    setEditingId(item.id);
    setForm({ title: item.title, eventDate: item.event_date, location: item.location, body: item.body, category: item.category, slides: item.slides ?? [] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveEvent(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    try {
      await api(editingId ? `/api/admin/events/${encodeURIComponent(editingId)}` : "/api/admin/events", { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) });
      setForm(blank); setEditingId(null); setStatus(editingId ? "Event updated as a draft." : "Event created."); await load();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Could not save event"); }
  }

  async function upload(file: File) {
    const result = await api<{ src: string }>("/api/admin/upload", { method: "POST", headers: { "x-file-name": file.name, "x-file-type": file.type }, body: file });
    setForm((value) => ({ ...value, slides: [...value.slides, { src: result.src, alt: value.title }] }));
    setStatus("Image uploaded. Save the event to attach it.");
  }

  async function submit(id: string) {
    await api(`/api/admin/events/${encodeURIComponent(id)}/submit`, { method: "POST" });
    setStatus("Event submitted for super-admin approval."); await load();
  }

  async function decide(id: string, decision: "approved" | "rejected" | "changes_requested") {
    const note = decision === "approved" ? "" : window.prompt("Review note") ?? "";
    await api(`/api/admin/approvals/${id}/decision`, { method: "POST", body: JSON.stringify({ decision, note }) });
    setStatus(`Submission ${decision.replace("_", " ")}.`); await load();
  }

  if (!admin) return (
    <main className="grid min-h-screen place-items-center bg-[var(--ipf-navy)] p-4">
      <form className="w-full max-w-md" onSubmit={login}>
        <Card size="lg" eyebrow="IPF UAE" title="Administrator login" description="One secure login for super, chapter and council administrators.">
          <Field label="Email" htmlFor="admin-email" required><Input id="admin-email" required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field className="mt-4" label="Password" htmlFor="admin-password" required><Input id="admin-password" required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          {status && <p className="mt-3 text-sm text-red-700">{status}</p>}
          <Button className="mt-5 w-full" type="submit">Sign in</Button>
        </Card>
      </form>
    </main>
  );

  if (mustChangePassword) return (
    <main className="grid min-h-screen place-items-center bg-[var(--ipf-navy)] p-4">
      <form className="w-full max-w-md" onSubmit={changePassword}>
        <Card size="lg" eyebrow="First sign-in" title="Create a private password" description="Replace the temporary administrator password before using the dashboard.">
          <Field label="New password" htmlFor="admin-new-password" required><Input id="admin-new-password" required minLength={12} type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></Field>
          {status && <p className="mt-3 text-sm text-red-700">{status}</p>}
          <Button className="mt-5 w-full" type="submit">Save password</Button>
        </Card>
      </form>
    </main>
  );

  const superAdmin = admin.role === "super_admin";
  const scopeLabel = admin.scopeType === "global" ? "All IPF UAE" : `${admin.scopeType === "chapter" ? "Chapter" : "Council"}: ${admin.scopeId}`;
  return (
    <main className="min-h-screen bg-[var(--ipf-ivory)] lg:flex">
      <aside className="bg-[var(--ipf-navy)] p-6 text-white lg:w-72">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--ipf-gold)]">IPF administration</p>
        <h1 className="mt-3 text-xl font-bold">{admin.name}</h1><p className="mt-1 text-sm text-white/70">{scopeLabel}</p>
        <nav className="mt-8 grid gap-2">
          {(["dashboard", "events", ...(superAdmin ? ["approvals" as const] : [])] as const).map((item) => <button key={item} className={`min-h-11 rounded-lg px-4 py-3 text-left capitalize ${tab === item ? "bg-white/15 font-semibold" : "text-white/75"}`} onClick={() => setTab(item)}>{item}</button>)}
        </nav>
        <Button className="mt-8 w-full" variant="secondary" onClick={async () => { await supabaseAuth?.auth.signOut(); setAdmin(null); }}>Sign out</Button>
      </aside>
      <section className="flex-1 p-5 md:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7"><p className="text-sm font-semibold text-[var(--ipf-muted)]">{admin.role.replaceAll("_", " ")}</p><h2 className="mt-1 text-3xl font-bold text-[var(--ipf-navy)]">{tab === "dashboard" ? "Dashboard" : tab === "events" ? "Event management" : "Approval queue"}</h2>{status && <p className="mt-2 text-sm text-[var(--ipf-green)]">{status}</p>}</div>
          {tab === "dashboard" && dashboard && <div className="grid gap-4 md:grid-cols-3">{Object.entries(dashboard.counts).map(([label, count]) => <Card key={label} eyebrow={label} title={String(count)} />)}</div>}
          {tab === "events" && <div className="grid gap-6 xl:grid-cols-[.9fr,1.1fr]">
            <form onSubmit={saveEvent}><Card title={editingId ? "Edit event" : "Create event"} description={superAdmin ? "Global events publish directly." : "Local events remain drafts until approved."}>
              <Field label="Event title" htmlFor="event-title" required><Input id="event-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
              <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Date" htmlFor="event-date"><Input id="event-date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></Field><Field label="Location" htmlFor="event-location"><Input id="event-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field></div>
              <Field className="mt-4" label="Category" htmlFor="event-category"><Input id="event-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
              <Field className="mt-4" label="Description" htmlFor="event-body"><Textarea id="event-body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
              <Field className="mt-4" label="Event pictures" htmlFor="event-image"><Input id="event-image" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); }} /></Field>
              {form.slides.length > 0 && <p className="mt-2 text-xs text-[var(--ipf-muted)]">{form.slides.length} image(s) attached</p>}
              <div className="mt-5 flex gap-3"><Button type="submit">{editingId ? "Save changes" : "Create event"}</Button>{editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(blank); }}>Cancel</Button>}</div>
            </Card></form>
            <div className="space-y-3">{events.map((item) => <Card key={item.id} title={item.title} description={`${item.event_date || "Date pending"} · ${item.location || "Location pending"}`}><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-[var(--ipf-ivory)] px-3 py-1 text-xs font-semibold uppercase">{item.workflow_status}</span><Button type="button" variant="outline" onClick={() => edit(item)}>Edit</Button>{!superAdmin && item.workflow_status !== "submitted" && <Button type="button" onClick={() => void submit(item.id)}>Submit for approval</Button>}</div></Card>)}</div>
          </div>}
          {tab === "approvals" && <div className="space-y-3">{dashboard?.pending.length ? dashboard.pending.map((item) => <Card key={item.id} title={`${item.entity_type}: ${item.entity_id}`} description={`${item.scope_type}: ${item.scope_id}`}><div className="flex flex-wrap gap-3"><Button onClick={() => void decide(item.id, "approved")}>Approve & publish</Button><Button variant="outline" onClick={() => void decide(item.id, "changes_requested")}>Request changes</Button><Button variant="outline" onClick={() => void decide(item.id, "rejected")}>Reject</Button></div></Card>) : <Card title="No submissions awaiting review" />}</div>}
        </div>
      </section>
    </main>
  );
}
