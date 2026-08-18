import { useState, type FormEvent } from "react";
import { Button } from "../ui/Button";
import { site } from "../../data/site";
import { emirates } from "../../data/forms";

type InquiryFormProps = {
  intent: "contact" | "membership" | "support" | "jobs";
};

const titles = {
  contact: "Write to IPF",
  membership: "Application for membership",
  support: "Support request",
  jobs: "Job board enquiry",
} as const;

export function InquiryForm({ intent }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-[var(--ipf-line)] bg-[var(--ipf-paper)] px-4 py-6 sm:px-6 sm:py-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Received</p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--ipf-navy)]">Thank you. IPF will respond by email.</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">
          This public website does not yet send form data to a server. Please also write to{" "}
          <a className="font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.email}`}>
            {site.email}
          </a>{" "}
          so the team can assist you without delay. A CMS-backed intake will be connected in the next phase.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-[var(--ipf-line)] bg-[var(--ipf-paper)] px-4 py-6 sm:px-6 sm:py-8">
      <h2 className="text-xl font-bold text-[var(--ipf-navy)]">{titles[intent]}</h2>
      <p className="mt-2 text-sm leading-7 text-[var(--ipf-muted)]">
        Fields marked with * are required. Responses are handled by IPF volunteers.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {intent === "membership" ? (
          <label className="grid gap-1 text-sm font-medium text-[var(--ipf-navy)]">
            Title *
            <select required name="title" className="ipf-input" defaultValue="">
              <option value="" disabled>
                Select
              </option>
              <option>Mr</option>
              <option>Mrs</option>
              <option>Miss</option>
            </select>
          </label>
        ) : null}
        <label className="grid gap-1 text-sm font-medium text-[var(--ipf-navy)]">
          Full name *
          <input required name="name" className="ipf-input" autoComplete="name" placeholder={intent === "membership" ? "As in passport" : undefined} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-[var(--ipf-navy)]">
          Email *
          <input required type="email" name="email" className="ipf-input" autoComplete="email" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-[var(--ipf-navy)]">
          Mobile (UAE) *
          <input required type="tel" name="phone" className="ipf-input" autoComplete="tel" />
        </label>
        {intent === "membership" ? (
          <label className="grid gap-1 text-sm font-medium text-[var(--ipf-navy)]">
            Tel / Mobile (India)
            <input type="tel" name="phoneIndia" className="ipf-input" />
          </label>
        ) : null}
        <label className="grid gap-1 text-sm font-medium text-[var(--ipf-navy)]">
          Emirate *
          <select required name="emirate" className="ipf-input" defaultValue="">
            <option value="" disabled>
              Select emirate
            </option>
            {emirates.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        {intent === "membership" ? (
          <>
            <label className="grid gap-1 text-sm font-medium text-[var(--ipf-navy)] sm:col-span-2">
              Local address (UAE)
              <input name="address" className="ipf-input" autoComplete="street-address" />
            </label>
            <label className="grid gap-1 text-sm font-medium text-[var(--ipf-navy)]">
              Occupation
              <input name="occupation" className="ipf-input" />
            </label>
            <label className="grid gap-1 text-sm font-medium text-[var(--ipf-navy)]">
              Emergency contact / mobile
              <input name="emergency" className="ipf-input" />
            </label>
            <label className="grid gap-1 text-sm font-medium text-[var(--ipf-navy)] sm:col-span-2">
              Reason for joining *
              <textarea required name="message" rows={4} className="ipf-input min-h-24" />
            </label>
            <label className="flex items-start gap-2 text-sm leading-6 text-[var(--ipf-muted)] sm:col-span-2">
              <input required type="checkbox" name="agree" className="mt-1" />
              I apply for annual membership and agree to abide by the Bye Law and Code of Ethics of Indian People's Forum.
            </label>
          </>
        ) : (
          <label className="grid gap-1 text-sm font-medium text-[var(--ipf-navy)] sm:col-span-2">
            Message *
            <textarea required name="message" rows={5} className="ipf-input min-h-32" />
          </label>
        )}
      </div>
      <div className="mt-6">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
