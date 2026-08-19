import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMember } from "../cms/MemberProvider";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { Section } from "../components/ui/Section";
import { SimpleSelect } from "../components/ui/Select";
import { emirates } from "../data/forms";
import { site } from "../data/site";

export default function RegisterPage() {
  const { member, ready, register } = useMember();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emirate, setEmirate] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  if (ready && member) return <Navigate to="/portal" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    try {
      await register({ name, email, phone, emirate, password });
      navigate("/portal");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `${error.message} If this public host has no member API, write to ${site.email}.`
          : "Could not create the account",
      );
    }
  }

  return (
    <>
      <DocumentTitle title="Register" />
      <PageHero
        eyebrow="Membership"
        title="Create a member account"
        description="A member account issues a digital ID and lets you log volunteer hours. Formal enrolment still goes through the membership application."
        crumbs={[{ label: "Register" }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1fr,0.85fr]">
          <form onSubmit={onSubmit}>
            <Card size="lg" title="Register">
              <Field label="Full name" htmlFor="reg-name" required>
                <Input id="reg-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field className="mt-4" label="Email" htmlFor="reg-email" required>
                <Input id="reg-email" required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field className="mt-4" label="Mobile (UAE)" htmlFor="reg-phone">
                <Input id="reg-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field className="mt-4" label="Emirate / chapter" htmlFor="reg-emirate" required>
                <SimpleSelect
                  id="reg-emirate"
                  name="emirate"
                  required
                  value={emirate}
                  onValueChange={setEmirate}
                  placeholder="Select emirate"
                  options={emirates}
                />
              </Field>
              <Field className="mt-4" label="Password (8 characters or more)" htmlFor="reg-password" required>
                <Input
                  id="reg-password"
                  required
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {status ? <p className="mt-3 text-sm text-red-700">{status}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="submit">Create account</Button>
                <Button asChild variant="outline">
                  <Link to="/sign-in">Sign in</Link>
                </Button>
              </div>
            </Card>
          </form>
          <Card tone="ivory" title="Official enrolment">
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">
              Creating an account does not replace the membership application. After you apply, the Executive Committee
              writes by email and may ask for proof of resident status.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link to="/membership">Membership application</Link>
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
