import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Users, ClipboardCheck, ArrowUpRight, MessageSquare } from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";
import { useAdmin } from "../AdminProvider";
import { cn } from "../../lib/utils";

type Submission = { id: string; entity_type: string; entity_id: string; status: string; review_note: string; updated_at: string };

type Dashboard = {
  counts: { events: number; people: number; approvals: number };
  mySubmissions?: Submission[];
};

const entityLabel: Record<string, string> = {
  event: "Event",
  tenant_content: "Your page",
  page_section: "Page content",
  activity: "Activity",
  appointment: "Committee member",
};

const submissionTone: Record<string, "navy" | "saffron" | "green" | "paper"> = {
  submitted: "saffron",
  under_review: "saffron",
  changes_requested: "saffron",
  rejected: "paper",
  approved: "green",
  published: "green",
};

const approvalStates = ["Draft", "Submitted", "Under review", "Changes", "Approved", "Scheduled", "Published", "Rejected"];
const roleScopes = [
  ["Super admin", "Global · settings, roles, audit"],
  ["Content admin", "Global · review & publish"],
  ["Chapter admin", "Assigned emirate only"],
  ["Council admin", "Assigned council only"],
  ["Editor", "Assigned drafts only"],
];

function StatCard({ icon: Icon, label, value, accent, to }: { icon: typeof CalendarDays; label: string; value: string; accent: string; to: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-5 shadow-[0_8px_24px_rgba(11,31,58,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(11,31,58,0.12)]"
    >
      <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", accent)}>
        <Icon size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ipf-muted)]">{label}</p>
        <p className="mt-1 text-2xl font-bold text-[var(--ipf-navy)]">{value}</p>
      </div>
      <ArrowUpRight size={18} className="shrink-0 text-[var(--ipf-muted)] opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}

export default function DashboardTab() {
  const { admin, isGlobalAdmin } = useAdmin();
  const toast = useToast();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    void api<Dashboard>("/api/admin/dashboard")
      .then(setDashboard)
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load the dashboard"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">
          {isGlobalAdmin ? "Central oversight" : "Your scope"}
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Welcome back{admin ? `, ${admin.name.split(" ")[0]}` : ""}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
          {isGlobalAdmin
            ? "One view for membership, events and content awaiting central action. Chapter and council teams create within their assigned scope; publication remains centrally governed."
            : `Events and people within ${admin?.scopeType === "chapter" ? "your chapter" : "your council"}.`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="Events" value={String(dashboard?.counts.events ?? "—")} accent="bg-[var(--ipf-green)]/10 text-[var(--ipf-green)]" to="/admin/operations" />
        <StatCard icon={Users} label="People" value={String(dashboard?.counts.people ?? "—")} accent="bg-[var(--ipf-navy)]/10 text-[var(--ipf-navy)]" to="/admin/people" />
        <StatCard icon={ClipboardCheck} label="Pending approvals" value={String(dashboard?.counts.approvals ?? "—")} accent="bg-[var(--ipf-saffron)]/15 text-[#7a4300]" to={isGlobalAdmin ? "/admin/operations?tab=approvals" : "/admin/cms"} />
      </div>

      {!isGlobalAdmin && dashboard?.mySubmissions && dashboard.mySubmissions.length > 0 ? (
        <Card title="Your recent submissions" description="Status and any notes from the super admin on what you've submitted for approval.">
          <div className="grid gap-3">
            {dashboard.mySubmissions.map((item) => (
              <div key={item.id} className="rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-ivory)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--ipf-navy)]">{entityLabel[item.entity_type] ?? item.entity_type}</p>
                  <Badge tone={submissionTone[item.status] ?? "paper"}>{item.status.replace(/_/g, " ")}</Badge>
                </div>
                {item.review_note ? (
                  <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[var(--ipf-muted)]">
                    <MessageSquare size={15} className="mt-0.5 shrink-0" />
                    <span>{item.review_note}</span>
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Run events", to: "/admin/operations" },
          { label: "Edit content", to: "/admin/cms" },
          { label: "View submissions", to: "/admin/support" },
          { label: "View people", to: "/admin/people" },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="flex items-center justify-between rounded-xl border border-[var(--ipf-line)] bg-white px-4 py-3.5 text-sm font-semibold text-[var(--ipf-navy)] shadow-sm transition hover:border-[var(--ipf-navy)]/30 hover:shadow-md"
          >
            {action.label}
            <ArrowUpRight size={16} className="text-[var(--ipf-muted)]" />
          </Link>
        ))}
      </div>

      {isGlobalAdmin ? (
        <>
          <Card title="Approval pipeline" description="Reusable governance for events, activities, news and social posts.">
            <div className="grid gap-2 sm:grid-cols-4 xl:grid-cols-8">
              {approvalStates.map((state, index) => (
                <div
                  key={state}
                  className={cn(
                    "rounded-xl border p-3 text-center text-xs font-semibold transition",
                    index === 1 || index === 2
                      ? "border-[var(--ipf-saffron)] bg-orange-50 text-[var(--ipf-navy)]"
                      : "border-[var(--ipf-line)] bg-[var(--ipf-ivory)] text-[var(--ipf-muted)]",
                  )}
                >
                  {state}
                </div>
              ))}
            </div>
          </Card>
          <Card title="Role & scope model" description="Permissions are evaluated by both role and organisational scope.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {roleScopes.map(([name, scope]) => (
                <div key={name} className="rounded-xl bg-[var(--ipf-ivory)] p-4 transition hover:bg-[var(--ipf-ivory)]/70">
                  <p className="text-sm font-bold text-[var(--ipf-navy)]">{name}</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--ipf-muted)]">{scope}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
