// app/work/[id]/page.tsx — generic work item detail.
import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@/core/data";
import { getCartridge } from "@/core/cartridge";
import WorkItemDetail from "@/components/WorkItemDetail";

export default async function WorkItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = store.getWorkItem(id);
  if (!item) notFound();
  const c = getCartridge(store.getWorkspace(item.workspace_id)!.cartridge_key);
  return (
    <div>
      <Link href={`/work?ws=${item.workspace_id}`} className="muted" style={{ fontSize: 13 }}>← Work items</Link>
      <div style={{ height: 8 }} />
      <WorkItemDetail
        item={item}
        checklist={store.listChecklist(id)}
        notes={store.listNotes(id)}
        evidence={store.listEvidence(id)}
        events={store.listEvents(id)}
        cartridgeLabel={c?.label ?? ""}
      />
    </div>
  );
}
