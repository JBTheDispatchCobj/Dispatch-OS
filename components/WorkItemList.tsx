// components/WorkItemList.tsx — generic list of work items (any cartridge).
import Link from "next/link";
import type { WorkItem } from "@/core/types";
import { KindChip, StatusChip, workItemOwner } from "@/components/ui";

export default function WorkItemList({ items }: { items: WorkItem[] }) {
  if (items.length === 0) return <p className="muted">No work items in this workspace yet.</p>;
  return (
    <div className="list">
      {items.map((w) => (
        <Link key={w.id} href={`/work/${w.id}`} className="item">
          <div className="item__title">{w.title}</div>
          <div className="item__sub">Owner: {workItemOwner(w)}</div>
          <div className="item__meta">
            <StatusChip status={w.status} />
            {w.priority === "high" && <span className="chip chip--high">high</span>}
            <KindChip kind={w.kind} />
            {w.source === "agent" && <span className="chip chip--agent">from agent</span>}
          </div>
        </Link>
      ))}
    </div>
  );
}
