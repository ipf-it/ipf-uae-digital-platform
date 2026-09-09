import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMember } from "../cms/MemberProvider";
import { Button } from "./ui/Button";
import { Checkbox } from "./ui/Checkbox";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { isUpcomingEvent } from "../data/eventCatalog";
import { api, ApiError } from "../lib/api";
import { useLocale } from "../i18n/LocaleProvider";
import { downloadIcs } from "../lib/ics";
import { SimpleSelect } from "./ui/Select";
import { useToast } from "./ui/Toast";

type EventRsvpProps = {
  eventId: string;
  title: string;
  date?: string;
  startsAt?: string | null;
  location?: string;
  body?: string;
  month?: string;
  memberCount?: number;
  volunteerCount?: number;
};

export function EventRsvp({ eventId, title, date, startsAt, location, body, month, memberCount, volunteerCount }: EventRsvpProps) {
  const open = isUpcomingEvent({ startsAt: startsAt ?? null });
  const { t } = useLocale();
  const { member, becomeVolunteer } = useMember();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [registrationNo, setRegistrationNo] = useState("");
  const [volunteering, setVolunteering] = useState(false);
  const [identifier, setIdentifier] = useState(member?.membershipNo ?? member?.phone ?? "");
  const [participationAs, setParticipationAs] = useState<"member" | "volunteer">("member");
  const [confirmBecomeVolunteer, setConfirmBecomeVolunteer] = useState(false);

  useEffect(() => {
    void api<{ registration: { registrationNo: string } | null; volunteer: { status: string } | null }>(
      `/api/events/${encodeURIComponent(eventId)}/mine`,
    )
      .then((result) => {
        if (result.registration?.registrationNo) setRegistrationNo(result.registration.registrationNo);
        if (result.volunteer) setVolunteering(true);
      })
      .catch(() => undefined);
  }, [eventId]);

  useEffect(() => {
    if (!member) return;
    setName((current) => current || member.name);
    setEmail((current) => current || member.email);
    setPhone((current) => current || member.phone);
    setIdentifier((current) => current || member.membershipNo || member.phone);
  }, [member]);

  async function submitRegistration() {
    const result = await api<{ registrationNo: string }>(`/api/events/${encodeURIComponent(eventId)}/register`, {
      method: "POST",
      body: JSON.stringify({ identifier, participationAs, name, email, phone }),
    });
    setRegistrationNo(result.registrationNo);
    setFormOpen(false);
    setConfirmBecomeVolunteer(false);
    toast.success("You're registered for this event.");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!open) return;
    setSubmitting(true);
    try {
      await submitRegistration();
    } catch (error) {
      if (error instanceof ApiError && error.code === "not_volunteer") {
        setConfirmBecomeVolunteer(true);
      } else {
        toast.error(error instanceof Error ? error.message : "Could not complete registration");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onConfirmBecomeVolunteer() {
    setSubmitting(true);
    try {
      await becomeVolunteer();
      await submitRegistration();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete registration");
    } finally {
      setSubmitting(false);
    }
  }

  async function volunteer() {
    if (!open) return;
    setSubmitting(true);
    try {
      await api(`/api/events/${encodeURIComponent(eventId)}/volunteer`, { method: "POST" });
      setVolunteering(true);
      toast.success("You're down as a volunteer for this event.");
    } catch (error) {
      if (error instanceof ApiError && error.code === "not_volunteer") {
        try {
          await becomeVolunteer();
          await api(`/api/events/${encodeURIComponent(eventId)}/volunteer`, { method: "POST" });
          setVolunteering(true);
          toast.success("You're now an IPF Yuva volunteer, and signed up for this event.");
        } catch (innerError) {
          toast.error(innerError instanceof Error ? innerError.message : "Could not assign volunteer");
        }
      } else {
        toast.error(error instanceof Error ? error.message : "Could not assign volunteer");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {!open ? <p className="text-sm font-semibold text-[var(--ipf-muted)]">{t("common.eventEnded")}</p> : null}
      {typeof memberCount === "number" ? (
        <p className="text-sm font-semibold text-[var(--ipf-navy)]">
          {memberCount} attending{typeof volunteerCount === "number" && volunteerCount > 0 ? ` · ${volunteerCount} volunteering` : ""}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {open ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadIcs({ title, description: body, location, date, month })}
          >
            {t("common.addCalendar")}
          </Button>
        ) : null}
        {registrationNo ? (
          <p className="self-center text-sm font-semibold text-[var(--ipf-green)]">
            {t("common.registrationId")}: {registrationNo}
          </p>
        ) : open ? (
          <Button type="button" size="sm" onClick={() => setFormOpen((value) => !value)}>
            {t("common.registerEvent")}
          </Button>
        ) : null}
        {member ? (
          volunteering ? (
            <p className="self-center text-sm font-semibold text-[var(--ipf-green)]">{t("common.volunteerDone")}</p>
          ) : open ? (
            <Button type="button" variant="secondary" size="sm" disabled={submitting} onClick={() => void volunteer()}>
              {t("common.volunteerThisEvent")}
            </Button>
          ) : null
        ) : null}
      </div>
      {open && formOpen && !registrationNo ? (
        <form onSubmit={onSubmit} className="w-full space-y-3 rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Registered mobile or IPF ID" htmlFor={`${eventId}-identifier`}>
              <Input id={`${eventId}-identifier`} value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="IPF-000001" />
            </Field>
            <Field label="Attend this event as" htmlFor={`${eventId}-participation`}>
              <SimpleSelect
                id={`${eventId}-participation`}
                value={participationAs}
                onValueChange={(value) => {
                  setParticipationAs(value as "member" | "volunteer");
                  setConfirmBecomeVolunteer(false);
                }}
                placeholder="Choose participation"
                options={[{ value: "member", label: "Member / attendee" }, { value: "volunteer", label: "IPF Yuva volunteer" }]}
              />
            </Field>
          </div>
          <p className="text-xs leading-5 text-[var(--ipf-muted)]">Choose whether this participation counts as attendance or volunteer service — anyone can volunteer, not just existing Yuva members.</p>
          <Field label={t("common.fullName")} htmlFor={`${eventId}-name`} required>
            <Input id={`${eventId}-name`} required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={t("common.email")} htmlFor={`${eventId}-email`} required>
            <Input id={`${eventId}-email`} required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={t("common.phoneUae")} htmlFor={`${eventId}-phone`}>
            <Input id={`${eventId}-phone`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          {!member ? (
            <p className="text-xs leading-5 text-[var(--ipf-muted)]">
              <Link className="font-semibold text-[var(--ipf-navy)]" to="/register">
                {t("nav.register")}
              </Link>
              {" · "}
              <Link className="font-semibold text-[var(--ipf-navy)]" to="/sign-in">
                {t("nav.signIn")}
              </Link>
            </p>
          ) : null}
          {confirmBecomeVolunteer ? (
            <div className="flex items-start gap-3 rounded-lg border border-[var(--ipf-saffron)] bg-orange-50 p-3">
              <Checkbox id={`${eventId}-become-volunteer`} checked onCheckedChange={(checked) => { if (checked !== true) setConfirmBecomeVolunteer(false); }} />
              <Label htmlFor={`${eventId}-become-volunteer`} className="text-sm leading-6 text-[var(--ipf-navy)]">
                You're not yet signed up as an IPF Yuva volunteer. Tick to become one now and continue.
              </Label>
            </div>
          ) : null}
          {confirmBecomeVolunteer ? (
            <Button type="button" size="sm" disabled={submitting} onClick={() => void onConfirmBecomeVolunteer()}>
              Become a volunteer and register
            </Button>
          ) : (
            <Button type="submit" size="sm" disabled={submitting}>
              {t("common.registerEvent")}
            </Button>
          )}
        </form>
      ) : null}
    </div>
  );
}
