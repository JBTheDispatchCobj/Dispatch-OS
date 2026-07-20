# Agentic Execution Architecture

## Agent categories
- Ingestion agents
- Entity-resolution agents
- Research agents
- Profile agents
- Intelligence editors
- Lens/render agents
- Match agents
- Workflow agents
- Coding agents
- Human-review coordinators

## Execution contract
Every agent run records:
- instruction and version
- allowed tools
- scoped entities and tenant
- source inputs
- model/provider
- cost and latency
- structured output
- confidence
- validation result
- proposed writes/actions
- approval state

Agents propose writes. Deterministic validators and permissions authorize writes.
