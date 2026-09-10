import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { DropdownMenu, DropdownMenuButton, DropdownMenuContent, DropdownMenuItem } from "../../components/ui/DropdownMenu";
import { PromptDialog } from "../../components/ui/PromptDialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";

type Approval = { id: string; entity_type: string; entity_id: string; status: string; scope_type: string; scope_id: string; created_at: string };
type Dashboard = { pending: Approval[] };
type Decision = "approved" | "rejected" | "changes_requested";

const decisionLabel: Record<Decision, string> = {
  approved: "approved",
  rejected: "rejected",
  changes_requested: "sent back for changes",
};

const entityLabel: Record<string, string> = {
  event: "Event",
  tenant_content: "Chapter/council page",
};

export default function ApprovalsView() {
  const toast = useToast();
  const [pending, setPending] = useState<Approval[] | null>(null);
  const [noteRequestFor, setNoteRequestFor] = useState<{ id: string; decision: Decision } | null>(null);

  async function load() {
    const data = await api<Dashboard>("/api/admin/dashboard");
    setPending(data.pending);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load approvals"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function decide(id: string, decision: Decision, note: string) {
    try {
      await api(`/api/admin/approvals/${id}/decision`, { method: "POST", body: JSON.stringify({ decision, note }) });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record this decision");
      return;
    }
    toast.success(`Submission ${decisionLabel[decision]}.`);
    try {
      await load();
    } catch {
      toast.error("Recorded, but the queue could not refresh. Reload the page to see it.");
    }
  }

  function onDecide(id: string, decision: Decision) {
    if (decision === "approved") {
      void decide(id, decision, "");
      return;
    }
    setNoteRequestFor({ id, decision });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[var(--ipf-navy)]">Approvals</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--ipf-muted)]">Submissions from chapter and council admins awaiting your review.</p>
      </div>

      <Table>
        <TableCaption>Pending approvals</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Type</TableHeader>
            <TableHeader>Scope</TableHeader>
            <TableHeader>Submitted</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {pending === null ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Loading…
              </TableCell>
            </TableRow>
          ) : pending.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No submissions awaiting review.
              </TableCell>
            </TableRow>
          ) : (
            pending.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-semibold text-[var(--ipf-navy)]">
                  {entityLabel[item.entity_type] ?? item.entity_type}
                  <span className="block text-xs font-normal text-[var(--ipf-muted)]">{item.entity_id}</span>
                </TableCell>
                <TableCell>
                  <Badge tone="paper">
                    {item.scope_type}: {item.scope_id}
                  </Badge>
                </TableCell>
                <TableCell>{item.created_at.slice(0, 10)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuButton />
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => onDecide(item.id, "approved")}>Approve & publish</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onDecide(item.id, "changes_requested")}>Request changes</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onDecide(item.id, "rejected")}>Reject</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <PromptDialog
        open={noteRequestFor !== null}
        onOpenChange={(open) => {
          if (!open) setNoteRequestFor(null);
        }}
        title={noteRequestFor?.decision === "rejected" ? "Reject submission" : "Request changes"}
        description="This note is shared with the chapter/council admin who submitted it."
        label="Review note"
        submitLabel={noteRequestFor?.decision === "rejected" ? "Reject" : "Request changes"}
        required
        onSubmit={(note) => {
          if (noteRequestFor) void decide(noteRequestFor.id, noteRequestFor.decision, note);
        }}
      />
    </div>
  );
}
