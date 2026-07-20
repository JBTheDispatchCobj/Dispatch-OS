# Dispatch Constitution + Specification Program

This folder holds the top of the specification hierarchy.

- **`VOLUME_1_DISPATCH_CONSTITUTION_V1.md`** — Dispatch Constitution V1.0 (51
  articles + appendices). Authoritative; read *by section*. (Art. 18 routing ladder
  amended to the canonical 9-rung, V1.1 erratum, ADR-0011.)
- **`SPECIFICATION_PROGRAM_AND_VOLUME_ROADMAP.md`** — the 10-Volume program.
- **`volumes/`** — the subsystem specifications. The authored specs of record live in
  subdirectories (the top-level `VOLUME_N_*_SPEC.md` files are superseded pointers):
  - `kernel/` — Volume II (RFC-2000..2015), adopted ADR-0011.
  - `knowledge_graph/` — Volume III (RFC-3000..3015), adopted ADR-0012.
  - `agent_harness/` — Volume IV, adopted ADR-0012.
  - `cooperative_markets/` — Volume V, adopted ADR-0012.
  - `auric_engine/` — Volume VI, adopted ADR-0012.
  - `terminal/` — Volume VII, adopted ADR-0012.
  - `execution_engine/` — Volume VIII (NEW subsystem), adopted ADR-0013.
  - `connector_registry/` — Volume IX, adopted ADR-0013.
  - `object_registry/` — Volume X, adopted ADR-0013.

## Volume index — Specification Program fully reconciled
| Vol | Spec | Reconciled? |
|-----|------|-------------|
| 1 | Dispatch Constitution | ✅ ADR-0008 (Art. 18 amended ADR-0011) |
| 2 | Dispatch Kernel (RFC-2000..2015) | ✅ ADR-0011 (adopted) |
| 3 | Knowledge Graph & Truth (RFC-3000..3015) | ✅ ADR-0012 (real spec; stub pass ADR-0009) |
| 4 | Agent Harness | ✅ ADR-0012 (real spec) |
| 5 | Cooperative Markets Cartridge | ✅ ADR-0012 (real spec; stub pass ADR-0010) |
| 6 | The Auric Engine | ✅ ADR-0012 (real spec; stub pass ADR-0010) |
| 7 | Terminal | ✅ ADR-0012 (real spec) |
| VIII | Execution Engine (NEW) | ✅ ADR-0013 |
| IX | Connector Registry (was committed 8) | ✅ ADR-0013 (stub ADR-0009) |
| X | Object Registry (was committed 9) | ✅ ADR-0013 (stub ADR-0009) |
| — | Cartridge SDK (was committed 10) | folded into kernel RFC-2010 (ADR-0013) |

## Status
All ten volumes reconciled/adopted. Forward work is **build**, not reconciliation —
a large multi-volume backlog sequenced in `ACTIVE_BUILD.md`. Key bridge item:
Canonical Entity Model + entity resolution (RFC-3002 / kernel Object Registry). RLS
enforcement (`0016_market_rls.sql`) is written. "Fact" is served as a projection over
verified-tier assertions (ADR-0012), with a multi-source materialized fact store on
the Volume III roadmap.

## Roadmap reconcile (planned vs delivered)
Roadmap numbering differs from delivered (roadmap: V=Intelligence/Publication,
VIII=Cooperative Markets, X=Developer/Repo SDK; delivered: 5=Cooperative Markets,
6=Auric Engine, 9=Object Registry, 10=Cartridge SDK; no explicit Dev/Repo SDK volume).
The delivered numbering governs in the index above.

## Read policy
Read `CLAUDE.md`, the Constitution summary or the specific articles a task references,
`CURRENT_STATE.md`, `ACTIVE_BUILD.md`, and one context pack. For subsystem work, read
the specific RFC(s)/volume sections a task references — never every volume.
