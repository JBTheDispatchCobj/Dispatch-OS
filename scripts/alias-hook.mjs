// scripts/alias-hook.mjs
//
// A tiny Node ESM resolve hook so the repo's "@/*" path alias (tsconfig `paths`)
// resolves at RUNTIME too. Node's native TypeScript type-stripping runs .ts files
// directly, but it does NOT read tsconfig — so a bare `node scripts/pipeline-demo.ts`
// needs "@/core/..." mapped to the repo root. This maps "@/x" → "<repoRoot>/x" and
// fills in the extension (.ts/.tsx/.mjs/.js/.json, or /index.*). Everything else
// falls through to the default resolver. No transpile step, no build artifacts.
//
// Registered via `module.register("./alias-hook.mjs", import.meta.url)` from a
// script, immediately before it dynamically imports the aliased module graph.

import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Repo root = the parent of this file's directory (scripts/ → repo root).
const ROOT = new URL("../", import.meta.url);
const EXTS = [".ts", ".tsx", ".mjs", ".js", ".json"];

function resolveWithExt(baseUrl) {
  const p = fileURLToPath(baseUrl);
  if (existsSync(p) && statSync(p).isFile()) return baseUrl.href;
  for (const e of EXTS) if (existsSync(p + e)) return baseUrl.href + e;
  for (const e of EXTS) {
    const idx = p + "/index" + e;
    if (existsSync(idx)) return baseUrl.href + "/index" + e;
  }
  return null;
}

export function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const target = new URL(specifier.slice(2), ROOT);
    const url = resolveWithExt(target);
    if (url) return { url, shortCircuit: true };
  }
  return next(specifier, context);
}
