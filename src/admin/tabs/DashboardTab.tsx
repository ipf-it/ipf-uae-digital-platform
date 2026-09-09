import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import { StatPill } from "../../components/ui/StatPill";
import { useAdmin } from "../AdminProvider";

type Dashboard = {
  counts: { events: number; people: number; approvals: number };
};

const approvalStates = ["Draft", "Submitted", "Under review", "Changes", "Approved", "Scheduled", "Published", "Rejected"];
const roleScopes = [
  ["Super admin", "Global · settings, roles, audit"],
  ["Content admin", "Global · review & publish"],
  ["Chapter admin", "Assigned emirate only"],
  ["Council admin", "Assigned council only"],
  ["Editor", "Assigned drafts only"],
];

export default function DashboardTab() {
  const { admin, isGlobalAdmin } = useAdmin();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    void api<Dashboard>("/api/admin/dashboard").then(setDashboard).catch(() => undefined);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">
          {isGlobalAdmin ? "Central oversight" : "Your scope"}
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Dashboard</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
          {isGlobalAdmin
            ? "One view for membership, events and content awaiting central action. Chapter and council teams create within their assigned scope; publication remains centrally governed."
            : `Events and people within ${admin?.scopeType === "chapter" ? "your chapter" : "your council"}.`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatPill label="Events" value={String(dashboard?.counts.events ?? "—")} />
        <StatPill label="People" value={String(dashboard?.counts.people ?? "—")} />
        <StatPill label="Pending approvals" value={String(dashboard?.counts.approvals ?? "—")} />
      </div>

      {isGlobalAdmin ? (
        <>
          <Card title="Approval pipeline" description="Reusable governance for events, activities, news and social posts.">
            <div className="grid gap-2 sm:grid-cols-4 xl:grid-cols-8">
              {approvalStates.map((state, index) => (
                <div
                  key={state}
                  className={`rounded-lg border p-3 text-center text-xs font-semibold ${
                    index === 1 || index === 2
                      ? "border-[var(--ipf-saffron)] bg-orange-50 text-[var(--ipf-navy)]"
                      : "border-[var(--ipf-line)] bg-[var(--ipf-ivory)] text-[var(--ipf-muted)]"
                  }`}
                >
                  {state}
                </div>
              ))}
            </div>
          </Card>
          <Card title="Role & scope model" description="Permissions are evaluated by both role and organisational scope.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {roleScopes.map(([name, scope]) => (
                <div key={name} className="rounded-xl bg-[var(--ipf-ivory)] p-4">
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
