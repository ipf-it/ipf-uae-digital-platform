import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PromptDialog } from "../../components/ui/PromptDialog";
import { useToast } from "../../components/ui/Toast";

type Approval = { id: string; entity_type: string; entity_id: string; status: string; scope_type: string; scope_id: string; created_at: string };
type Dashboard = { pending: Approval[] };
type Decision = "approved" | "rejected" | "changes_requested";

const decisionLabel: Record<Decision, string> = {
  approved: "approved",
  rejected: "rejected",
  changes_requested: "sent back for changes",
};

export default function ApprovalsTab() {
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
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Governance</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Approval queue</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">Submissions from chapter and council admins awaiting your review.</p>
      </div>

      <div className="space-y-3">
        {pending === null ? (
          <Card title="Loading submissions…" />
        ) : pending.length ? (
          pending.map((item) => (
            <Card key={item.id} title={`${item.entity_type}: ${item.entity_id}`} description={`${item.scope_type}: ${item.scope_id}`}>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => onDecide(item.id, "approved")}>Approve & publish</Button>
                <Button variant="outline" onClick={() => onDecide(item.id, "changes_requested")}>
                  Request changes
                </Button>
                <Button variant="outline" onClick={() => onDecide(item.id, "rejected")}>
                  Reject
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card title="No submissions awaiting review" />
        )}
      </div>

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
