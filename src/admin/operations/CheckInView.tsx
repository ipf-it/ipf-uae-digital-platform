import { useRef, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { QrScannerPanel } from "./QrScannerPanel";

type CheckInResult = {
  member: { id: string; membershipNo: string; name: string; emirate: string; homeState: string; isVolunteer: boolean };
  registration: { registration_no: string; participation_as: string; status: string } | null;
  volunteer: { status: string } | null;
};

// The QR on a member's card encodes a full /verify/<code> URL (not the bare code) so a phone
// camera opens the public verification page directly. A desk admin scanning it — with the camera
// below, or a dedicated hardware scanner typing the decoded text into the field — still just wants
// the ID, so pull it out of the URL rather than requiring everyone to type the bare number.
function resolveCode(raw: string): string {
  const match = raw.trim().match(/IPF[A-Z]?-[\w-]+$/i);
  return match ? match[0] : raw.trim();
}

export default function CheckInView() {
  const toast = useToast();
  const [code, setCode] = useState("");
  const [eventId, setEventId] = useState("");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const checkedInCodes = useRef(new Set<string>());
  const lastScan = useRef({ code: "", at: 0 });

  async function lookup(markAttended: boolean, overrideCode?: string) {
    const resolvedCode = resolveCode(overrideCode ?? code);
    if (!resolvedCode) return;
    setBusy(true);
    try {
      const data = await api<CheckInResult>("/api/admin/check-in", {
        method: "POST",
        body: JSON.stringify({ code: resolvedCode, eventId: eventId.trim() || undefined, markAttended }),
      });
      setResult(data);
      if (markAttended) {
        toast.success(`Marked attended: ${data.member.name}`);
        if (!checkedInCodes.current.has(data.member.membershipNo)) {
          checkedInCodes.current.add(data.member.membershipNo);
          setCheckedInCount(checkedInCodes.current.size);
        }
      }
    } catch (error) {
      setResult(null);
      toast.error(error instanceof Error ? error.message : "Could not find that member");
    } finally {
      setBusy(false);
    }
  }

  function onScanDecode(raw: string) {
    const resolved = resolveCode(raw);
    if (!resolved) return;
    // Scanning fires many times a second while a code is still in frame — only act on a given
    // code once every few seconds so one badge in front of the camera doesn't spam repeat requests.
    const now = Date.now();
    if (resolved === lastScan.current.code && now - lastScan.current.at < 4000) return;
    lastScan.current = { code: resolved, at: now };
    setCode(resolved);
    void lookup(Boolean(eventId.trim()), resolved);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[var(--ipf-navy)]">Check-in</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--ipf-muted)]">
          Look up a member by their membership number or mobile number (scan their digital ID's QR code with the camera below, or type it in), confirm their identity, and mark them attended for
          an event.
        </p>
      </div>

      <Card title="Scan QR">
        <p className="text-sm leading-6 text-[var(--ipf-muted)]">
          Set the event below first — while an Event ID is filled in, every successful scan automatically marks that member attended. Leave it blank to just verify identity without counting
          attendance.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" variant={scanning ? "outline" : "primary"} onClick={() => setScanning((v) => !v)}>
            {scanning ? "Stop camera" : "Start camera"}
          </Button>
          {eventId.trim() ? <Badge tone="green">Checked in this session: {checkedInCount}</Badge> : null}
        </div>
        <div className="mt-4">
          <QrScannerPanel active={scanning} onDecode={onScanDecode} />
        </div>
      </Card>

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
