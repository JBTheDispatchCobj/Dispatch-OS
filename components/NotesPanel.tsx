// components/NotesPanel.tsx — free-text operator notes.
import { addNoteAction } from "@/app/actions";
import type { Note } from "@/core/types";
import { fmtTime } from "@/components/ui";

export default function NotesPanel({ workItemId, notes }: { workItemId: string; notes: Note[] }) {
  return (
    <div>
      {notes.length === 0 ? <p className="muted">No notes yet.</p> : notes.map((n) => (
        <div key={n.id} className="note">
          <div className="note__head">
            <span className="note__author">{n.author_name}</span>
            <span className="note__time">{fmtTime(n.created_at)}</span>
          </div>
          <div>{n.body}</div>
        </div>
      ))}
      <form action={addNoteAction} style={{ marginTop: 10 }}>
        <input type="hidden" name="workItemId" value={workItemId} />
        <textarea className="field" name="body" placeholder="Add a note…" />
        <div style={{ marginTop: 8 }}><button className="btn" type="submit">Add note</button></div>
      </form>
    </div>
  );
}
