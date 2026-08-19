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
import { api } from "../../lib/api";
import { useLocale } from "../../i18n/LocaleProvider";

type InquiryFormProps = {
  intent: "contact" | "membership" | "support" | "jobs";
};

const titles = {
  contact: "form.contactTitle",
  membership: "form.membershipTitle",
  support: "form.supportTitle",
  jobs: "form.jobsTitle",
} as const;

const honorifics = ["Mr", "Mrs", "Miss"] as const;

export function InquiryForm({ intent }: InquiryFormProps) {
  const { t } = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [honorific, setHonorific] = useState("");
  const [emirate, setEmirate] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (intent === "membership" && !agreed) {
      setStatus(t("form.agreeError"));
      return;
    }
    const form = new FormData(event.currentTarget);
    const payload = {
      intent,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      emirate,
      message: String(form.get("message") ?? ""),
      extra: {
        title: honorific,
        phoneIndia: String(form.get("phoneIndia") ?? ""),
        address: String(form.get("address") ?? ""),
        occupation: String(form.get("occupation") ?? ""),
        emergency: String(form.get("emergency") ?? ""),
      },
    };
    setBusy(true);
    setStatus("");
    try {
      await api("/api/inquiries", { method: "POST", body: JSON.stringify(payload) });
      setRecorded(true);
    } catch {
      setRecorded(false);
    }
    setBusy(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card size="lg" eyebrow={t("common.received")} title={t("common.thankYou")}>
        <p className="text-sm leading-7 text-[var(--ipf-muted)]">
          {recorded ? t("common.recorded") : t("common.notStored")} {t("common.writeAlso", { email: site.email })}
        </p>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <Card
        size="lg"
        title={t(titles[intent])}
        description={t("common.required")}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {intent === "membership" ? (
            <Field label={t("common.title")} htmlFor="inquiry-title" required>
              <SimpleSelect
                id="inquiry-title"
                name="title"
                required
                value={honorific}
                onValueChange={setHonorific}
                placeholder={t("common.select")}
                options={honorifics}
              />
            </Field>
          ) : null}

          <Field label={t("common.fullName")} htmlFor="inquiry-name" required>
            <Input
              id="inquiry-name"
              required
              name="name"
              autoComplete="name"
              placeholder={intent === "membership" ? t("form.passportName") : t("common.fullName")}
            />
          </Field>

          <Field label={t("common.email")} htmlFor="inquiry-email" required>
            <Input id="inquiry-email" required type="email" name="email" autoComplete="email" placeholder="name@email.com" />
          </Field>

          <Field label={t("common.phoneUae")} htmlFor="inquiry-phone" required>
            <Input id="inquiry-phone" required type="tel" name="phone" autoComplete="tel" placeholder="+971" />
          </Field>

          {intent === "membership" ? (
            <Field label={t("common.phoneIndia")} htmlFor="inquiry-phone-india">
              <Input id="inquiry-phone-india" type="tel" name="phoneIndia" placeholder="+91" />
            </Field>
          ) : null}

          <Field label={t("common.emirate")} htmlFor="inquiry-emirate" required>
            <SimpleSelect
              id="inquiry-emirate"
              name="emirate"
              required
              value={emirate}
              onValueChange={setEmirate}
              placeholder={t("common.selectEmirate")}
              options={emirates}
            />
          </Field>

          {intent === "membership" ? (
            <>
              <Field label={t("common.address")} htmlFor="inquiry-address" className="sm:col-span-2">
                <Input id="inquiry-address" name="address" autoComplete="street-address" placeholder="Street, area, emirate" />
              </Field>
              <Field label={t("common.occupation")} htmlFor="inquiry-occupation">
                <Input id="inquiry-occupation" name="occupation" placeholder={t("common.occupation")} />
              </Field>
              <Field label={t("common.emergency")} htmlFor="inquiry-emergency">
                <Input id="inquiry-emergency" name="emergency" type="tel" placeholder={t("common.phoneUae")} />
              </Field>
              <Field label={t("form.reason")} htmlFor="inquiry-message" required className="sm:col-span-2">
                <Textarea id="inquiry-message" required name="message" rows={4} placeholder={t("form.reasonPh")} />
              </Field>
              <div className="flex items-start gap-3 sm:col-span-2">
                <Checkbox
                  id="inquiry-agree"
                  checked={agreed}
                  onCheckedChange={(value) => setAgreed(value === true)}
                />
                <Label htmlFor="inquiry-agree" className="text-sm font-normal leading-6 text-[var(--ipf-muted)]">
                  {t("form.agree")}
                </Label>
              </div>
            </>
          ) : (
            <Field label={t("common.message")} htmlFor="inquiry-message" required className="sm:col-span-2">
              <Textarea id="inquiry-message" required name="message" rows={5} placeholder={t("form.helpPh")} />
            </Field>
          )}
        </div>
        {status ? <p className="mt-4 text-sm text-red-700">{status}</p> : null}
        <div className="mt-6">
          <Button type="submit" disabled={busy}>
            {busy ? t("common.sending") : t("common.submit")}
          </Button>
        </div>
      </Card>
    </form>
  );
}
