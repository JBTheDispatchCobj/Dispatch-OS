// components/ui.tsx — tiny shared presentational helpers.
import { workflowLabel } from "@/core/cartridge";
import type { WorkItem } from "@/core/types";

export function StatusChip({ status }: { status: string }) {
  return <span className={`chip chip--${status}`}>{status.replace("_", " ")}</span>;
}

export function KindChip({ kind }: { kind: string }) {
  return <span className="chip chip--kind">{workflowLabel(kind)}</span>;
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function workItemOwner(w: WorkItem): string {
  return w.assignee_name ?? "Unassigned";
}
