// app/work/page.tsx — generic work list for the selected workspace.
import { store } from "@/core/data";
import { getCartridge } from "@/core/cartridge";
import WorkItemList from "@/components/WorkItemList";
import WorkspaceTabs from "@/components/WorkspaceTabs";

export default async function WorkPage({ searchParams }: { searchParams: Promise<{ ws?: string }> }) {
  const sp = await searchParams;
  const workspaces = store.listWorkspaces();
  const wsId = sp.ws && store.getWorkspace(sp.ws) ? sp.ws : workspaces[0].id;
  const c = getCartridge(store.getWorkspace(wsId)!.cartridge_key);
  const items = store.listWorkItems(wsId);
  return (
    <div>
      <div className="eyebrow">{c?.label}</div>
      <h1>Work items</h1>
      <WorkspaceTabs workspaces={workspaces} current={wsId} basePath="/work" />
      <WorkItemList items={items} />
    </div>
  );
}
