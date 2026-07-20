// components/EvidencePanel.tsx — structured, typed proof. Reports build FROM this.
import type { EvidenceItem } from "@/core/types";
import { fmtTime } from "@/components/ui";

export default function EvidencePanel({ evidence }: { evidence: EvidenceItem[] }) {
  if (evidence.length === 0) return <p className="muted">No evidence captured yet.</p>;
  return (
    <div>
      {evidence.map((e) => (
        <div key={e.id} className="evidence">
          <div className="note__head">
            <span className="note__author">{e.label}</span>
            <span className="chip">{e.kind}</span>
            <span className="note__time">{e.captured_by.startsWith("agent") ? "agent" : "human"} · {fmtTime(e.created_at)}</span>
          </div>
          <div className="evidence__val">{JSON.stringify(e.value, null, 2)}</div>
        </div>
      ))}
    </div>
  );
}
