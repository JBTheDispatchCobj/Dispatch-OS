// app/login/page.tsx — placeholder. Idea-state runs as a demo owner (see
// core/auth/session.ts). Real Supabase magic-link auth (ported from the
// Dispatch beta pattern) drops in here when the project gets a backend.
export default function Login() {
  return (
    <div className="card">
      <div className="eyebrow">Auth — stubbed</div>
      <h1>Demo mode</h1>
      <p className="muted">Idea-state Dispatch OS runs as a fixed demo owner so it is explorable with no backend. Supabase magic-link auth + per-workspace roles port in from the Dispatch beta when hosting begins.</p>
    </div>
  );
}
