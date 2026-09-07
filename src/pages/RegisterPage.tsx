import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
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
import { useLocale } from "../i18n/LocaleProvider";
import { cn } from "../lib/utils";

export default function RegisterPage() {
  const { t } = useLocale();
  const { member, ready, register } = useMember();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [kind, setKind] = useState<"member" | "yuva">(params.get("kind") === "yuva" ? "yuva" : "member");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emirate, setEmirate] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const yuva = kind === "yuva";

  useEffect(() => {
    setKind(params.get("kind") === "yuva" ? "yuva" : "member");
  }, [params]);

  if (ready && member) return <Navigate to="/portal" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    try {
      await register({ name, email, phone, emirate, password, kind });
      navigate("/portal");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create the account");
    }
  }

  return (
    <>
      <DocumentTitle title={yuva ? t("page.register.yuvaTitle") : t("page.register.memberTitle")} />
      <PageHero
        eyebrow={yuva ? t("page.yuva.title") : t("page.membership.eyebrow")}
        title={yuva ? t("page.register.yuvaTitle") : t("page.register.memberTitle")}
        description={yuva ? t("page.register.yuvaDesc") : t("page.register.memberDesc")}
        crumbs={[{ label: t("nav.register") }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1fr,0.85fr]">
          <form onSubmit={onSubmit}>
            <Card size="lg" title={t("page.register.create")}>
              <div className="mb-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-lg border px-3 py-3 text-sm font-semibold",
                    !yuva ? "border-[var(--ipf-navy)] bg-[var(--ipf-navy)] text-white" : "border-[var(--ipf-line)] text-[var(--ipf-navy)]",
                  )}
                  onClick={() => {
                    setKind("member");
                    setParams({}, { replace: true });
                  }}
                >
                  {t("nav.member")}
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-lg border px-3 py-3 text-sm font-semibold",
                    yuva ? "border-[var(--ipf-saffron)] bg-[var(--ipf-saffron)] text-[var(--ipf-navy)]" : "border-[var(--ipf-line)] text-[var(--ipf-navy)]",
                  )}
                  onClick={() => {
                    setKind("yuva");
                    setParams({ kind: "yuva" }, { replace: true });
                  }}
                >
                  {t("page.yuva.title")}
                </button>
              </div>
              <Field label={t("common.fullName")} htmlFor="reg-name" required>
                <Input id="reg-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field className="mt-4" label={t("common.email")} htmlFor="reg-email" required>
                <Input id="reg-email" required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field className="mt-4" label={t("common.phoneUae")} htmlFor="reg-phone" required>
                <Input id="reg-phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="+971 50 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field className="mt-4" label={t("common.emirate")} htmlFor="reg-emirate" required>
                <SimpleSelect
                  id="reg-emirate"
                  name="emirate"
                  required
                  value={emirate}
                  onValueChange={setEmirate}
                  placeholder={t("common.selectEmirate")}
                  options={emirates}
                />
              </Field>
              <Field className="mt-4" label={t("common.passwordHint")} htmlFor="reg-password" required>
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
                <Button type="submit">{yuva ? t("page.register.getYuva") : t("page.register.createMember")}</Button>
                <Button asChild variant="outline">
                  <Link to="/sign-in">{t("nav.signIn")}</Link>
                </Button>
              </div>
            </Card>
          </form>
          <Card tone="ivory" title={yuva ? t("page.yuva.title") : t("page.register.enrol")}>
            {yuva ? (
              <p className="text-sm leading-7 text-[var(--ipf-muted)]">
                {t("page.register.yuvaDesc")}{" "}
                <Link className="font-semibold text-[var(--ipf-navy)]" to="/yuva">
                  {t("page.yuva.title")}
                </Link>
              </p>
            ) : (
              <>
                <p className="text-sm leading-7 text-[var(--ipf-muted)]">{t("page.register.enrolBody")}</p>
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <Link to="/membership">{t("page.membership.title")}</Link>
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Container>
      </Section>
    </>
  );
}
