# Claude Repository Operating Contract

Read in this order at the start of every session:
1. `README.md`
2. `docs/00_governance/DOCTRINE.md` (the short summary of the Constitution)
3. `docs/00_governance/CURRENT_STATE.md`
4. `docs/00_governance/ACTIVE_BUILD.md`
5. The task-specific context pack named in `ACTIVE_BUILD.md`

Do **not** recursively reread all documentation. The documentation library is authoritative but modular. Read only files referenced by the active context pack or by direct links from a document already in scope.

## Specification hierarchy (authority order)
`docs/00_governance/constitution/` holds the **Dispatch Constitution V1** (Volume I) — the top authority — and the 10-Volume Specification Program roadmap. `DOCTRINE.md` is its short summary; the Constitution governs when they differ, except where an ADR amends it (Constitution Art. 37/38/50). Order: **Constitution (Vol I) → ADRs → subsystem volumes (II–X) → registries → `ACTIVE_BUILD.md`.** Read the Constitution *by section*, never in full every session. Adoption + reconciliation: `ADR-0008`.

## Non-negotiable rules
- Dispatch is the kernel and orchestration brain; it is not the customer-facing brand.
- Auric Works is the company.
- The Auric is the free publication and market-attention layer.
- `[Institution] Terminal` is the customer-facing product.
- Public facts, calculations, inferences, verified facts, and private tenant data must never be conflated.
- Relationships are first-class objects.
- Cartridges extend capability through configuration, rules, prompts, workflows, metrics, and render contracts—not vertical forks.
- UI follows the domain and data contracts. Do not optimize visual design before core contracts stabilize.
- Use the cheapest sufficient intelligence: deterministic rules → small open model → strong open model → frontier model → human expert.
- Never place regulated or financial conclusions solely inside model weights or prompts. Persist evidence, source, confidence, and decision lineage.
- Never introduce a vertical noun into `core/` unless it is a truly universal concept.

## Session close protocol
Before ending a substantive session:
1. Update `docs/00_governance/CURRENT_STATE.md`.
2. Update `docs/00_governance/ACTIVE_BUILD.md`.
3. Add or update the relevant ADR in `docs/01_architecture/adr/` for durable decisions.
4. Update the active context pack.
5. Write a concise `HANDOFF.md` with completed work, changed files, decisions, tests, blockers, and the exact next command/task.

## Change policy
- Prefer additive migrations and backward-compatible contracts.
- Keep PRDs separate from implementation status.
- A PRD says what must exist. `CURRENT_STATE.md` says what exists now.
- Do not silently change doctrine or the Constitution. Propose an ADR.
- Every generated artifact must identify its source objects and model/human provenance.
