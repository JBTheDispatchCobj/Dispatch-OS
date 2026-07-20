// components/WorkItemDetail.tsx
//
// The universal work-item view. Whatever the cartridge, it answers the six
// questions every work item must: What is this? Who owns it? What status?
// What evidence exists? What needs review? What happens next?
import { Fragment } from "react";
import type { ChecklistItem, EvidenceItem, Note, WorkItem, WorkItemEvent } from "@/core/types";
import { KindChip, StatusChip, fmtTime, workItemOwner } from "@/components/ui";
import StatusActions from "@/components/StatusActions";
import ChecklistPanel from "@/components/ChecklistPanel";
import NotesPanel from "@/components/NotesPanel";
import EvidencePanel from "@/components/EvidencePanel";

export default function WorkItemDetail(props: {
  item: WorkItem;
  checklist: ChecklistItem[];
  notes: Note[];
  evidence: EvidenceItem[];
  events: WorkItemEvent[];
  cartridgeLabel: string;
}) {
  const { item, checklist, notes, evidence, events, cartridgeLabel } = props;
  const ctx = Object.entries(item.context ?? {});
  return (
    <div>
      <div className="eyebrow">{cartridgeLabel}</div>
      <h1>{item.title}</h1>
      <div className="item__meta" style={{ marginBottom: 12 }}>
        <StatusChip status={item.status} />
        {item.priority === "high" && <span className="chip chip--high">high</span>}
        <KindChip kind={item.kind} />
        {item.source === "agent" && <span className="chip chip--agent">from agent</span>}
      </div>

      <div className="grid2">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>What happens next</h2>
          <StatusActions item={item} />
          <dl className="kv" style={{ marginTop: 12 }}>
            <dt>Owner</dt><dd>{workItemOwner(item)}</dd>
            <dt>Source</dt><dd>{item.source}</dd>
            <dt>Created</dt><dd>{fmtTime(item.created_at)}</dd>
          </dl>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Context</h2>
          {ctx.length === 0 ? <p className="muted">No cartridge context.</p> : (
            <dl className="kv">
              {ctx.map(([k, v]) => (<Fragment key={k}><dt>{k}</dt><dd>{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd></Fragment>))}
            </dl>
          )}
        </div>
      </div>

      <div className="card"><h2 style={{ marginTop: 0 }}>Checklist</h2><ChecklistPanel items={checklist} /></div>
      <div className="card"><h2 style={{ marginTop: 0 }}>Evidence</h2><EvidencePanel evidence={evidence} /></div>
      <div className="card"><h2 style={{ marginTop: 0 }}>Notes</h2><NotesPanel workItemId={item.id} notes={notes} /></div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Audit trail</h2>
        {events.map((e) => (
          <div key={e.id} className="event">
            <b>{e.type.replace("_", " ")}</b> · {e.actor.startsWith("agent") ? "agent" : e.actor.startsWith("user") ? "human" : "system"} · {fmtTime(e.created_at)}
          </div>
        ))}
      </div>
    </div>
  );
}
