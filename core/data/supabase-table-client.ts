// core/data/supabase-table-client.ts
//
// The REAL @supabase/supabase-js binding for the narrow table-client seam used by
// the Object Registry live-persistence adapter (core/registry/supabase-store.ts /
// governed_registry.ts) and the profile-persistence adapter
// (core/profile/persistence.ts). Both seams are the SAME two-call structural
// shape — `upsert(table, rows, onConflict)` + `selectAll(table)` — so one adapter
// satisfies both.
//
// WHY IT LIVES HERE, ALONE. Everything else in the Wave-4 registry/profile stack
// is dependency-free (it takes the narrow client seam so it stays importable under
// `node` native type-stripping and testable with a fake). This is the single
// module that imports the driver + reads env — mirroring core/data/supabase-adapter.ts
// ("graduation from idea state"). The debug loop + unit tests never import it; they
// drive the pure adapters with an in-memory fake client. So the gate stays green
// with no `@supabase/supabase-js` runtime + no credentials.
//
// SERVICE-ROLE. Registry writes on the shared-market plane are service-role
// writes (0016/0017); this reads SUPABASE_SERVICE_ROLE_KEY exactly like
// core/data/supabase-adapter.ts. A caller that has already constructed a client
// can adapt it directly with {@link makeTableClient}.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RegistryTableClient } from "@/core/registry/supabase-store";

/**
 * Adapt a live @supabase/supabase-js client to the narrow table-client seam.
 * The returned object satisfies both the registry and profile persistence seams
 * (identical structural shape).
 */
export function makeTableClient(client: SupabaseClient): RegistryTableClient {
  return {
    async upsert(table: string, rows: Record<string, unknown>[], onConflict: string) {
      const { error } = await client.from(table).upsert(rows, { onConflict });
      return { error };
    },
    async selectAll(table: string) {
      const { data, error } = await client.from(table).select("*");
      return { data: (data ?? null) as Record<string, unknown>[] | null, error };
    },
  };
}

/**
 * Build a table client from the environment (SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY). Returns null when either is absent, so a caller
 * transparently falls back to the in-memory default and the gate is green with no
 * creds — exactly the contract core/data/supabase-adapter.ts uses.
 */
export function registryTableClientFromEnv(): RegistryTableClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn(
      "[supabase-table-client] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing — registry/profile persistence stays in-memory.",
    );
    return null;
  }
  const client = createClient(url, key, { auth: { persistSession: false } });
  return makeTableClient(client);
}
