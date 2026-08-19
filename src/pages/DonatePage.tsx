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

const amounts = [50, 100, 250, 500];

export default function DonatePage() {
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
      <DocumentTitle title="Donate" />
      <PageHero
        eyebrow="Support"
        title="Donate to IPF welfare work"
        description="Pledges are recorded by IPF and confirmed by email. A UAE payment gateway (Telr or PayTabs) will be connected for card settlement."
        crumbs={[{ label: "Donate" }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1fr,0.85fr]">
          {done ? (
            <Card size="lg" title="Pledge received">
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">
                Thank you. IPF will write to {email} to confirm AED {pledge}. You may also email{" "}
                <a className="font-semibold text-[var(--ipf-navy)]" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
                .
              </p>
            </Card>
          ) : (
            <form onSubmit={onSubmit}>
              <Card size="lg" title="Record a pledge">
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
                <Field className="mt-4" label="Or enter another amount (AED)" htmlFor="amount">
                  <Input id="amount" type="number" min={1} value={custom} onChange={(e) => setCustom(e.target.value)} />
                </Field>
                <Field className="mt-4" label="Full name" htmlFor="don-name" required>
                  <Input id="don-name" required value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field className="mt-4" label="Email" htmlFor="don-email" required>
                  <Input id="don-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field className="mt-4" label="Note" htmlFor="don-note">
                  <Textarea id="don-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                </Field>
                {status ? <p className="mt-3 text-sm text-red-700">{status}</p> : null}
                <div className="mt-5">
                  <Button type="submit">Pledge AED {pledge || 0}</Button>
                </div>
              </Card>
            </form>
          )}
          <Card tone="ivory" title="Transparency">
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">
              IPF is a non-profit socio-cultural organisation. Welfare support, counselling and emergency response are
              carried out by volunteers. Card checkout will use a UAE-native gateway when credentials are issued.
            </p>
          </Card>
        </Container>
      </Section>
    </>
  );
}
