import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { surfacesBySection } from "@/core/registry/ui_surfaces";

export const metadata: Metadata = {
  title: "Dispatch OS",
  description: "A private operating terminal for businesses. Cartridge-based, human-in-the-loop.",
};

// The nav renders from the UI surface registry (config-as-data) so the WHOLE
// product surface area is reachable and visible from any page. `live` surfaces
// are implemented; `scaffold` surfaces are framed placeholders (dimmed + tagged
// with a °). Look/feel is deferred to the Terminal polish sprint — this is the
// map, not the final chrome.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const groups = surfacesBySection();
  return (
    <html lang="en">
      <body>
        <div className="topbar">
          <Link href="/" className="brand">
            Dispatch<span style={{ color: "var(--accent)" }}>OS</span>
            <small>operating terminal</small>
          </Link>
          <nav className="nav">
            {groups.map((g) => (
              <span key={g.section.id} className="navgroup">
                <span className="navgroup__label">{g.section.label}</span>
                {g.surfaces.map((s) => (
                  <Link
                    key={s.route}
                    href={s.route}
                    className={s.status === "scaffold" ? "scaffold" : undefined}
                    title={s.status === "scaffold" ? `${s.title} — scaffold (framed placeholder)` : s.title}
                  >
                    {s.title.split(" — ")[0].split(" · ")[0]}
                    {s.status === "scaffold" ? <span className="navdot" aria-hidden="true">°</span> : null}
                  </Link>
                ))}
              </span>
            ))}
          </nav>
        </div>
        <main className="shell">{children}</main>
      </body>
    </html>
  );
}
