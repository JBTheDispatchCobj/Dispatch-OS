// cartridges/hospitality/cartridge.ts
//
// Cartridge 1 — Hospitality. This is the EXISTING Dispatch hotel product
// expressed as a cartridge. It is intentionally thin here: its job in this
// scaffold is to prove the core can carry a SECOND, very different cartridge
// alongside Wealth. The full hotel logic stays in the live Dispatch beta and
// is ported in later, never by genericizing the beta in place.

import { registerCartridge, type Cartridge } from "@/core/cartridge";
import { emptyBundle, type SeedBundle } from "@/core/data/store";

const K = "hospitality";

function seed(ws: string): SeedBundle {
  const b = emptyBundle();
  const id = (s: string) => `${ws}__${s}`;
  const ts = "2026-06-04T12:00:00.000Z";
  b.entities.push({
    id: id("room29"), workspace_id: ws, entity_type_key: "hospitality:room",
    title: "Room 29 — Queen", created_at: ts, context: { room_type: "Queen" },
  });
  b.workItems.push({
    id: id("wi_turn29"), workspace_id: ws, kind: "hospitality:housekeeping_turn",
    title: "Room 29 — Tim Moore (departure turn)", status: "open", priority: "medium",
    source: "inbound", entity_id: id("room29"), assignee_id: id("u_angie"),
    assignee_name: "Angie", context: { bucket: "departures", clean_type: "Standard" },
    created_at: ts, started_at: null, completed_at: null,
  });
  ["Open / strip", "Bed", "Clean", "Restock", "Close out"].forEach((t, i) =>
    b.checklistItems.push({ id: id(`hci_${i}`), work_item_id: id("wi_turn29"), title: t, sort_order: i + 1, done: false, done_at: null }),
  );
  // New primitives (proving the wiring is generic, not wealth-specific):
  b.sources.push({
    id: id("src_pms"), workspace_id: ws, name: "Reservation feed", source_type: "pms",
    status: "active", connector_type: "manual_upload", reliability_score: 0.85, created_at: ts,
  });
  b.outcomes.push({
    id: id("out_ready"), workspace_id: ws, outcome_type: "operational",
    name: "Reduce time to room-ready", status: "active", value_category: "throughput",
    target_value: 100, actual_value: 0, created_at: ts,
  });
  b.dashboards.push({
    id: id("dash_ops"), workspace_id: ws, name: "Daily Ops", status: "active", dashboard_type: "operational",
    widget_config: [
      { type: "metric", label: "Turn completion", metric_name: "work_completion_rate" },
      { type: "metric", label: "Checklist completion", metric_name: "checklist_completion_rate" },
    ],
    created_at: ts,
  });
  return b;
}

const cartridge: Cartridge = {
  key: K,
  label: "Hospitality (Hotel Ops)",
  description: "Boutique-hotel housekeeping & front-desk operations. Mirrors the live Dispatch beta; full logic ported here later.",
  version: 1,
  status: "active",
  vocabulary: {
    terms: { entity: "Room / Reservation", work_item: "Turn", evidence: "Completion Proof", input: "Reservation Batch" },
    statusLabels: { in_progress: "In service", completed: "Cleaned" },
  },
  inputTypes: [
    { key: "reservation_batch", label: "Reservation batch", parsing_method: "csv", converts_to: ["hospitality:housekeeping_turn"], review_required: true },
  ],
  entityTypes: [
    { key: "hospitality:property", cartridge_key: K, label: "Property" },
    { key: "hospitality:room", cartridge_key: K, label: "Room", context_hint: "room_type" },
    { key: "hospitality:reservation", cartridge_key: K, label: "Reservation", context_hint: "guest, arrival, departure" },
    { key: "hospitality:guest", cartridge_key: K, label: "Guest" },
  ],
  workflows: [
    { kind: "hospitality:housekeeping_turn", label: "Housekeeping Turn", description: "Departure room turnover." },
    { kind: "hospitality:arrival", label: "Arrival Prep", description: "Prepare an arriving room." },
    { kind: "hospitality:stayover", label: "Stayover Service", description: "Service an occupied room." },
    { kind: "hospitality:maintenance", label: "Maintenance", description: "Resolve a maintenance issue." },
    { kind: "hospitality:eod", label: "End of Day", description: "Wrap shift." },
  ],
  checklistTemplates: [],
  rules: [
    { key: "hospitality:rollover", label: "Rollover", when: "room blocked / rolled over by ops", produces: "remove turn from staff list", severity: "info" },
    { key: "hospitality:deep_clean_due", label: "Deep clean due", when: "room deep-clean item past 30-day cycle", produces: "deep clean flag on departure card", severity: "warn" },
  ],
  knowledge: [
    { key: "hospitality:bucket_arc", title: "Time-arc buckets", body: "# Buckets\n\nSOD -> Departures -> Stayovers -> Arrivals -> Dailys -> EOD." },
  ],
  reports: [
    { key: "hospitality:daily_ops", cartridge_key: K, label: "Daily Ops", description: "Room readiness + staff completion." },
  ],
  automationKeys: [
    { key: "hospitality:on_reservation_batch", label: "Reservation batch received", trigger: "new_input", condition: "input_type = reservation_batch", action: "propose housekeeping_turn per departure", allowed_agent: "intake", approval_required: true, risk_level: "low" },
  ],
  metrics: [
    { key: "hospitality:turn_completion_rate", label: "Turn completion rate", metric_type: "execution", calculation_method: "completed turns / scheduled turns by EOD", target: 100 },
  ],
  outcomes: [
    { key: "hospitality:reduce_time_to_ready", label: "Reduce time to room-ready", outcome_type: "operational", value_category: "throughput", related_workflow_kinds: ["hospitality:housekeeping_turn", "hospitality:arrival"], related_metric_keys: ["hospitality:turn_completion_rate"] },
  ],
  seed,
};

registerCartridge(cartridge);
export default cartridge;
