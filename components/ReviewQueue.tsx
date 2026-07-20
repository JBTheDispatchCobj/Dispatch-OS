// components/ReviewQueue.tsx — human review of work items awaiting sign-off.
import Link from "next/link";
import { setStatusAction } from "@/app/actions";
import type { WorkItem } from "@/core/types";
import { KindChip } from "@/components/ui";

export default function ReviewQueue({ items }: { items: WorkItem[] }) {
  if (items.length === 0) return <p className="muted">Nothing awaiting review. Clean queue.</p>;
  return (
    <div className="list">
      {items.map((w) => (
        <div key={w.id} className="card">
          <div className="row">
            <Link href={`/work/${w.id}`} className="item__title">{w.title}</Link>
            <KindChip kind={w.kind} />
          </div>
          <div className="btnrow" style={{ marginTop: 10 }}>
            <form action={setStatusAction} className="inlineform">
              <input type="hidden" name="id" value={w.id} /><input type="hidden" name="status" value="completed" />
              <button className="btn btn--good" type="submit">Approve & complete</button>
            </form>
            <form action={setStatusAction} className="inlineform">
              <input type="hidden" name="id" value={w.id} /><input type="hidden" name="status" value="in_progress" />
              <button className="btn" type="submit">Send back</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
