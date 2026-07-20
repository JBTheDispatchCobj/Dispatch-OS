// app/proposals/page.tsx — agent proposal queue (human-in-the-loop gate).
import { store } from "@/core/data";
import { getCartridge } from "@/core/cartridge";
import WorkspaceTabs from "@/components/WorkspaceTabs";
import ProposalQueue from "@/components/ProposalQueue";

export default async function ProposalsPage({ searchParams }: { searchParams: Promise<{ ws?: string }> }) {
  const sp = await searchParams;
  const workspaces = store.listWorkspaces();
  const wsId = sp.ws && store.getWorkspace(sp.ws) ? sp.ws : workspaces[0].id;
  const c = getCartridge(store.getWorkspace(wsId)!.cartridge_key);
  return (
    <div>
      <div className="eyebrow">{c?.label}</div>
      <h1>Agent proposals</h1>
      <p className="banner">Agents propose; you dispose. Promoting a proposal is the only way agent output becomes real work — and it is logged as a human action.</p>
      <WorkspaceTabs workspaces={workspaces} current={wsId} basePath="/proposals" />
      <ProposalQueue proposals={store.listProposals(wsId)} />
    </div>
  );
}
