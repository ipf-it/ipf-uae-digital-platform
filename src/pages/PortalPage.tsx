import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useMember } from "../cms/MemberProvider";
import { DigitalIdCard } from "../components/DigitalIdCard";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { Section } from "../components/ui/Section";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Textarea } from "../components/ui/Textarea";
import { useToast } from "../components/ui/Toast";
import { useLocale } from "../i18n/LocaleProvider";
import { api } from "../lib/api";

type SupportRequest = { id: string; createdAt: string; intent: string; message: string; status: string };
const supportStatusLabel: Record<string, string> = { new: "Received", in_progress: "In progress", resolved: "Resolved" };
const supportStatusTone: Record<string, "saffron" | "navy" | "green" | "paper"> = { new: "saffron", in_progress: "navy", resolved: "green" };

export default function PortalPage() {
  const { t } = useLocale();
  const { member, ready, signOut, addHours, becomeVolunteer, registrations, volunteerShifts } = useMember();
  const toast = useToast();
  const location = useLocation();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState("2");
  const [activity, setActivity] = useState("");
  const [becomingVolunteer, setBecomingVolunteer] = useState(false);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[] | null>(null);
  const [supportMessage, setSupportMessage] = useState("");
  const [submittingSupport, setSubmittingSupport] = useState(false);

  async function loadSupportRequests() {
    try {
      const result = await api<{ requests: SupportRequest[] }>("/api/members/support");
      setSupportRequests(result.requests);
    } catch {
      setSupportRequests([]);
    }
  }

  useEffect(() => {
    if (member) void loadSupportRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id]);

  if (!ready) return null;
  if (!member) return <Navigate to={`/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;

  async function onSupportSubmit(event: FormEvent) {
    event.preventDefault();
    if (!supportMessage.trim()) return;
    setSubmittingSupport(true);
    try {
      await api("/api/members/support", { method: "POST", body: JSON.stringify({ message: supportMessage.trim() }) });
      setSupportMessage("");
      toast.success("Your request has been sent to the team.");
      await loadSupportRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your request");
    } finally {
      setSubmittingSupport(false);
    }
  }

  const totalHours = member.volunteerHours.reduce((sum, item) => sum + item.hours, 0);

  async function onHours(event: FormEvent) {
    event.preventDefault();
    try {
      await addHours({ date, hours: Number(hours), activity });
      setActivity("");
      toast.success(t("page.portal.saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save hours");
    }
  }

  async function onBecomeVolunteer() {
    setBecomingVolunteer(true);
    try {
      await becomeVolunteer();
      toast.success("You're now an IPF Yuva volunteer.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your account");
    } finally {
      setBecomingVolunteer(false);
    }
  }

  return (
    <>
      <DocumentTitle title={member.isVolunteer ? t("page.yuva.title") : t("nav.portal")} />
      <PageHero
        eyebrow={member.isVolunteer ? t("page.yuva.title") : t("page.signin.eyebrow")}
        title={t("page.portal.welcome", { name: member.name.split(" ")[0] })}
        description={member.isVolunteer ? t("page.portal.yuvaDesc") : t("page.portal.memberDesc")}
        crumbs={[{ label: t("nav.portal") }]}
      />
      <Section tone="white">
        {/* items-start: without it, CSS Grid stretches both columns to the tallest one's height,
            and since every Card is h-full, each stacked Card below then claims that whole
            stretched height too — the huge dead space above "Log volunteer hours" was this. */}
        <Container className="grid items-start gap-8 lg:grid-cols-[0.9fr,1.1fr]">
          <DigitalIdCard member={member} />
          <div className="space-y-5">
            <Card title={t("page.portal.account")}>
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">
                {member.email}
                {member.phone ? ` · ${member.phone}` : ""}
              </p>
              <p className="mt-2 text-sm text-[var(--ipf-muted)]">{t("page.portal.hoursTotal", { hours: totalHours })}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/events">{t("page.portal.rsvpEvents")}</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/portal/card">{t("nav.membershipCard")}</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/donate">{t("page.portal.supportWelfare")}</Link>
                </Button>
                {!member.isVolunteer ? (
                  <Button type="button" variant="outline" size="sm" disabled={becomingVolunteer} onClick={() => void onBecomeVolunteer()}>
                    {becomingVolunteer ? "Updating…" : "Become an IPF Yuva volunteer"}
                  </Button>
                ) : null}
                <Button type="button" variant="outline" size="sm" onClick={() => void signOut()}>
                  {t("common.signOut")}
                </Button>
              </div>
            </Card>
            <form onSubmit={onHours}>
              <Card title={t("page.portal.logHours")}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={t("page.portal.date")} htmlFor="hrs-date">
                    <Input id="hrs-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </Field>
                  <Field label={t("page.portal.hours")} htmlFor="hrs-hours">
                    <Input id="hrs-hours" type="number" min={0.5} step={0.5} value={hours} onChange={(e) => setHours(e.target.value)} />
                  </Field>
                  <Field label={t("page.portal.activity")} htmlFor="hrs-activity" className="sm:col-span-2" required>
                    <Input id="hrs-activity" required value={activity} onChange={(e) => setActivity(e.target.value)} placeholder={t("page.portal.placeholder")} />
                  </Field>
                </div>
                <div className="mt-4">
                  <Button type="submit" size="sm">
                    {t("page.portal.saveHours")}
                  </Button>
                </div>
              </Card>
            </form>
          </div>
        </Container>
      </Section>
      {registrations.length > 0 ? (
        <Section>
          <Container>
            <Card title={t("page.portal.myEvents")}>
              <Table>
                <TableCaption>{t("page.portal.myEvents")}</TableCaption>
                <TableHead>
                  <TableRow>
                    <TableHeader>Event</TableHeader>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Registration no.</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrations.map((item) => (
                    <TableRow key={`${item.eventId}-${item.registrationNo}`}>
                      <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.eventTitle}</TableCell>
                      <TableCell>{item.createdAt.slice(0, 10)}</TableCell>
                      <TableCell className="font-semibold text-[var(--ipf-green)]">{item.registrationNo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Container>
        </Section>
      ) : null}
      {volunteerShifts.length > 0 ? (
        <Section>
          <Container>
            <Card title={t("page.portal.myShifts")}>
              <Table>
                <TableCaption>{t("page.portal.myShifts")}</TableCaption>
                <TableHead>
                  <TableRow>
                    <TableHeader>Event</TableHeader>
                    <TableHeader>Status</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {volunteerShifts.map((item) => (
                    <TableRow key={`${item.eventId}-${item.status}`}>
                      <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.eventTitle}</TableCell>
                      <TableCell className="font-semibold text-[var(--ipf-green)]">{item.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Container>
        </Section>
      ) : null}
      {member.volunteerHours.length > 0 ? (
        <Section>
          <Container>
            <Card title={t("page.portal.recent")}>
              <Table>
                <TableCaption>{t("page.portal.recent")}</TableCaption>
                <TableHead>
                  <TableRow>
                    <TableHeader>Activity</TableHeader>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Hours</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {member.volunteerHours.slice(0, 12).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-[var(--ipf-navy)]">{item.activity}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell className="font-semibold text-[var(--ipf-green)]">{item.hours}h</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Container>
        </Section>
      ) : null}
      <Section>
        <Container>
          <Card title="Support requests">
            <p className="text-sm leading-6 text-[var(--ipf-muted)]">
              Raise a question or issue directly from your account — a chapter/council admin will follow up, and you can see the status here.
            </p>
            <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={onSupportSubmit}>
              <Field label="New request" htmlFor="support-message" className="flex-1">
                <Textarea
                  id="support-message"
                  className="min-h-11"
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe what you need help with…"
                />
              </Field>
              <Button type="submit" size="sm" disabled={submittingSupport || !supportMessage.trim()}>
                {submittingSupport ? "Sending…" : "Send"}
              </Button>
            </form>
            {supportRequests === null ? (
              <p className="mt-4 text-sm text-[var(--ipf-muted)]">Loading your requests…</p>
            ) : supportRequests.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--ipf-muted)]">You haven't sent any requests yet.</p>
            ) : (
              <div className="mt-4">
                <Table>
                  <TableCaption>Support requests</TableCaption>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Message</TableHeader>
                      <TableHeader>Status</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supportRequests.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.createdAt.slice(0, 10)}</TableCell>
                        <TableCell className="max-w-sm text-[var(--ipf-navy)]">{item.message}</TableCell>
                        <TableCell>
                          <Badge tone={supportStatusTone[item.status] ?? "paper"}>{supportStatusLabel[item.status] ?? item.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </Container>
      </Section>
    </>
  );
}
