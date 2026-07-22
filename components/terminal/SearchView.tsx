"use client";
//
// components/terminal/SearchView.tsx — Olympic Sprint IV Wave 2.
//
// The `/search` universal-search surface, PROMOTED from a scaffold to a REAL surface
// over the live objects. It searches ONE index built server-side from the live
// collections — the `/institutions` directory rows, the UI surface registry, and the
// external-canon alias registry — and ranks results with the pure `searchUniverse`
// matcher (deterministic total order). It initializes its query from `?q=` (the command
// palette's hand-off) client-side, so the page stays statically prerenderable.
//
// DOCTRINE STATES kept visibly distinct: current (a live object) · synthetic (an
// institution whose figures are labeled synthetic — never presentable as real) ·
// restricted (a scaffold surface / a proposed, unconfirmed canon alias — not
// authoritative) · missing (an empty result, shown honestly, never a fabricated hit).
// Search NAVIGATES; it never mutates or decides.

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import Link from "next/link";
import { searchUniverse } from "@/app/_surfaces/universal_search";
import type { SearchIndex, SearchItem, SearchState, SearchKind } from "@/app/_surfaces/universal_search";

const STATE_COLOR: Record<SearchState, string> = {
  current: "var(--good)",
  synthetic: "var(--review)",
  restricted: "var(--bad)",
  missing: "var(--muted)",
};

const KIND_LABEL: Record<SearchKind, string> = {
  surface: "Surfaces",
  institution: "Institutions",
  canon: "Canon aliases",
};

export function SearchView({ index }: { index: SearchIndex }): React.JSX.Element {
  const [q, setQ] = useState("");

  // Initialize from ?q= client-side (no useSearchParams → the page stays static).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");
    if (initial) setQ(initial);
  }, []);

  const result = useMemo(() => searchUniverse(index, q, { limit: 25 }), [index, q]);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div className="eyebrow">Network · Search &amp; Discovery · universal search</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Search</h1>
        <span className="chip" style={{ color: "var(--muted)", marginLeft: "auto" }}>
          {index.counts.total} objects indexed
        </span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0, maxWidth: 860 }}>
        Universal search over the live objects — the institution directory, every product surface, and the
        external-canon aliases. Selecting a result navigates; nothing here mutates or decides. Institution figures are
        labeled <span style={{ color: "var(--review)" }}>synthetic</span> (never presentable as real); a scaffold
        surface or a proposed alias is <span style={{ color: "var(--bad)" }}>restricted</span> (not authoritative).
      </p>

      <input
        className="field"
        style={{ marginBottom: 12 }}
        placeholder="Search institutions, surfaces, canon aliases…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />

      <div className="tiles" style={{ marginBottom: 12 }}>
        <Tile value={index.counts.institution} label="institutions" />
        <Tile value={index.counts.surface} label="surfaces" />
        <Tile value={index.counts.canon} label="canon aliases" />
        <Tile value={result.total} label={q.trim() ? "matches" : "all objects"} color={result.total > 0 ? "var(--accent)" : undefined} />
      </div>

      {result.missing && (
        <div className="banner">
          <span className="chip" style={{ color: "var(--muted)", borderColor: "var(--muted)" }}>missing</span>{" "}
          No object matches “{q.trim()}”. The empty result is shown honestly — never a fabricated hit.
        </div>
      )}

      {result.groups.map((g) => (
        <section key={g.kind} className="card">
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            {KIND_LABEL[g.kind]} · {g.items.length}
          </div>
          <div className="list">
            {g.items.map((it) => (
              <ResultRow key={it.id} item={it} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ResultRow({ item }: { item: SearchItem }): React.JSX.Element {
  const color = STATE_COLOR[item.state];
  return (
    <Link href={item.href} className="wrow" style={{ textDecoration: "none" }}>
      <div className="wrow__main">
        <span className="wrow__title" style={{ fontSize: 14 }}>
          {item.title}
        </span>
        <span className="muted" style={{ fontSize: 12, display: "block", marginTop: 2 }}>
          {item.subtitle}
        </span>
      </div>
      <div className="wrow__side">
        <span className="chip" style={{ color, borderColor: color }}>
          {item.state}
        </span>
        <span className="muted" style={{ fontSize: 11, fontFamily: "var(--mono)" }}>{item.href}</span>
      </div>
    </Link>
  );
}

function Tile({ value, label, color }: { value: number; label: string; color?: string }): React.JSX.Element {
  return (
    <div className="tile">
      <div className="tile__value" style={{ fontSize: 20, ...(color ? { color } : {}) }}>{value}</div>
      <div className="tile__label">{label}</div>
    </div>
  );
}
