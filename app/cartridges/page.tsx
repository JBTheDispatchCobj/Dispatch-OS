// app/cartridges/page.tsx
//
// Olympic Sprint IV — Wave 3. The "Cartridges" surface, PROMOTED from a scaffold to a
// REAL surface over the LIVE installed PackagedConfigurations. This SERVER component reads
// the installed configurations (config-as-data), maps each to a lite manifest summary
// (per-collection counts + the workspaces running it), shapes them with the pure
// `buildCartridgesView`, and renders the client `CartridgesView`. READS ONLY — it never
// installs, enables, or edits a configuration.
//
// Deterministic read: a fixed `as_of` stamp (no clock); a pure function of the installed
// registry + seeded workspaces, so the page prerenders statically.

import { store } from "@/core/data";
import { listConfigurations } from "@/core/cartridge";
import { buildCartridgesView } from "@/app/_surfaces/cartridges_view";
import type { CartridgeManifestLite } from "@/app/_surfaces/cartridges_view";
import { CartridgesView } from "@/components/terminal/CartridgesView";

export const metadata = {
  title: "Cartridges",
  description:
    "Installed capability cartridges — schemas, rules, prompts, workflows, metrics, reports, dashboards, knowledge. Cartridges extend capability through configuration, not vertical forks.",
};

const AS_OF = "2026-07-22T00:00:00.000Z";

export default function CartridgesPage() {
  // Which workspaces run each cartridge (config-as-data: one workspace per enabled cartridge).
  const workspacesByKey: Record<string, string[]> = {};
  for (const ws of store.listWorkspaces()) {
    (workspacesByKey[ws.cartridge_key] ??= []).push(ws.name);
  }

  const manifests: CartridgeManifestLite[] = listConfigurations().map((c) => ({
    key: c.key,
    label: c.label,
    description: c.description,
    version: c.version,
    status: c.status,
    counts: {
      entityTypes: c.entityTypes?.length ?? 0,
      workflows: c.workflows?.length ?? 0,
      rules: c.rules?.length ?? 0,
      metrics: c.metrics?.length ?? 0,
      reports: c.reports?.length ?? 0,
      checklistTemplates: c.checklistTemplates?.length ?? 0,
      dashboards: c.dashboards?.length ?? 0,
      knowledge: c.knowledge?.length ?? 0,
      sourceTypes: c.sourceTypes?.length ?? 0,
      agentInstructions: c.agentInstructions?.length ?? 0,
      approvalRules: c.approvalRules?.length ?? 0,
    },
    workspaceLabels: workspacesByKey[c.key] ?? [],
  }));

  const vm = buildCartridgesView({ manifests }, { as_of: AS_OF });
  return <CartridgesView vm={vm} />;
}
