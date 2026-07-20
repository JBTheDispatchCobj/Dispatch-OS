// app/page.tsx — home: the org and its cartridge workspaces.
import Link from "next/link";
import { store } from "@/core/data";
import { getCartridge } from "@/core/cartridge";
import { getActiveConfiguration } from "@/core/config";

export default function Home() {
  const org = store.getOrg();
  const workspaces = store.listWorkspaces();
  return (
    <div>
      <div className="eyebrow">{org.name}</div>
      <h1>Operating terminal</h1>
      <p className="banner">
        Dispatch OS core is industry-agnostic. Each workspace below runs a different <b>cartridge</b> on the
        same engine: inbound data → rules/agents interpret → proposals → human promotes → work executed →
        evidence logged → reports. Idea-state demo on an in-memory data layer (no backend).
      </p>
      <div className="grid2">
        {workspaces.map((w) => {
          const c = getCartridge(w.cartridge_key);
          const cfg = getActiveConfiguration(w.cartridge_key, w.id)?.configuration;
          const items = store.listWorkItems(w.id);
          const open = items.filter((i) => i.status !== "completed" && i.status !== "archived").length;
          const proposals = store.listProposals(w.id).filter((p) => p.status === "pending").length;
          const review = store.reviewQueue(w.id).length;
          return (
            <Link key={w.id} href={`/work?ws=${w.id}`} className="card" style={{ display: "block" }}>
              <div className="eyebrow">{w.cartridge_key}{cfg && ` · config v${cfg.version} · ${cfg.status}`}</div>
              <div className="item__title" style={{ fontSize: 17 }}>{c?.label ?? w.name}</div>
              <p className="muted" style={{ fontSize: 13 }}>{c?.description}</p>
              <div className="item__meta">
                <span className="chip chip--open">{open} open</span>
                {review > 0 && <span className="chip chip--in_review">{review} in review</span>}
                {proposals > 0 && <span className="chip chip--agent">{proposals} proposals</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
