# AI Coding Agent Instructions

This repository is designed for multi-model, multi-session development.

## Context economy
Do not load the full documentation tree. Use:
- `docs/context/CONTEXT_MAP.yaml` to locate authoritative documents.
- `scripts/build_context_pack.py <pack>` to create a bounded context bundle.
- `docs/context/packs/*.md` for prebuilt subsystem packs.

## Required checks before code changes
1. Identify the owning layer: core, shared market plane, tenant plane, cartridge, publication, terminal, or infrastructure.
2. Confirm the relevant data contract and ADR.
3. State whether the change creates facts, claims, calculations, inferences, recommendations, or actions.
4. Identify tenant and visibility implications.
5. Add tests or fixtures for deterministic behavior.

## Model development roles
- Frontier models: architecture, novel reasoning, high-risk review.
- Strong open coding models: multi-file implementation, refactors, test generation.
- Small local models: extraction, classification, routine summaries, low-risk tool routing.
- Humans: regulated judgment, investment approval, legal interpretation, final editorial truth.

Agents may propose decisions. They may not erase auditability, confidence, provenance, or approval gates.
