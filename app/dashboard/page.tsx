// app/dashboard/page.tsx
//
// The composed dashboard: a thin render pass over the widget layer. It calls
// composeForWorkspace({ store, workspaceId, role }) (or the role-tuned default
// layout) and hands the resulting ResolvedWidget[] to DashboardView. The page
// is cartridge-blind — it never names a vertical; the workspace's configuration
// (its authored Dashboard widget_config, vocabulary, metrics) supplies all
// meaning. "A dashboard is not a custom page; it is a configured set of
// widgets" (WIDGET_SYSTEM_RULES §7).

import Link from "next/link";
import { store } from "@/core/data";
import { getCartridge } from "@/core/cartridge";
import { composeForWorkspace, composeDashboard } from "@/core/widgets";
import type { RoleKey } from "@/core/types";
import DashboardView from "@/components/widgets/DashboardView";
import { RecomputeMetricsButton } from "@/components/widgets/WidgetActions";

const ROLES: RoleKey[] = ["owner", "admin", "reviewer", "operator", "viewer"];

type SP = { ws?: string; role?: string; layout?: string };

function href(base: SP) {
  const p = new URLSearchParams();
  if (base.ws) p.set("ws", base.ws);
  if (base.role) p.set("role", base.role);
  if (base.layout) p.set("layout", base.layout);
  const q = p.toString();
  return `/dashboard${q ? `?${q}` : ""}`;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const workspaces = store.listWorkspaces();
  const wsId = sp.ws && store.getWorkspace(sp.ws) ? sp.ws : workspaces[0].id;
  const ws = store.getWorkspace(wsId)!;
  const c = getCartridge(ws.cartridge_key);

  const role: RoleKey = sp.role && (ROLES as string[]).includes(sp.role) ? (sp.role as RoleKey) : "owner";
  const useDefault = sp.layout === "default";

  const ctx = { store, workspaceId: wsId, packageKey: ws.cartridge_key, role };
  const result = useDefault ? composeDashboard(ctx, undefined) : composeForWorkspace(ctx);

  return (
    <div>
      <div className="eyebrow">{c?.label}</div>
      <h1>Dashboard</h1>

      {/* Workspace (cartridge) switcher — preserves role + layout. */}
      <div className="nav" style={{ marginBottom: 10 }}>
        {workspaces.map((w) => (
          <Link
            key={w.id}
            href={href({ ws: w.id, role, layout: sp.layout })}
            className={w.id === wsId ? "active" : ""}
          >
            {w.name}
          </Link>
        ))}
      </div>

      {/* View source: the cartridge-authored dashboard vs the role-tuned default. */}
      <div className="switchrow">
        <span className="switchrow__label">View</span>
        <Link href={href({ ws: wsId, role })} className={!useDefault ? "pill pill--on" : "pill"}>Configured</Link>
        <Link href={href({ ws: wsId, role, layout: "default" })} className={useDefault ? "pill pill--on" : "pill"}>Role default</Link>
      </div>

      {/* Role preview: same widgets composed differently per role (§8). Role
          gating + role-tuned default layouts both key off this. */}
      <div className="switchrow">
        <span className="switchrow__label">Role</span>
        {ROLES.map((r) => (
          <Link key={r} href={href({ ws: wsId, role: r, layout: sp.layout })} className={r === role ? "pill pill--on" : "pill"}>{r}</Link>
        ))}
      </div>

      <p className="banner">
        {useDefault
          ? `Role-tuned default layout for "${role}" — the same reusable widgets composed for this role (no authored dashboard).`
          : `Composed from ${result.dashboardName ? `the "${result.dashboardName}" dashboard's` : "the"} widget_config. Switch to "Role default" to see the role-tuned fallback.`}
      </p>

      <div className="switchrow" style={{ marginBottom: 14 }}>
        <RecomputeMetricsButton workspaceId={wsId} />
      </div>

      <DashboardView result={result} users={store.listUsers()} />
    </div>
  );
}
