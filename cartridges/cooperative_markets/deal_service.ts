// cartridges/cooperative_markets/deal_service.ts
//
// DealService (Sprint II Wave 3) — the cartridge's SERVICE CONTRACT over the deal
// pipeline. A surface calls THIS with one {@link RequestEnvelope} instead of
// importing `runDealPipeline` directly. It:
//   1. AUTHORIZES FIRST — running a deal is a tenant operating action, gated by
//      the kernel permission engine via the contract's "promote" verb (owner/
//      admin/operator); a denied principal gets a typed refusal, NOT a run;
//   2. seeds the pipeline's RunContext from the envelope so the whole run
//      CORRELATES to the originating request — `ctx.runId = env.correlation_id`,
//      `ctx.startedAt = env.occurred_at`, `ctx.actor = envelopeActor(env)` — and
//      every KernelEvent + CostEntry the pipeline emits carries that correlation
//      id back to the request that authorized it;
//   3. delegates to the UNCHANGED `runDealPipeline` — this wraps the engine, it
//      does not reimplement it. The human gates (ICApproval on the memo,
//      EditorialDisposition on publication) stay exactly where the pipeline puts
//      them; a contract authorizes WHO may run, never the regulated conclusion.
//
// This is where the request envelope + contract layer meets the harness: the
// envelope's correlation id + principal are now the spine a run hangs on.
//
// Pure/deterministic given (env, resource, input): no clock, no id minting here
// (the surface injects them into the envelope). Vertical lives in the cartridge,
// not core — it imports the GENERIC kernel contract, never the reverse.

import type { RequestEnvelope } from "@/core/kernel/envelope";
import { envelopeActor } from "@/core/kernel/envelope";
import type { PlaneAwareResource } from "@/core/kernel/permissions";
import type { ContractResult } from "@/core/kernel/contracts";
import { guard } from "@/core/kernel/contracts";
import { runDealPipeline } from "@/cartridges/cooperative_markets/pipeline";
import type { DealRunInput, DealRun, RunContext } from "@/cartridges/cooperative_markets/pipeline";

/** Optional pipeline knobs a caller may pass alongside the authorized request. */
export interface DealRunOptions {
  settlementMode?: RunContext["settlementMode"];
  feedRole?: string;
}

/**
 * Run the deal pipeline THROUGH the contract. Authorizes the envelope's principal
 * to "promote" (operate) on `resource` (the acting institution's tenant
 * workspace); on allow, runs the pipeline with a RunContext derived from the
 * envelope so the run correlates to the request; on deny, returns a typed
 * {@link Refusal} carrying the machine-readable reason and NEVER runs the
 * pipeline.
 */
export function runDealThroughContract(
  env: RequestEnvelope,
  resource: PlaneAwareResource,
  input: DealRunInput,
  opts?: DealRunOptions,
): ContractResult<DealRun> {
  const ctx: RunContext = {
    runId: env.correlation_id,
    startedAt: env.occurred_at,
    actor: envelopeActor(env),
    settlementMode: opts?.settlementMode,
    feedRole: opts?.feedRole,
  };
  return guard(env, "promote", resource, () => runDealPipeline(input, ctx));
}
