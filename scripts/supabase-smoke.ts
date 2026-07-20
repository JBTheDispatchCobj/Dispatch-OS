// scripts/supabase-smoke.ts
//
// Live smoke test for the Supabase adapter. Requires SUPABASE_URL +
// SUPABASE_SERVICE_ROLE_KEY in the environment (NOT DISPATCH_DATA_BACKEND — we
// attach manually so the test is deterministic). Proves: first-run seed, an
// UPDATE persists, and an INSERT persists — by reading Postgres back directly.
//
//   set -a; source ./.env.local; set +a
//   npx tsx scripts/supabase-smoke.ts
//
// Safe to re-run: it only seeds once, then mutates idempotently.

import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { store } from "@/core/data";
import { attachSupabase } from "@/core/data/supabase-adapter";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function idToUuid(value: string): string {
  const h = createHash("sha1").update(`dispatch-os:${value}`).digest();
  const b = Buffer.from(h.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x50;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = b.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
const uuid = (s: string) => (UUID_RE.test(s) ? s : idToUuid(s));

let failures = 0;
function ok(cond: boolean, msg: string) {
  console.log(`  ${cond ? "ok  " : "FAIL"}   ${msg}`);
  if (!cond) failures++;
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
  const client = createClient(url, key, { auth: { persistSession: false } });

  console.log("=== Attaching adapter (seeds on first run) ===");
  await attachSupabase(store);

  // 1) Seed landed.
  const orgs = await client.from("organizations").select("id", { count: "exact", head: true });
  const wis = await client.from("work_items").select("id", { count: "exact", head: true });
  ok((orgs.count ?? 0) > 0, `organizations persisted (${orgs.count})`);
  ok((wis.count ?? 0) > 0, `work_items persisted (${wis.count})`);

  const ws = store.listWorkspaces();
  ok(ws.length > 0, `store serves ${ws.length} workspaces`);
  const items = ws.flatMap((w) => store.listWorkItems(w.id));
  ok(items.length > 0, `store serves ${items.length} work items`);

  // 2) UPDATE persists.
  const target = items[0];
  console.log(`=== Mutating work item ${target.id} ("${target.title}") ===`);
  store.setStatus(target.id, "completed", "user:smoke");
  let persistedStatus: string | undefined;
  for (let i = 0; i < 15; i++) {
    await sleep(400);
    const { data } = await client.from("work_items").select("status").eq("id", uuid(target.id)).maybeSingle();
    persistedStatus = (data as { status?: string } | null)?.status;
    if (persistedStatus === "completed") break;
  }
  ok(persistedStatus === "completed", `work item status update persisted (got "${persistedStatus}")`);

  // 3) INSERT persists.
  const note = store.addNote(target.id, "u_owner", "You (Owner)", `smoke ${Date.now()}`);
  let noteFound = false;
  for (let i = 0; i < 15; i++) {
    await sleep(400);
    const { data } = await client.from("notes").select("id").eq("id", uuid(note.id)).maybeSingle();
    if (data) { noteFound = true; break; }
  }
  ok(noteFound, "new note insert persisted");

  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
