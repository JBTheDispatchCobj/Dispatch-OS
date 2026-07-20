// components/WorkspaceTabs.tsx — switch the active cartridge workspace.
import Link from "next/link";
import type { Workspace } from "@/core/types";

export default function WorkspaceTabs({ workspaces, current, basePath }: { workspaces: Workspace[]; current: string; basePath: string }) {
  return (
    <div className="nav" style={{ marginBottom: 14 }}>
      {workspaces.map((w) => (
        <Link key={w.id} href={`${basePath}?ws=${w.id}`} className={w.id === current ? "active" : ""}>{w.name}</Link>
      ))}
    </div>
  );
}
