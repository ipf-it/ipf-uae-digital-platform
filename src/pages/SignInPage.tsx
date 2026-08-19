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
import { useLocale } from "../i18n/LocaleProvider";

export default function SignInPage() {
  const { t } = useLocale();
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
      <DocumentTitle title={t("page.signin.title")} />
      <PageHero
        eyebrow={t("page.signin.eyebrow")}
        title={t("page.signin.title")}
        description={t("page.signin.desc")}
        crumbs={[{ label: t("nav.signIn") }]}
      />
      <Section tone="white">
        <Container className="max-w-lg">
          <form onSubmit={onSubmit}>
            <Card size="lg" title={t("page.signin.title")}>
              <Field label={t("common.email")} htmlFor="signin-email" required>
                <Input id="signin-email" required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field className="mt-4" label={t("common.password")} htmlFor="signin-password" required>
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
                <Button type="submit">{t("nav.signIn")}</Button>
                <Button asChild variant="outline">
                  <Link to="/register">{t("page.register.create")}</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-[var(--ipf-muted)]">
                {t("page.signin.new")}{" "}
                <Link className="font-semibold text-[var(--ipf-navy)]" to="/register">
                  {t("page.yuva.registerMember")}
                </Link>{" "}
                ·{" "}
                <Link className="font-semibold text-[var(--ipf-navy)]" to="/register?kind=yuva">
                  {t("page.yuva.title")}
                </Link>
              </p>
            </Card>
          </form>
        </Container>
      </Section>
    </>
  );
}
