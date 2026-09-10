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
import { SegmentedTabs } from "../components/ui/Tabs";
import { useLocale } from "../i18n/LocaleProvider";
import { api } from "../lib/api";
import { requireSupabaseAuth, supabaseAuth } from "../lib/supabase";

type SignInTab = "member" | "yuva" | "admin";

const tabCopy: Record<SignInTab, { eyebrow: string; title: string; description: string; cardTitle: string }> = {
  member: {
    eyebrow: "Members",
    title: "Member sign in",
    description: "Sign in to view your digital ID, event registrations and volunteer hours.",
    cardTitle: "Sign in as a member",
  },
  yuva: {
    eyebrow: "IPF Yuva",
    title: "Yuva volunteer sign in",
    description: "Same account as members — sign in to manage your volunteer duty and hours.",
    cardTitle: "Sign in as an IPF Yuva volunteer",
  },
  admin: {
    eyebrow: "Administration",
    title: "Administrator sign in",
    description: "For super, chapter and council administrators managing the platform.",
    cardTitle: "Sign in as an administrator",
  },
};

/** The one sign-in form for the whole site — members, Yuva volunteers, and administrators all
 * authenticate here with the same Supabase Auth login. The tab switch only sets expectations and
 * points the "register" link the right way — after credentials are verified, the destination
 * (member portal vs admin panel) is always detected from the account itself, so picking the
 * "wrong" tab by mistake still lands someone in the right place rather than locking them out. */
export default function SignInPage() {
  const { t } = useLocale();
  const { member, ready } = useMember();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Only ever redirect to a same-site relative path — never follow an absolute/protocol-relative
  // URL from a query param, which would make this an open redirect.
  const rawNext = params.get("next") ?? "";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";
  const [tab, setTab] = useState<SignInTab>(next.startsWith("/admin") ? "admin" : "member");
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

  const copy = tabCopy[tab];

  return (
    <>
      <DocumentTitle title={copy.title} />
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.description} crumbs={[{ label: t("nav.signIn") }]} />
      <Section tone="white">
        <Container className="max-w-lg">
          <SegmentedTabs
            value={tab}
            onValueChange={setTab}
            items={[
              { value: "member", label: "Member" },
              { value: "yuva", label: "IPF Yuva" },
              { value: "admin", label: "Admin" },
            ]}
          />
          <form className="mt-5" onSubmit={onSubmit}>
            <Card size="lg" title={copy.cardTitle}>
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
              <div className="mt-5">
                <Button type="submit" disabled={busy}>
                  {busy ? "Signing in…" : t("nav.signIn")}
                </Button>
              </div>
              {tab === "admin" ? (
                <p className="mt-4 text-sm text-[var(--ipf-muted)]">
                  Administrator accounts are created by a super admin — contact yours if you need access.
                </p>
              ) : (
                <p className="mt-4 text-sm text-[var(--ipf-muted)]">
                  {t("page.signin.new")}{" "}
                  <Link className="font-semibold text-[var(--ipf-navy)]" to={tab === "yuva" ? "/register?kind=yuva" : "/register"}>
                    {tab === "yuva" ? t("page.yuva.title") : t("page.yuva.registerMember")}
                  </Link>
                  {tab === "member" ? (
                    <>
                      {" "}
                      · <Link className="font-semibold text-[var(--ipf-navy)]" to="/register?kind=yuva">
                        {t("page.yuva.title")}
                      </Link>
                    </>
                  ) : null}
                </p>
              )}
            </Card>
          </form>
        </Container>
      </Section>
    </>
  );
}
