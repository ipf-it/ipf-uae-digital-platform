import { useState, type FormEvent } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Checkbox } from "../ui/Checkbox";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { SimpleSelect } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
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

const honorifics = ["Mr", "Mrs", "Miss"] as const;

export function InquiryForm({ intent }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [honorific, setHonorific] = useState("");
  const [emirate, setEmirate] = useState("");
  const [agreed, setAgreed] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card size="lg" eyebrow="Received" title="Thank you. IPF will respond by email.">
        <p className="text-sm leading-7 text-[var(--ipf-muted)]">
          This public website does not yet send form data to a server. Please also write to{" "}
          <a className="font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.email}`}>
            {site.email}
          </a>{" "}
          so the team can assist you without delay. A CMS-backed intake will be connected in the next phase.
        </p>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <Card
        size="lg"
        title={titles[intent]}
        description="Fields marked with * are required. Responses are handled by IPF volunteers."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {intent === "membership" ? (
            <Field label="Title" htmlFor="inquiry-title" required>
              <SimpleSelect
                id="inquiry-title"
                name="title"
                required
                value={honorific}
                onValueChange={setHonorific}
                placeholder="Select"
                options={honorifics}
              />
            </Field>
          ) : null}

          <Field label="Full name" htmlFor="inquiry-name" required>
            <Input
              id="inquiry-name"
              required
              name="name"
              autoComplete="name"
              placeholder={intent === "membership" ? "As in passport" : "Your full name"}
            />
          </Field>

          <Field label="Email" htmlFor="inquiry-email" required>
            <Input id="inquiry-email" required type="email" name="email" autoComplete="email" placeholder="name@email.com" />
          </Field>

          <Field label="Mobile (UAE)" htmlFor="inquiry-phone" required>
            <Input id="inquiry-phone" required type="tel" name="phone" autoComplete="tel" placeholder="+971" />
          </Field>

          {intent === "membership" ? (
            <Field label="Tel / Mobile (India)" htmlFor="inquiry-phone-india">
              <Input id="inquiry-phone-india" type="tel" name="phoneIndia" placeholder="+91" />
            </Field>
          ) : null}

          <Field label="Emirate" htmlFor="inquiry-emirate" required>
            <SimpleSelect
              id="inquiry-emirate"
              name="emirate"
              required
              value={emirate}
              onValueChange={setEmirate}
              placeholder="Select emirate"
              options={emirates}
            />
          </Field>

          {intent === "membership" ? (
            <>
              <Field label="Local address (UAE)" htmlFor="inquiry-address" className="sm:col-span-2">
                <Input id="inquiry-address" name="address" autoComplete="street-address" placeholder="Street, area, emirate" />
              </Field>
              <Field label="Occupation" htmlFor="inquiry-occupation">
                <Input id="inquiry-occupation" name="occupation" placeholder="Profession" />
              </Field>
              <Field label="Emergency contact / mobile" htmlFor="inquiry-emergency">
                <Input id="inquiry-emergency" name="emergency" type="tel" placeholder="Contact number" />
              </Field>
              <Field label="Reason for joining" htmlFor="inquiry-message" required className="sm:col-span-2">
                <Textarea id="inquiry-message" required name="message" rows={4} placeholder="Tell us briefly why you wish to join IPF." />
              </Field>
              <div className="flex items-start gap-3 sm:col-span-2">
                <Checkbox
                  id="inquiry-agree"
                  checked={agreed}
                  onCheckedChange={(value) => setAgreed(value === true)}
                />
                <input type="hidden" name="agree" value={agreed ? "yes" : ""} required />
                <Label htmlFor="inquiry-agree" className="text-sm font-normal leading-6 text-[var(--ipf-muted)]">
                  I apply for membership and agree to abide by the Bye Law and Code of Ethics of Indian People's Forum.
                </Label>
              </div>
            </>
          ) : (
            <Field label="Message" htmlFor="inquiry-message" required className="sm:col-span-2">
              <Textarea id="inquiry-message" required name="message" rows={5} placeholder="How can IPF help?" />
            </Field>
          )}
        </div>
        <div className="mt-6">
          <Button type="submit">Submit</Button>
        </div>
      </Card>
    </form>
  );
}
