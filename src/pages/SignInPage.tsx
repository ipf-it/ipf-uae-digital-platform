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
import { useLocale } from "../i18n/LocaleProvider";
import { api } from "../lib/api";
import { requireSupabaseAuth, supabaseAuth } from "../lib/supabase";

/** The one sign-in form for the whole site — members, Yuva volunteers, and administrators all
 * authenticate here with the same Supabase Auth login. Which experience they land in (the member
 * portal or the admin panel) is detected after authenticating, not chosen up front — nobody needs
 * to know in advance "which kind" of account they have. */
export default function SignInPage() {
  const { t } = useLocale();
  const { member, ready } = useMember();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Only ever redirect to a same-site relative path — never follow an absolute/protocol-relative
  // URL from a query param, which would make this an open redirect.
  const rawNext = params.get("next") ?? "";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [alreadyAdmin, setAlreadyAdmin] = useState(false);

  // Covers someone bookmarking /sign-in (or getting redirected here from /admin) while already
  // holding an active admin session — the member case is already handled by useMember() below.
  useEffect(() => {
    if (!ready || member || !supabaseAuth) return;
    let active = true;
    void supabaseAuth.auth.getSession().then(({ data }) => {
      if (!active || !data.session) return;
      api("/api/admin/session")
        .then(() => active && setAlreadyAdmin(true))
        .catch(() => undefined);
    });
    return () => {
      active = false;
    };
  }, [ready, member]);

  if (ready && member) return <Navigate to={next || "/portal"} replace />;
  if (alreadyAdmin) return <Navigate to={next || "/admin"} replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    setBusy(true);
    try {
      const { error } = await requireSupabaseAuth().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw error;
      const isAdmin = await api("/api/admin/session")
        .then(() => true)
        .catch(() => false);
      if (isAdmin) {
        await api("/api/admin/login-audit", { method: "POST" }).catch(() => undefined);
        navigate(next || "/admin");
        return;
      }
      // Not an admin account — confirm this is at least a real member before treating sign-in as
      // successful (MemberProvider's own auth-state listener picks up the new session from here).
      await api("/api/members/me");
      navigate(next || "/portal");
    } catch (error) {
      // Supabase auth may have succeeded even though neither check above matched (an edge case —
      // an auth account with no member or admin record). Don't leave the browser half-signed-in.
      await supabaseAuth?.auth.signOut().catch(() => undefined);
      setStatus(error instanceof Error ? error.message : "Could not sign in");
    } finally {
      setBusy(false);
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
                <Button type="submit" disabled={busy}>
                  {busy ? "Signing in…" : t("nav.signIn")}
                </Button>
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
