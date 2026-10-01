import { useEffect, useState, type FormEvent } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Layers, Inbox as InboxIcon, Users, LogOut, ExternalLink, Menu, X } from "lucide-react";
import { AdminProvider, useAdmin } from "./AdminProvider";
import { AuthScreen } from "../components/ui/AuthScreen";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { PageLoader } from "../components/layout/PageLoader";
import { cn } from "../lib/utils";

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

// Consolidated down from 9 scattered top-level items to 5: every content-management surface
// (Homepage, Pages, Organisation/committees, Publications, Navigation) now lives inside one
// "Content" hub (CmsTab.tsx) with its own sub-navigation, instead of each being its own sidebar
// entry — mirrors how Operations already groups Events/Activities/Sponsors/Approvals together.
const navItems: { to: string; label: string; icon: typeof LayoutDashboard; end: boolean; requiresGlobal: boolean; hiddenForEditor: boolean; editorAllowed?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, requiresGlobal: false, hiddenForEditor: false },
  { to: "/admin/operations", label: "Operations", icon: ClipboardList, end: false, requiresGlobal: false, hiddenForEditor: false },
  { to: "/admin/cms", label: "Content", icon: Layers, end: false, requiresGlobal: false, hiddenForEditor: false, editorAllowed: true },
  { to: "/admin/support", label: "Support", icon: InboxIcon, end: false, requiresGlobal: false, hiddenForEditor: false },
  { to: "/admin/people", label: "People", icon: Users, end: false, requiresGlobal: false, hiddenForEditor: false },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AdminShell() {
  const { admin, ready, mustChangePassword, isGlobalAdmin, signOut } = useAdmin();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile nav drawer automatically whenever the route changes, instead of leaving it
  // open and covering the page the user just navigated to.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  if (!ready) return <PageLoader />;
  if (!admin) return <Navigate to={`/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (mustChangePassword) return <ChangePasswordScreen />;

  const scopeLabel = admin.scopeType === "global" ? "All IPF UAE" : `${admin.scopeType === "chapter" ? "Chapter" : "Council"}: ${admin.scopeId}`;
  const visibleItems = navItems.filter(
    (item) =>
      (!item.requiresGlobal || isGlobalAdmin || (item.editorAllowed && admin.role === "editor")) &&
      (!item.hiddenForEditor || admin.role !== "editor"),
  );
  const currentLabel = visibleItems.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))?.label ?? "Admin";

  return (
    <div className="min-h-screen bg-[var(--ipf-ivory)] lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 shrink-0 overflow-y-auto bg-[linear-gradient(180deg,var(--ipf-navy)_0%,#0a1a33_100%)] p-5 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:self-start",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:flex lg:flex-col",
        )}
      >
        <div className="flex items-center justify-between lg:justify-start">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ipf-gold)]/15 text-sm font-black text-[var(--ipf-gold)]">IPF</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ipf-gold)]">Administration</p>
              <p className="truncate text-xs text-white/60">{scopeLabel}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8 grid gap-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition",
                  isActive ? "bg-white text-[var(--ipf-navy)] shadow-[0_8px_20px_rgba(0,0,0,0.25)]" : "text-white/70 hover:bg-white/10 hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", isActive ? "bg-[var(--ipf-navy)]/10 text-[var(--ipf-navy)]" : "bg-white/10 text-white/80 group-hover:bg-white/15")}>
                    <item.icon size={17} />
                  </span>
                  <span className="font-semibold">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto grid gap-1 pt-8">
          <a
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10"><ExternalLink size={16} /></span>
            View live site
          </a>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10"><LogOut size={16} /></span>
            Sign out
          </button>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--ipf-gold)] text-xs font-bold text-[var(--ipf-navy)]">{initials(admin.name)}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{admin.name}</p>
              <p className="truncate text-xs text-white/55">{admin.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {mobileNavOpen ? <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileNavOpen(false)} aria-hidden="true" /> : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--ipf-line)] bg-[var(--ipf-paper)]/90 px-5 py-3.5 backdrop-blur-sm lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[var(--ipf-navy)] hover:bg-[var(--ipf-ivory)] lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="truncate text-base font-bold text-[var(--ipf-navy)] sm:text-lg">{currentLabel}</h1>
          </div>
          <span className="hidden shrink-0 rounded-full bg-[var(--ipf-ivory)] px-3 py-1 text-xs font-semibold text-[var(--ipf-muted)] sm:inline-flex">{admin.role.replace(/_/g, " ")}</span>
        </header>
        <section className="min-w-0 flex-1 p-5 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </section>
      </div>
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
