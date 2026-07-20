# Context System

The documentation library is intentionally larger than any single model context window should consume.

Use `CONTEXT_MAP.yaml` and `scripts/build_context_pack.py` to create task-scoped context.

Rules:
- Root instructions are always included.
- A pack should generally stay under 20,000 words.
- Durable decisions go in ADRs.
- Current implementation facts go in CURRENT_STATE.
- Active work goes in ACTIVE_BUILD.
- Session-specific detail goes in HANDOFF and should be rewritten, not endlessly appended.
