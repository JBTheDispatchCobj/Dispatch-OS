// components/StatusActions.tsx — answers "what happens next?" for a work item.
// Renders the status transitions valid from the current state. Every button is
// a server-action form post (no client JS needed).
import { setStatusAction } from "@/app/actions";
import type { WorkItem, WorkItemStatus } from "@/core/types";

const NEXT: Record<string, { to: WorkItemStatus; label: string; cls?: string }[]> = {
  proposed: [{ to: "open", label: "Accept into work", cls: "btn--primary" }],
  open: [
    { to: "in_progress", label: "Start", cls: "btn--primary" },
    { to: "assigned", label: "Assign" },
  ],
  assigned: [{ to: "in_progress", label: "Start", cls: "btn--primary" }],
  in_progress: [
    { to: "awaiting_review", label: "Send to review" },
    { to: "completed", label: "Complete", cls: "btn--good" },
    { to: "blocked", label: "Block" },
  ],
  blocked: [{ to: "in_progress", label: "Unblock" }],
  awaiting_review: [
    { to: "awaiting_approval", label: "Send for approval" },
    { to: "completed", label: "Approve & complete", cls: "btn--good" },
    { to: "in_progress", label: "Send back" },
  ],
  awaiting_approval: [
    { to: "completed", label: "Approve & complete", cls: "btn--good" },
    { to: "in_progress", label: "Send back" },
  ],
  completed: [{ to: "reopened", label: "Reopen" }],
  reopened: [{ to: "in_progress", label: "Resume", cls: "btn--primary" }],
  rejected: [],
  canceled: [],
  archived: [],
};

export default function StatusActions({ item }: { item: WorkItem }) {
  const opts = NEXT[item.status] ?? [];
  if (opts.length === 0) return <p className="muted">No further actions — {item.status}.</p>;
  return (
    <div className="btnrow">
      {opts.map((o) => (
        <form key={o.to} action={setStatusAction} className="inlineform">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="status" value={o.to} />
          <button className={`btn ${o.cls ?? ""}`} type="submit">{o.label}</button>
        </form>
      ))}
    </div>
  );
}
