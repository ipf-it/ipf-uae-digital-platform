import { useState, type FormEvent } from "react";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { api } from "../lib/api";
import { downloadIcs } from "../lib/ics";
import { site } from "../data/site";

type EventRsvpProps = {
  eventId: string;
  title: string;
  date?: string;
  location?: string;
  body?: string;
  month?: string;
};

export function EventRsvp({ eventId, title, date, location, body, month }: EventRsvpProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    try {
      await api("/api/rsvp", {
        method: "POST",
        body: JSON.stringify({ eventId, eventTitle: title, name, email, phone }),
      });
      setDone(true);
    } catch {
      setStatus(`Could not record RSVP here. Please email ${site.email} with your name and this event.`);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => downloadIcs({ title, description: body, location, date, month })}
      >
        Add to calendar
      </Button>
      {done ? (
        <p className="self-center text-sm font-semibold text-[var(--ipf-green)]">RSVP received for {title}.</p>
      ) : (
        <Button type="button" size="sm" onClick={() => setOpen((value) => !value)}>
          RSVP
        </Button>
      )}
      {open && !done ? (
        <form onSubmit={onSubmit} className="mt-3 w-full space-y-3 rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] p-4">
          <Field label="Full name" htmlFor={`${eventId}-name`} required>
            <Input id={`${eventId}-name`} required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email" htmlFor={`${eventId}-email`} required>
            <Input id={`${eventId}-email`} required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Mobile" htmlFor={`${eventId}-phone`}>
            <Input id={`${eventId}-phone`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          {status ? <p className="text-sm text-red-700">{status}</p> : null}
          <Button type="submit" size="sm">
            Confirm RSVP
          </Button>
        </form>
      ) : null}
    </div>
  );
}
