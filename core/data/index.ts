// core/data/index.ts
//
// Builds the in-memory database from registered cartridge seed data and
// exposes a singleton DataStore. Swap InMemoryStore for a Supabase-backed
// store here (one line) when the project graduates from idea state.

import "@/cartridges"; // side-effect: register cartridges before we read them
import { listCartridges } from "@/core/cartridge";
import { getActiveConfiguration } from "@/core/config";
import { InMemoryStore, type Db, type DataStore } from "@/core/data/store";
import type { Configuration, Organization, UserProfile, Workspace } from "@/core/types";

function buildDb(): Db {
  const ts = "2026-06-01T00:00:00.000Z";
  const cartridges = listCartridges();

  const org: Organization = {
    id: "org_demo", name: "Demo Operator Co", created_at: ts,
    enabled_cartridges: cartridges.map((c) => c.key),
  };

  const users: UserProfile[] = [
    { id: "u_owner", org_id: org.id, display_name: "You (Owner)", email: "owner@demo.test", created_at: ts },
    { id: "u_angie", org_id: org.id, display_name: "Angie", email: "angie@demo.test", created_at: ts },
  ];

  const db: Db = {
    orgs: [org], workspaces: [], users, entities: [], workItems: [], events: [],
    activity: [],
    checklistItems: [], notes: [], evidence: [], documents: [], inboundEvents: [],
    agentRuns: [], agentActions: [], proposals: [],
    sources: [], configurations: [], contextObjects: [], decisions: [], approvals: [],
    metrics: [], dashboards: [], outcomes: [], reports: [],
  };

  // One workspace per enabled cartridge, seeded from that cartridge's fixtures.
  for (const c of cartridges) {
    const ws: Workspace = {
      id: `ws_${c.key}`, org_id: org.id, name: `${c.label} — Demo`,
      cartridge_key: c.key, created_at: ts,
    };
    db.workspaces.push(ws);

    // Wire the Configuration primitive (§3.5): the governed, versioned envelope
    // describing which packaged configuration this workspace runs.
    const resolved = getActiveConfiguration(c.key, ws.id);
    if (resolved) db.configurations.push(resolved.configuration as Configuration);

    if (!c.seed) continue;
    const bundle = c.seed(ws.id);
    db.entities.push(...bundle.entities);
    db.workItems.push(...bundle.workItems);
    db.checklistItems.push(...bundle.checklistItems);
    db.notes.push(...bundle.notes);
    db.evidence.push(...bundle.evidence);
    db.documents.push(...bundle.documents);
    db.inboundEvents.push(...bundle.inboundEvents);
    db.agentRuns.push(...bundle.agentRuns);
    db.agentActions.push(...bundle.agentActions);
    db.proposals.push(...bundle.proposals);
    // New primitives (additive; cartridges that omit them contribute []).
    db.sources.push(...bundle.sources);
    db.contextObjects.push(...bundle.contextObjects);
    db.decisions.push(...bundle.decisions);
    db.approvals.push(...bundle.approvals);
    db.metrics.push(...bundle.metrics);
    db.dashboards.push(...bundle.dashboards);
    db.outcomes.push(...bundle.outcomes);
    db.reports.push(...bundle.reports);
  }

  // Synthesize "created" events for every seeded work item so the audit trail
  // isn't empty on first load.
  for (const w of db.workItems) {
    db.events.push({
      id: `evt_seed_${w.id}`, work_item_id: w.id, type: "created",
      actor: w.source === "agent" ? "agent:seed" : "user:u_owner",
      detail: { kind: w.kind }, schema_version: 1, created_at: w.created_at,
    });
  }

  return db;
}

// Module-level singleton: one in-memory DB per server process. Good enough for
// idea-state demo (mutations persist until restart).
const globalForStore = globalThis as unknown as { __dispatchOsStore?: DataStore };

function buildInMemoryStore(): DataStore {
  const s = new InMemoryStore(buildDb());
  // Compute metrics from the seeded activity so dashboards are grounded in real
  // data on first load (ROI_AND_IMPACT_MODEL §12: never vanity numbers).
  for (const ws of s.listWorkspaces()) {
    s.recomputeMetrics(ws.id);
    // Derive each metric-linked outcome's actual_value from its live metric so
    // the value end of the loop is grounded on first load (ROI §8/§9).
    s.recomputeOutcomes(ws.id);
  }
  return s;
}

// Backend selection (one place). `store` is ALWAYS a synchronous in-memory
// store (zero-cost; this is also exactly what both headless demos run on).
// When DISPATCH_DATA_BACKEND=supabase (with SUPABASE_URL +
// SUPABASE_SERVICE_ROLE_KEY), the Supabase adapter attaches asynchronously:
// it seeds Postgres on first run or hydrates the store from Postgres on later
// runs, then enables write-through persistence — all behind the SAME DataStore
// interface, so the UI never changes. If the connection fails it stays
// in-memory. The dynamic import keeps the Supabase client out of the demo path.
function buildStore(): DataStore {
  const s = buildInMemoryStore();
  if (process.env.DISPATCH_DATA_BACKEND === "supabase") {
    import("@/core/data/supabase-adapter")
      .then(({ attachSupabase }) => attachSupabase(s))
      .catch((e) => console.error("[supabase-adapter] attach import failed:", e));
  }
  return s;
}

export const store: DataStore =
  globalForStore.__dispatchOsStore ?? (globalForStore.__dispatchOsStore = buildStore());
