import { useState, type FormEvent } from "react";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { Section } from "../components/ui/Section";
import { Textarea } from "../components/ui/Textarea";
import { api } from "../lib/api";
import { site } from "../data/site";
import { useLocale } from "../i18n/LocaleProvider";

const amounts = [50, 100, 250, 500];

export default function DonatePage() {
  const { t } = useLocale();
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [done, setDone] = useState(false);
  const pledge = Number(custom || amount);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    try {
      await api("/api/donations", {
        method: "POST",
        body: JSON.stringify({ name, email, amountAed: pledge, note }),
      });
      setDone(true);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not record the pledge");
    }
  }

  return (
    <>
      <DocumentTitle title={t("nav.donate")} />
      <PageHero
        eyebrow={t("page.donate.eyebrow")}
        title={t("page.donate.title")}
        description={t("page.donate.desc")}
        crumbs={[{ label: t("nav.donate") }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1fr,0.85fr]">
          {done ? (
            <Card size="lg" title={t("page.donate.received")}>
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">
                {t("page.donate.thanks", { email, amount: pledge })}{" "}
                <a className="font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
                .
              </p>
            </Card>
          ) : (
            <form onSubmit={onSubmit}>
              <Card size="lg" title={t("page.donate.pledgeTitle")}>
                <div className="flex flex-wrap gap-2">
                  {amounts.map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={amount === value && !custom ? "primary" : "outline"}
                      size="sm"
                      onClick={() => {
                        setAmount(value);
                        setCustom("");
                      }}
                    >
                      AED {value}
                    </Button>
                  ))}
                </div>
                <Field className="mt-4" label={t("page.donate.custom")} htmlFor="amount">
                  <Input id="amount" type="number" min={1} value={custom} onChange={(e) => setCustom(e.target.value)} />
                </Field>
                <Field className="mt-4" label={t("common.fullName")} htmlFor="don-name" required>
                  <Input id="don-name" required value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field className="mt-4" label={t("common.email")} htmlFor="don-email" required>
                  <Input id="don-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field className="mt-4" label={t("page.donate.note")} htmlFor="don-note">
                  <Textarea id="don-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                </Field>
                {status ? <p className="mt-3 text-sm text-red-700">{status}</p> : null}
                <div className="mt-5">
                  <Button type="submit">{t("page.donate.pledgeBtn", { amount: pledge || 0 })}</Button>
                </div>
              </Card>
            </form>
          )}
          <Card tone="ivory" title={t("page.donate.transparency")}>
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.donate.transparencyBody")}</p>
          </Card>
        </Container>
      </Section>
    </>
  );
}
