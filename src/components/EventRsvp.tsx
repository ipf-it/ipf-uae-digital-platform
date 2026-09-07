import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMember } from "../cms/MemberProvider";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { isUpcomingEvent } from "../data/eventCatalog";
import { api } from "../lib/api";
import { useLocale } from "../i18n/LocaleProvider";
import { downloadIcs } from "../lib/ics";
import { SimpleSelect } from "./ui/Select";

type EventRsvpProps = {
  eventId: string;
  title: string;
  date?: string;
  startsAt?: string | null;
  location?: string;
  body?: string;
  month?: string;
};

export function EventRsvp({ eventId, title, date, startsAt, location, body, month }: EventRsvpProps) {
  const open = isUpcomingEvent({ startsAt: startsAt ?? null });
  const { t } = useLocale();
  const { member } = useMember();
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [registrationStatus, setRegistrationStatus] = useState("");
  const [volunteerStatus, setVolunteerStatus] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [volunteering, setVolunteering] = useState(false);
  const [identifier, setIdentifier] = useState(member?.membershipNo ?? member?.phone ?? "");
  const [participationAs, setParticipationAs] = useState<"member" | "volunteer">("member");

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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!open) return;
    setRegistrationStatus("");
    try {
      const result = await api<{ registrationNo: string }>(`/api/events/${encodeURIComponent(eventId)}/register`, {
        method: "POST",
        body: JSON.stringify({ identifier, participationAs, name, email, phone, eventTitle: title, date, location, eventBody: body }),
      });
      setRegistrationNo(result.registrationNo);
      setFormOpen(false);
    } catch (error) {
      setRegistrationStatus(error instanceof Error ? error.message : "Could not complete registration");
    }
  }

  async function volunteer() {
    if (!open) return;
    setVolunteerStatus("");
    try {
      await api(`/api/events/${encodeURIComponent(eventId)}/volunteer`, {
        method: "POST",
        body: JSON.stringify({ eventTitle: title, date, location, eventBody: body }),
      });
      setVolunteering(true);
    } catch (error) {
      setVolunteerStatus(error instanceof Error ? error.message : "Could not assign volunteer");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {!open ? <p className="text-sm font-semibold text-[var(--ipf-muted)]">{t("common.eventEnded")}</p> : null}
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
        {member?.kind === "yuva" ? (
          volunteering ? (
            <p className="self-center text-sm font-semibold text-[var(--ipf-green)]">{t("common.volunteerDone")}</p>
          ) : open ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => void volunteer()}>
              {t("common.volunteerThisEvent")}
            </Button>
          ) : null
        ) : null}
      </div>
      {open && formOpen && !registrationNo ? (
        <form onSubmit={onSubmit} className="w-full space-y-3 rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Registered mobile or IPF ID" htmlFor={`${eventId}-identifier`}>
              <Input id={`${eventId}-identifier`} value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="IPFM-0001 / IPFY-0001" />
            </Field>
            <Field label="Attend this event as" htmlFor={`${eventId}-participation`}>
              <SimpleSelect id={`${eventId}-participation`} value={participationAs} onValueChange={(value) => setParticipationAs(value as "member" | "volunteer")} placeholder="Choose participation" options={[{ value: "member", label: "Member / attendee" }, { value: "volunteer", label: "IPF Yuva volunteer" }]} />
            </Field>
          </div>
          <p className="text-xs leading-5 text-[var(--ipf-muted)]">Yuva members can choose whether this participation counts as normal attendance or volunteer service.</p>
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
          {registrationStatus ? <p className="text-sm text-red-700">{registrationStatus}</p> : null}
          <Button type="submit" size="sm">
            {t("common.registerEvent")}
          </Button>
        </form>
      ) : null}
      {volunteerStatus ? <p className="text-sm text-red-700">{volunteerStatus}</p> : null}
    </div>
  );
}
