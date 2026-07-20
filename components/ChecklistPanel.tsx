// components/ChecklistPanel.tsx — generic checklist execution.
import { toggleChecklistAction } from "@/app/actions";
import type { ChecklistItem } from "@/core/types";

export default function ChecklistPanel({ items }: { items: ChecklistItem[] }) {
  if (items.length === 0) return <p className="muted">No checklist on this work item.</p>;
  return (
    <div>
      {items.map((c) => (
        <form key={c.id} action={toggleChecklistAction} className={`check${c.done ? " check--done" : ""}`}>
          <input type="hidden" name="itemId" value={c.id} />
          <input type="hidden" name="workItemId" value={c.work_item_id} />
          <input type="hidden" name="done" value={c.done ? "false" : "true"} />
          <button type="submit" className={`check__box${c.done ? " check__box--done" : ""}`} aria-pressed={c.done}>
            {c.done ? "✓" : ""}
          </button>
          <span>
            <span className="check__label">{c.title}</span>
            {c.detail && <span className="check__detail">{c.detail}</span>}
          </span>
        </form>
      ))}
    </div>
  );
}
