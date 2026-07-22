"use client";
//
// components/terminal/TerminalShell.tsx — Olympic Sprint IV Wave 2.
//
// THE TERMINAL RUNTIME shell (Vol VII): a global COMMAND PALETTE mounted once in the
// root layout, driven entirely from the UI surface registry (config-as-data). ⌘K / Ctrl-K
// opens it from any page; it filters every product surface by title / section / declared
// command and NAVIGATES there, and hands a free-text query off to the universal `/search`
// surface. Registry-driven: a new surface appears in the palette with no code change.
//
// Look/feel is DEFERRED (Terminal polish sprint). It reuses the app design tokens so the
// runtime chrome reads as one product. It NEVER mutates, decides, or advances anything —
// it is pure navigation + a search hand-off (the human gates live on their own surfaces).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import type { PaletteSurface } from "@/app/_surfaces/universal_search";
import { filterPalette } from "@/app/_surfaces/universal_search";

export function TerminalShell({ surfaces }: { surfaces: PaletteSurface[] }): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => filterPalette(surfaces, q), [surfaces, q]);
  // A non-empty query offers a universal-search hand-off as the first option.
  const searchOption = q.trim().length > 0;
  const optionCount = filtered.length + (searchOption ? 1 : 0);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setActive(0);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  const select = useCallback(
    (index: number) => {
      if (searchOption && index === 0) {
        go(`/search?q=${encodeURIComponent(q.trim())}`);
        return;
      }
      const su = filtered[index - (searchOption ? 1 : 0)];
      if (su) go(su.route);
    },
    [filtered, searchOption, q, go],
  );

  // Global open shortcut (⌘K / Ctrl-K) + Escape to close.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus the input + reset selection when the palette opens.
  useEffect(() => {
    if (open) {
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  // Keep the active index in range as the filtered list changes.
  useEffect(() => {
    setActive((a) => (optionCount === 0 ? 0 : Math.min(a, optionCount - 1)));
  }, [optionCount]);

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (optionCount === 0 ? 0 : (a + 1) % optionCount));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (optionCount === 0 ? 0 : (a - 1 + optionCount) % optionCount));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(active);
    }
  }

  return (
    <>
      <button
        type="button"
        className="cmdk-trigger"
        aria-label="Open command palette (Command K)"
        onClick={() => setOpen(true)}
      >
        <span>Search &amp; commands</span>
        <kbd className="cmdk-kbd">⌘K</kbd>
      </button>

      {open && (
        <div className="cmdk-overlay" role="dialog" aria-modal="true" aria-label="Command palette" onClick={close}>
          <div className="cmdk-panel" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              className="cmdk-input"
              placeholder="Jump to a surface, or search the network…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKey}
            />
            <div className="cmdk-list">
              {searchOption && (
                <button
                  type="button"
                  className={`cmdk-row${active === 0 ? " cmdk-row--on" : ""}`}
                  onMouseEnter={() => setActive(0)}
                  onClick={() => select(0)}
                >
                  <span className="cmdk-row__title">Search the network for “{q.trim()}”</span>
                  <span className="cmdk-row__hint">universal search</span>
                </button>
              )}
              {filtered.map((su, i) => {
                const index = i + (searchOption ? 1 : 0);
                return (
                  <button
                    key={su.route}
                    type="button"
                    className={`cmdk-row${active === index ? " cmdk-row--on" : ""}`}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => select(index)}
                  >
                    <span className="cmdk-row__title">
                      {su.title.split(" — ")[0].split(" · ")[0]}
                      {su.status === "scaffold" ? <span className="navdot" aria-hidden="true"> °</span> : null}
                    </span>
                    <span className="cmdk-row__hint">
                      {su.section}
                      <span className="cmdk-row__route">{su.route}</span>
                    </span>
                  </button>
                );
              })}
              {optionCount === 0 && <div className="cmdk-empty">No surface matches “{q}”. Press Enter to search the network.</div>}
            </div>
            <div className="cmdk-foot">
              <span>↑↓ navigate · ↵ open · esc close</span>
              <span>registry-driven · {surfaces.length} surfaces</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
