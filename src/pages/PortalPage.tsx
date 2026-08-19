import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMember } from "../cms/MemberProvider";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { Section } from "../components/ui/Section";
import { site } from "../data/site";

export default function PortalPage() {
  const { member, ready, signOut, addHours } = useMember();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState("2");
  const [activity, setActivity] = useState("");
  const [status, setStatus] = useState("");

  if (!ready) return null;
  if (!member) return <Navigate to="/sign-in" replace />;

  const totalHours = member.volunteerHours.reduce((sum, item) => sum + item.hours, 0);

  async function onHours(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    try {
      await addHours({ date, hours: Number(hours), activity });
      setActivity("");
      setStatus("Hours recorded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save hours");
    }
  }

  return (
    <>
      <DocumentTitle title="Member portal" />
      <PageHero
        eyebrow="Members"
        title={`Welcome, ${member.name.split(" ")[0]}`}
        description="Your digital membership card and volunteer hours. Card payments and renewals will use a UAE gateway when credentials are issued."
        crumbs={[{ label: "Portal" }]}
      />
      <Section tone="white">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="overflow-hidden rounded-2xl bg-[var(--ipf-navy)] p-6 text-white shadow-[0_16px_40px_rgba(11,31,58,0.18)]">
            <div className="ipf-tricolor mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ipf-gold)]">Indian People's Forum UAE</p>
            <p className="mt-4 text-2xl font-bold">{member.name}</p>
            <p className="mt-1 text-sm text-white/75">{member.chapter || member.emirate || "UAE member"}</p>
            <p className="mt-6 font-mono text-lg tracking-[0.18em] text-[var(--ipf-gold)]">{member.membershipNo}</p>
            <p className="mt-2 text-xs text-white/60">Issued {new Date(member.createdAt).toLocaleDateString("en-GB")}</p>
            <p className="mt-6 text-xs text-white/70">{site.office}</p>
          </div>
          <div className="space-y-5">
            <Card title="Account">
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">
                {member.email}
                {member.phone ? ` · ${member.phone}` : ""}
              </p>
              <p className="mt-2 text-sm text-[var(--ipf-muted)]">{totalHours} volunteer hours recorded.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/events">RSVP to events</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/donate">Support welfare</Link>
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </div>
            </Card>
            <form onSubmit={onHours}>
              <Card title="Log volunteer hours">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Date" htmlFor="hrs-date">
                    <Input id="hrs-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </Field>
                  <Field label="Hours" htmlFor="hrs-hours">
                    <Input id="hrs-hours" type="number" min={0.5} step={0.5} value={hours} onChange={(e) => setHours(e.target.value)} />
                  </Field>
                  <Field label="Activity" htmlFor="hrs-activity" className="sm:col-span-2" required>
                    <Input id="hrs-activity" required value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Chapter programme, counselling, event support" />
                  </Field>
                </div>
                {status ? <p className="mt-3 text-sm text-[var(--ipf-muted)]">{status}</p> : null}
                <div className="mt-4">
                  <Button type="submit" size="sm">
                    Save hours
                  </Button>
                </div>
              </Card>
            </form>
          </div>
        </Container>
      </Section>
      {member.volunteerHours.length > 0 ? (
        <Section>
          <Container>
            <Card title="Recent hours">
              <ul className="space-y-3 text-sm">
                {member.volunteerHours.slice(0, 12).map((item) => (
                  <li key={item.id} className="flex justify-between gap-4 border-b border-[var(--ipf-line)] pb-3 last:border-0">
                    <span>
                      <span className="font-semibold text-[var(--ipf-navy)]">{item.activity}</span>
                      <span className="mt-0.5 block text-xs text-[var(--ipf-muted)]">{item.date}</span>
                    </span>
                    <span className="font-semibold text-[var(--ipf-green)]">{item.hours}h</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
