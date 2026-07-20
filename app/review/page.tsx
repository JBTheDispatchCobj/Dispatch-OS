// app/review/page.tsx — human review queue for work items awaiting sign-off.
import { store } from "@/core/data";
import { getCartridge } from "@/core/cartridge";
import WorkspaceTabs from "@/components/WorkspaceTabs";
import ReviewQueue from "@/components/ReviewQueue";

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ ws?: string }> }) {
  const sp = await searchParams;
  const workspaces = store.listWorkspaces();
  const wsId = sp.ws && store.getWorkspace(sp.ws) ? sp.ws : workspaces[0].id;
  const c = getCartridge(store.getWorkspace(wsId)!.cartridge_key);
  return (
    <div>
      <div className="eyebrow">{c?.label}</div>
      <h1>Review queue</h1>
      <WorkspaceTabs workspaces={workspaces} current={wsId} basePath="/review" />
      <ReviewQueue items={store.reviewQueue(wsId)} />
    </div>
  );
}
