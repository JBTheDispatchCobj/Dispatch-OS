import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dispatch OS",
  description: "A private operating terminal for businesses. Cartridge-based, human-in-the-loop.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="topbar">
          <Link href="/" className="brand">Dispatch<span style={{ color: "var(--accent)" }}>OS</span><small>operating terminal</small></Link>
          <nav className="nav">
            <Link href="/">Workspaces</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/terminal">Terminal</Link>
            <Link href="/work">Work</Link>
            <Link href="/proposals">Proposals</Link>
            <Link href="/review">Review</Link>
          </nav>
        </div>
        <main className="shell">{children}</main>
      </body>
    </html>
  );
}
