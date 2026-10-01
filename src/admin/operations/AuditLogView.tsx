import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";

type AuditLog = {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actorName: string | null;
  actorEmail: string | null;
};

const entityLabel: Record<string, string> = {
  event: "Event",
  activity: "Activity",
  tenant_content: "Chapter/council page",
  page_section: "Page content block",
  appointment: "Committee member",
  admin_user: "Admin account",
};

function actionTone(action: string): "navy" | "saffron" | "green" | "paper" {
  if (action.endsWith(".delete")) return "paper";
  if (action.includes("approved") || action.endsWith(".create") || action === "admin.login") return "green";
  if (action.includes("rejected") || action.includes("changes_requested")) return "saffron";
  return "navy";
}

export default function AuditLogView() {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const result = await api<{ logs: AuditLog[]; nextCursor: string | null }>("/api/admin/audit-logs");
    setLogs(result.logs);
    setNextCursor(result.nextCursor);
    setLoaded(true);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load the audit log"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await api<{ logs: AuditLog[]; nextCursor: string | null }>(`/api/admin/audit-logs?after=${encodeURIComponent(nextCursor)}`);
      setLogs((prev) => [...prev, ...result.logs]);
      setNextCursor(result.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[var(--ipf-navy)]">Audit log</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--ipf-muted)]">
          Every create, update, delete, approval decision and admin sign-in, newest first.
        </p>
      </div>

      <Table>
        <TableCaption>Recorded actions</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Action</TableHeader>
            <TableHeader>Item</TableHeader>
            <TableHeader>By</TableHeader>
            <TableHeader>When</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {!loaded ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Loading…
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No actions recorded yet.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge tone={actionTone(log.action)}>{log.action}</Badge>
                </TableCell>
                <TableCell className="font-semibold text-[var(--ipf-navy)]">
                  {entityLabel[log.entityType] ?? log.entityType}
                  <span className="block text-xs font-normal text-[var(--ipf-muted)]">{log.entityId}</span>
                </TableCell>
                <TableCell>
                  {log.actorName ? (
                    <>
                      {log.actorName}
                      <span className="block text-xs text-[var(--ipf-muted)]">{log.actorEmail}</span>
                    </>
                  ) : (
                    <span className="text-[var(--ipf-muted)]">—</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-[var(--ipf-muted)]">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {nextCursor ? (
        <Button type="button" variant="outline" className="w-full" onClick={() => void loadMore()} disabled={loadingMore}>
          {loadingMore ? "Loading…" : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}
