// app/_surfaces/cartridges_view.ts
//
// Olympic Sprint IV — Wave 3. The PURE view-model builder for the `/cartridges`
// surface (promoted from a scaffold to a REAL surface over the LIVE installed
// PackagedConfigurations).
//
// A cartridge extends capability through CONFIGURATION — schemas (entity types),
// rules, prompts, workflows, metrics, reports, dashboards, knowledge — not a vertical
// fork (DOCTRINE / CLAUDE.md non-negotiable). This surface is the installed-capability
// manifest: for each installed configuration it summarizes what it declares (counts of
// each config-as-data collection), which workspaces run it, and the doctrine states it
// renders distinctly:
//   * current    — installed and operating (status active);
//   * restricted — installed but NOT operating (a non-active status: draft / deprecated
//                  / disabled) — shown distinct, never presented as operating.
//
// This builder READS ONLY. It never installs, enables, edits, or transitions a
// configuration — cartridge lifecycle is a governed act elsewhere. It is a manifest
// projection.
//
// GENERIC (the core primitive is a "packaged configuration"; the vertical lives only
// in the DATA it summarizes) + PURE (no store, no registry, no clock — the manifests
// are INJECTED config-as-data; the page maps the live PackagedConfigurations to the
// lite shape). ERASABLE-ONLY TS so the debug loop + `node --test` import it directly.

export type CartridgeState = "current" | "restricted";

/** The per-collection capability counts a manifest summary carries. */
export interface CartridgeCounts {
  entityTypes: number;
  workflows: number;
  rules: number;
  metrics: number;
  reports: number;
  checklistTemplates: number;
  dashboards: number;
  knowledge: number;
  sourceTypes: number;
  agentInstructions: number;
  approvalRules: number;
}

/** One installed PackagedConfiguration reduced to what this manifest needs (injected). */
export interface CartridgeManifestLite {
  key: string;
  label: string;
  description: string;
  version: number;
  status: string;
  counts: CartridgeCounts;
  /** Labels of the workspaces running this cartridge (may be empty = available, unused). */
  workspaceLabels: string[];
}

export interface CartridgeRowVM {
  key: string;
  label: string;
  description: string;
  version: number;
  status: string;
  counts: CartridgeCounts;
  /** Sum of all declared capability items — the manifest's total surface area. */
  capabilityTotal: number;
  workspaceLabels: string[];
  installedCount: number;
  active: boolean;
  states: CartridgeState[];
}

export interface CartridgesVM {
  generatedAt: string;
  counts: {
    total: number;
    active: number;
    restricted: number;
    workflows: number;
    rules: number;
    reports: number;
  };
  rows: CartridgeRowVM[];
}

const COUNT_KEYS: (keyof CartridgeCounts)[] = [
  "entityTypes",
  "workflows",
  "rules",
  "metrics",
  "reports",
  "checklistTemplates",
  "dashboards",
  "knowledge",
  "sourceTypes",
  "agentInstructions",
  "approvalRules",
];

/** The doctrine states one cartridge row renders distinctly. */
export function cartridgeStates(status: string): CartridgeState[] {
  return status === "active" ? ["current"] : ["restricted"];
}

function capabilityTotal(counts: CartridgeCounts): number {
  return COUNT_KEYS.reduce((n, k) => n + (counts[k] ?? 0), 0);
}

export interface CartridgesInput {
  manifests: CartridgeManifestLite[];
}

/**
 * Build the `/cartridges` view-model from the LIVE installed configurations.
 * Deterministic: rows are ordered by descending capability surface area, then by key
 * (a total order). NEVER mutates the input; NEVER installs / enables / edits anything.
 */
export function buildCartridgesView(input: CartridgesInput, opts: { as_of: string }): CartridgesVM {
  const rows: CartridgeRowVM[] = input.manifests.map((m) => {
    const active = m.status === "active";
    return {
      key: m.key,
      label: m.label,
      description: m.description,
      version: m.version,
      status: m.status,
      counts: m.counts,
      capabilityTotal: capabilityTotal(m.counts),
      workspaceLabels: m.workspaceLabels,
      installedCount: m.workspaceLabels.length,
      active,
      states: cartridgeStates(m.status),
    };
  });

  rows.sort((a, b) => {
    if (a.capabilityTotal !== b.capabilityTotal) return b.capabilityTotal - a.capabilityTotal;
    return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
  });

  const counts = {
    total: rows.length,
    active: rows.filter((r) => r.active).length,
    restricted: rows.filter((r) => !r.active).length,
    workflows: rows.reduce((n, r) => n + r.counts.workflows, 0),
    rules: rows.reduce((n, r) => n + r.counts.rules, 0),
    reports: rows.reduce((n, r) => n + r.counts.reports, 0),
  };

  return { generatedAt: opts.as_of, counts, rows };
}
