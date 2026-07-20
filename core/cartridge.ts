// core/cartridge.ts
//
// The configuration loader. A "cartridge" is a PACKAGED CONFIGURATION
// (CONFIGURATION_RULES §4.4/§9): a reusable bundle of vocabulary, entity types,
// workflows, rules, checklists, evidence/approval rules, automation keys,
// metrics, reports, dashboards, agent instructions, and outcomes that the core
// INSTALLS into a workspace. The core never imports a package directly —
// packages register themselves here, and the engine reads them as data.
//
// `Cartridge` is retained as an alias of `PackagedConfiguration` so existing
// packages and call sites keep working while we move to config-as-data.

import type { PackagedConfiguration } from "@/core/config/types";

// Re-export the configuration component types from their canonical home so
// packages can import them from either module during the transition.
export type {
  PackagedConfiguration,
  WorkflowConfig,
  RuleConfig,
  GenerationRule,
  KnowledgeObject,
  Vocabulary,
  AutomationKey,
  MetricDefinition,
  EvidenceRequirement,
  ApprovalRule,
  DashboardConfig,
  AgentInstruction,
  OutcomeDefinition,
  AgentRoleKey,
} from "@/core/config/types";

/** A packaged configuration. @see PackagedConfiguration */
export type Cartridge = PackagedConfiguration;

// ---------------------------------------------------------------------------
// Registry — installed packaged configurations, keyed by package key.
// ---------------------------------------------------------------------------

const REGISTRY = new Map<string, PackagedConfiguration>();

/** Install a packaged configuration into the core. Idempotent. */
export function installConfiguration(c: PackagedConfiguration): void {
  if (REGISTRY.has(c.key)) return; // idempotent (HMR / repeated imports)
  REGISTRY.set(c.key, c);
}

/** @deprecated Renamed to {@link installConfiguration}. */
export const registerCartridge = installConfiguration;

export function getConfiguration(key: string): PackagedConfiguration | undefined {
  return REGISTRY.get(key);
}

export function listConfigurations(): PackagedConfiguration[] {
  return [...REGISTRY.values()];
}

// Back-compat aliases (call sites still say "cartridge").
export const getCartridge = getConfiguration;
export const listCartridges = listConfigurations;

/** Resolve a work-item `kind` to its configured label across all packages. */
export function workflowLabel(kind: string): string {
  for (const c of REGISTRY.values()) {
    const w = c.workflows.find((x) => x.kind === kind);
    if (w) return w.label;
  }
  return kind;
}
