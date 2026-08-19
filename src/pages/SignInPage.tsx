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

export default function SignInPage() {
  const { member, ready, signIn } = useMember();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  if (ready && member) return <Navigate to="/portal" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    try {
      await signIn(email, password);
      navigate("/portal");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not sign in");
    }
  }

  return (
    <>
      <DocumentTitle title="Sign In" />
      <PageHero
        eyebrow="Members"
        title="Sign in"
        description="Members can open a digital membership card, log volunteer hours, and RSVP to programmes."
        crumbs={[{ label: "Sign in" }]}
      />
      <Section tone="white">
        <Container className="max-w-lg">
          <form onSubmit={onSubmit}>
            <Card size="lg" title="Member login">
              <Field label="Email" htmlFor="signin-email" required>
                <Input id="signin-email" required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field className="mt-4" label="Password" htmlFor="signin-password" required>
                <Input
                  id="signin-password"
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {status ? <p className="mt-3 text-sm text-red-700">{status}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="submit">Sign in</Button>
                <Button asChild variant="outline">
                  <Link to="/register">Create account</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-[var(--ipf-muted)]">
                New to IPF?{" "}
                <Link className="font-semibold text-[var(--ipf-navy)]" to="/membership">
                  Apply for membership
                </Link>
                .
              </p>
            </Card>
          </form>
        </Container>
      </Section>
    </>
  );
}
