import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";

type CheckInResult = {
  member: { id: string; membershipNo: string; name: string; emirate: string; homeState: string; isVolunteer: boolean };
  registration: { registration_no: string; participation_as: string; status: string } | null;
  volunteer: { status: string } | null;
};

export default function CheckInTab() {
  const toast = useToast();
  const [code, setCode] = useState("");
  const [eventId, setEventId] = useState("");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function lookup(markAttended: boolean) {
    if (!code.trim()) return;
    setBusy(true);
    try {
      const data = await api<CheckInResult>("/api/admin/check-in", {
        method: "POST",
        body: JSON.stringify({ code: code.trim(), eventId: eventId.trim() || undefined, markAttended }),
      });
      setResult(data);
      if (markAttended) toast.success("Marked as attended.");
    } catch (error) {
      setResult(null);
      toast.error(error instanceof Error ? error.message : "Could not find that member");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Event desk</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Check-in</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ipf-muted)]">
          Look up a member by their membership number or mobile number (scan their digital ID's QR code, or type it in), confirm their identity, and mark them attended for an event.
        </p>
      </div>

      <Card title="Look up a member">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Membership number or mobile number" htmlFor="checkin-code">
            <Input
              id="checkin-code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void lookup(false);
              }}
              placeholder="IPF-000123"
            />
          </Field>
          <Field label="Event ID (optional)" htmlFor="checkin-event">
            <Input id="checkin-event" value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="Leave blank to just verify identity" />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" disabled={busy} onClick={() => void lookup(false)}>
            Look up
          </Button>
          <Button type="button" variant="outline" disabled={busy || !eventId.trim()} onClick={() => void lookup(true)}>
            Mark attended
          </Button>
        </div>
      </Card>

      {result ? (
        <Card title={result.member.name} description={`${result.member.membershipNo} · ${result.member.emirate || result.member.homeState}`}>
          <div className="space-y-1 text-sm text-[var(--ipf-muted)]">
            <p>{result.member.isVolunteer ? "IPF Yuva volunteer" : "Member"}</p>
            {result.registration ? (
              <p>
                Registered as {result.registration.participation_as} · {result.registration.status}
              </p>
            ) : eventId.trim() ? (
              <p>Not registered for this event.</p>
            ) : null}
            {result.volunteer ? <p>Volunteer status: {result.volunteer.status}</p> : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
