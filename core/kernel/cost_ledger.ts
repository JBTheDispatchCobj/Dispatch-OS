// core/kernel/cost_ledger.ts
//
// Dispatch OS — Kernel Volume II, RFC-2008 Cost / Usage Ledger.
//
// An append-only, in-memory record of what the OS SPENDS: model tokens, human
// review time, tool/connector calls, storage. Every entry is correlated (so a
// run's total cost is a query, not a guess) and attributable to an actor. Pure
// aggregation — the ledger has no side effects beyond its own array and calls
// neither Date.now() nor Math.random(); timestamps and ids are supplied by the
// caller so totals are deterministic given the same inputs.
//
// This is the observability counterpart to the AgentRun.cost_estimate field in
// core/types.ts: AgentRun records a single run's estimate, the ledger is the
// cross-cutting spend spine that rolls those up by category and correlation.
//
// Actor convention mirrors core: "user:<id>" | "agent:<run_id>" | "system".

// ---------------------------------------------------------------------------
// Categories + the entry shape
// ---------------------------------------------------------------------------

/**
 * What KIND of spend an entry represents.
 *   model     — LLM / inference token usage.
 *   human     — human review / operator time costed in dollars.
 *   tool      — an internal tool / compute invocation.
 *   storage   — bytes retained.
 *   connector — an external connector / API call.
 */
export type CostCategory =
  | "model"
  | "human"
  | "tool"
  | "storage"
  | "connector";

/**
 * A single costed event. Only `id`, `correlation_id`, `category`, `usd`, and
 * `occurred_at` are required; the measurement fields are optional and specific
 * to the category (tokens for model, units for tool/storage/connector).
 *
 *   usd         — the dollar cost of this entry. Authoritative; measurement
 *                 fields are context, `usd` is what totals sum.
 *   tokens_in / tokens_out — model token counts, when category = "model".
 *   units       — generic count (tool calls, stored MB, connector requests…).
 *   occurred_at — caller-supplied ISO-8601 timestamp.
 */
export interface CostEntry {
  id: string;
  correlation_id: string;
  category: CostCategory;
  label?: string;
  model?: string;
  tokens_in?: number;
  tokens_out?: number;
  units?: number;
  usd: number;
  actor?: string;
  occurred_at: string;
}

/** Optional filter for {@link CostLedger} queries. All clauses are ANDed. */
export interface CostFilter {
  category?: CostCategory;
  correlation_id?: string;
  actor?: string;
  model?: string;
}

/** The result of rolling up a single correlation id. */
export interface CorrelationTotal {
  usd: number;
  entries: CostEntry[];
}

// ---------------------------------------------------------------------------
// The ledger
// ---------------------------------------------------------------------------

/**
 * In-memory, append-only cost ledger. Pure aggregation: `record` appends,
 * every read is a fresh derivation over the stored entries. No wall-clock, no
 * randomness — the same recorded entries always yield the same totals.
 */
export class CostLedger {
  private readonly ledger: CostEntry[] = [];

  /** Append a costed event to the ledger. */
  record(entry: CostEntry): void {
    this.ledger.push(entry);
  }

  /**
   * The recorded entries, optionally filtered. Returns a shallow copy so
   * callers cannot mutate internal state. All filter clauses are ANDed.
   */
  entries(filter?: CostFilter): CostEntry[] {
    if (!filter) return this.ledger.slice();
    return this.ledger.filter((e) => this.matches(e, filter));
  }

  /** Sum of `usd` across entries (optionally filtered). */
  totalUsd(filter?: CostFilter): number {
    let sum = 0;
    for (const e of this.ledger) {
      if (!filter || this.matches(e, filter)) sum += e.usd;
    }
    return sum;
  }

  /**
   * Total `usd` per category. Every category key is present (0 when unused) so
   * consumers can index without a presence check.
   */
  byCategory(): Record<CostCategory, number> {
    const totals: Record<CostCategory, number> = {
      model: 0,
      human: 0,
      tool: 0,
      storage: 0,
      connector: 0,
    };
    for (const e of this.ledger) {
      totals[e.category] += e.usd;
    }
    return totals;
  }

  /** Roll up a single correlation id into its total and its entries. */
  byCorrelation(id: string): CorrelationTotal {
    const entries: CostEntry[] = [];
    let usd = 0;
    for (const e of this.ledger) {
      if (e.correlation_id === id) {
        entries.push(e);
        usd += e.usd;
      }
    }
    return { usd, entries };
  }

  private matches(e: CostEntry, filter: CostFilter): boolean {
    if (filter.category !== undefined && e.category !== filter.category) {
      return false;
    }
    if (
      filter.correlation_id !== undefined &&
      e.correlation_id !== filter.correlation_id
    ) {
      return false;
    }
    if (filter.actor !== undefined && e.actor !== filter.actor) return false;
    if (filter.model !== undefined && e.model !== filter.model) return false;
    return true;
  }
}
