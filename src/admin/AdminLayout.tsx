import { useState, type FormEvent, type ReactNode } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Layers, Inbox as InboxIcon, ClipboardCheck, LogOut, ExternalLink, FileEdit, ScanLine } from "lucide-react";
import { AdminProvider, useAdmin } from "./AdminProvider";
import { AuthScreen } from "../components/ui/AuthScreen";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { PageLoader } from "../components/layout/PageLoader";
import { cn } from "../lib/utils";

function SignInScreen() {
  const { signIn } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    try {
      await signIn(email, password);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign-in failed");
    }
  }

  return (
    <AuthScreen
      eyebrow="IPF UAE"
      title="Administrator login"
      description="One secure login for super, chapter and council administrators."
      status={status}
      onSubmit={onSubmit}
      submitLabel="Sign in"
    >
      <Field label="Email" htmlFor="admin-email" required>
        <Input id="admin-email" required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" htmlFor="admin-password" required>
        <Input id="admin-password" required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
    </AuthScreen>
  );
}

function ChangePasswordScreen() {
  const { changePassword } = useAdmin();
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 12) {
      setStatus("Use at least 12 characters for the new password.");
      return;
    }
    try {
      await changePassword(newPassword);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not change password");
    }
  }

  return (
    <AuthScreen
      eyebrow="First sign-in"
      title="Create a private password"
      description="Replace the temporary administrator password before using the dashboard."
      status={status}
      onSubmit={onSubmit}
      submitLabel="Save password"
    >
      <Field label="New password" htmlFor="admin-new-password" required>
        <Input id="admin-new-password" required minLength={12} type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </Field>
    </AuthScreen>
  );
}

function navItems(scopeType: "global" | "chapter" | "council") {
  return [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, requires: "any" as const },
    { to: "/admin/events", label: "Events", icon: CalendarDays, end: false, requires: "any" as const },
    { to: "/admin/content", label: "Content", icon: Layers, end: false, requires: "global" as const },
    {
      to: "/admin/my-page",
      label: scopeType === "council" ? "My Council Page" : "My Chapter Page",
      icon: FileEdit,
      end: false,
      requires: "scoped" as const,
    },
    { to: "/admin/check-in", label: "Check-in", icon: ScanLine, end: false, requires: "any" as const },
    { to: "/admin/inbox", label: "Inbox", icon: InboxIcon, end: false, requires: "any" as const },
    { to: "/admin/approvals", label: "Approvals", icon: ClipboardCheck, end: false, requires: "super" as const },
  ];
}

function AdminShell() {
  const { admin, ready, mustChangePassword, isGlobalAdmin, isSuperAdmin, signOut } = useAdmin();

  if (!ready) return <PageLoader />;
  if (!admin) return <SignInScreen />;
  if (mustChangePassword) return <ChangePasswordScreen />;

  const scopeLabel = admin.scopeType === "global" ? "All IPF UAE" : `${admin.scopeType === "chapter" ? "Chapter" : "Council"}: ${admin.scopeId}`;
  const visibleItems = navItems(admin.scopeType).filter(
    (item) =>
      item.requires === "any" ||
      (item.requires === "global" && isGlobalAdmin) ||
      (item.requires === "scoped" && !isGlobalAdmin) ||
      (item.requires === "super" && isSuperAdmin),
  );

  return (
    <div className="min-h-screen bg-[var(--ipf-ivory)] lg:flex">
      <aside className="bg-[var(--ipf-navy)] p-6 text-white lg:w-72 lg:shrink-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ipf-gold)]">IPF administration</p>
        <h1 className="mt-3 text-xl font-bold">{admin.name}</h1>
        <p className="mt-1 text-sm text-white/70">{scopeLabel}</p>
        <nav className="mt-8 grid gap-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-4 py-2.5 text-sm",
                  isActive ? "bg-white/15 font-semibold text-white" : "text-white/75 hover:bg-white/10 hover:text-white",
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 grid gap-2">
          <a
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
          >
            <ExternalLink size={18} />
            View site
          </a>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-white/75 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      <section className="min-w-0 flex-1 p-5 md:p-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </section>
    </div>
  );
}

export function AdminLayout() {
  return (
    <AdminProvider>
      <AdminShell />
    </AdminProvider>
  );
}

export function RequireGlobalAdmin({ children }: { children: ReactNode }) {
  const { isGlobalAdmin } = useAdmin();
  if (!isGlobalAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { isSuperAdmin } = useAdmin();
  if (!isSuperAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export function RequireScopedAdmin({ children }: { children: ReactNode }) {
  const { isGlobalAdmin } = useAdmin();
  if (isGlobalAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
