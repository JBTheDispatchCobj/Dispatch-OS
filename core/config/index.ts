// core/config/index.ts
//
// The configuration loader the engine reads. Packaged configurations register
// themselves via core/cartridge; this module resolves the ACTIVE configuration
// for a workspace, wraps it in a governed/versioned Configuration envelope
// (CORE_OBJECT_MODEL §3.5), and exposes read helpers (vocabulary, workflows,
// automation keys). Core logic depends on these primitives — never on a
// specific package.

import { getConfiguration, listConfigurations } from "@/core/cartridge";
import type { Configuration } from "@/core/types";
import type { PackagedConfiguration } from "@/core/config/types";

export type { PackagedConfiguration } from "@/core/config/types";

/** A package plus the governed Configuration record describing its install. */
export interface ResolvedConfiguration {
  configuration: Configuration;
  package: PackagedConfiguration;
}

/** Build the versioned Configuration envelope for an installed package. */
function envelope(pkg: PackagedConfiguration, workspaceId: string | null): Configuration {
  return {
    id: `cfg_${pkg.key}_v${pkg.version}`,
    workspace_id: workspaceId,
    name: pkg.label,
    version: pkg.version,
    status: pkg.status,
    description: pkg.description,
    package_key: pkg.key,
    created_at: new Date(0).toISOString(),
  };
}

/**
 * Resolve a workspace's active configuration by its package key (the
 * workspace `cartridge_key`). Returns undefined if no such package is installed.
 */
export function getActiveConfiguration(
  packageKey: string,
  workspaceId: string | null = null,
): ResolvedConfiguration | undefined {
  const pkg = getConfiguration(packageKey);
  if (!pkg) return undefined;
  return { configuration: envelope(pkg, workspaceId), package: pkg };
}

/** All installed packaged configurations as governed Configuration records. */
export function listConfigurationRecords(): Configuration[] {
  return listConfigurations().map((p) => envelope(p, null));
}

// --- Read helpers (config-as-data lookups) ---------------------------------

/** Resolve a business term for a core primitive, falling back to the primitive. */
export function vocabularyTerm(packageKey: string, primitive: string): string {
  return getConfiguration(packageKey)?.vocabulary?.terms[primitive] ?? primitive;
}

/** Resolve a configured status label, falling back to the raw status. */
export function statusLabel(packageKey: string, status: string): string {
  return getConfiguration(packageKey)?.vocabulary?.statusLabels?.[status] ?? status;
}

/** Automation keys configured for a package (the loop's configured triggers). */
export function automationKeysFor(packageKey: string) {
  return getConfiguration(packageKey)?.automationKeys ?? [];
}

/** Metric definitions configured for a package. */
export function metricsFor(packageKey: string) {
  return getConfiguration(packageKey)?.metrics ?? [];
}
