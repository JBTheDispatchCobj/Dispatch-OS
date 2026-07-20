// components/ProposalQueue.tsx
//
// The human-in-the-loop gate. Agents/rules draft proposals; nothing becomes
// real work until a human promotes it here. Approve+promote creates the
// WorkItem; reject discards.
import { decideProposalAction, promoteProposalAction } from "@/app/actions";
import { workflowLabel } from "@/core/cartridge";
import type { WorkItemProposal } from "@/core/types";

export default function ProposalQueue({ proposals }: { proposals: WorkItemProposal[] }) {
  if (proposals.length === 0) return <p className="muted">No agent proposals.</p>;
  return (
    <div className="list">
      {proposals.map((p) => (
        <div key={p.id} className="card">
          <div className="row">
            <span className="item__title">{p.proposed.title}</span>
            <span className={`chip chip--${p.status === "promoted" ? "done" : p.status === "pending" ? "in_review" : ""}`}>{p.status}</span>
          </div>
          <div className="item__sub">Would create: {workflowLabel(p.proposed.kind)} · {p.proposed.priority} priority</div>
          <p className="muted" style={{ fontSize: 13, margin: "8px 0 0" }}>Rationale: {p.rationale}</p>
          {p.status === "pending" && (
            <div className="btnrow" style={{ marginTop: 10 }}>
              <form action={promoteProposalAction} className="inlineform">
                <input type="hidden" name="id" value={p.id} />
                <button className="btn btn--primary" type="submit">Approve & promote</button>
              </form>
              <form action={decideProposalAction} className="inlineform">
                <input type="hidden" name="id" value={p.id} /><input type="hidden" name="decision" value="rejected" />
                <button className="btn btn--bad" type="submit">Reject</button>
              </form>
            </div>
          )}
          {p.status === "promoted" && <p className="event" style={{ marginTop: 8 }}>Promoted to a work item.</p>}
        </div>
      ))}
    </div>
  );
}
