import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useMember } from "../cms/MemberProvider";
import { DocumentTitle } from "../components/layout/DocumentTitle";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Checkbox } from "../components/ui/Checkbox";
import { Container } from "../components/ui/Container";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Section } from "../components/ui/Section";
import { SimpleSelect } from "../components/ui/Select";
import { useToast } from "../components/ui/Toast";
import { emirates } from "../data/forms";
import { useOrgCouncils } from "../hooks/useOrgDirectory";
import { useLocale } from "../i18n/LocaleProvider";

type Step = "details" | "check-email";

export default function RegisterPage() {
  const { t } = useLocale();
  const { councils } = useOrgCouncils();
  const homeStateOptions = councils.filter((council) => council.kind === "state").map((council) => ({ value: council.id, label: council.region }));
  const { member, ready, register } = useMember();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const wantsVolunteer = params.get("kind") === "yuva";

  const [step, setStep] = useState<Step>("details");
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emirate, setEmirate] = useState("");
  const [homeState, setHomeState] = useState("");
  const [isVolunteer, setIsVolunteer] = useState(wantsVolunteer);
  const [password, setPassword] = useState("");

  if (ready && member) return <Navigate to="/portal" replace />;

  async function onSubmitDetails(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await register({ name, email, phone, emirate, homeState, isVolunteer, password });
      if (result.needsEmailConfirmation) {
        setStep("check-email");
      } else {
        toast.success("Welcome to IPF UAE.");
        navigate("/portal");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DocumentTitle title={t("page.register.memberTitle")} />
      <PageHero
        eyebrow={t("page.membership.eyebrow")}
        title={t("page.register.memberTitle")}
        description={t("page.register.memberDesc")}
        crumbs={[{ label: t("nav.register") }]}
      />
      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1fr,0.85fr]">
          <Card size="lg" title="Create your account">
            {step === "details" ? (
              <form onSubmit={onSubmitDetails}>
                <p className="text-sm leading-7 text-[var(--ipf-muted)]">
                  One registration covers both your emirate chapter and your home-state council — no re-registration, no duplicate accounts.
                </p>
                <Field className="mt-4" label={t("common.fullName")} htmlFor="reg-name" required>
                  <Input id="reg-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field className="mt-4" label={t("common.email")} htmlFor="reg-email" required>
                  <Input id="reg-email" required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field className="mt-4" label={t("common.phoneUae")} htmlFor="reg-phone" required>
                  <Input id="reg-phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="+971 50 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Field>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label={t("common.emirate")} htmlFor="reg-emirate" required>
                    <SimpleSelect id="reg-emirate" name="emirate" required value={emirate} onValueChange={setEmirate} placeholder={t("common.selectEmirate")} options={emirates} />
                  </Field>
                  <Field label="Home state" htmlFor="reg-home-state" required>
                    <SimpleSelect id="reg-home-state" name="homeState" required value={homeState} onValueChange={setHomeState} placeholder="Select your home state" options={homeStateOptions} />
                  </Field>
                </div>
                <Field className="mt-4" label={t("common.passwordHint")} htmlFor="reg-password" required>
                  <Input id="reg-password" required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Field>
                <div className="mt-4 flex items-start gap-3">
                  <Checkbox id="reg-volunteer" checked={isVolunteer} onCheckedChange={(checked) => setIsVolunteer(checked === true)} />
                  <Label htmlFor="reg-volunteer" className="text-sm leading-6 text-[var(--ipf-navy)]">
                    I'd like to volunteer as IPF Yuva — I can join events as a volunteer, not just as a member.
                  </Label>
                </div>
                <div className="mt-5">
                  <Button type="submit" disabled={busy}>
                    {busy ? "Creating account…" : "Create my account"}
                  </Button>
                </div>
              </form>
            ) : null}

            {step === "check-email" ? (
              <div>
                <p className="text-sm leading-7 text-[var(--ipf-muted)]">
                  We've sent a confirmation link to <b className="text-[var(--ipf-navy)]">{email}</b>. Click it, then sign in to finish setting up your account.
                </p>
                <div className="mt-5">
                  <Button asChild>
                    <Link to="/sign-in">Go to sign in</Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>

          <Card tone="ivory" title="What happens next">
            <p className="text-sm leading-7 text-[var(--ipf-muted)]">
              This form is your membership application — there's no separate manual step. Once your details are saved, your account is created immediately with your own membership number and digital ID.
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--ipf-muted)]">
              Already have an account?{" "}
              <Link className="font-semibold text-[var(--ipf-navy)]" to="/sign-in">
                {t("nav.signIn")}
              </Link>
            </p>
          </Card>
        </Container>
      </Section>
    </>
  );
}
