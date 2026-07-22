# 14006 — Performance, Scale & Capacity Testing V1

## Purpose

Define performance and scale targets for profiles, graph queries, ingestion, workflows, agents, search, reports, and concurrent tenants.

## Workload Types

- institution profile load
- graph expansion
- natural-language search
- bulk target-list query
- document ingestion
- batch ingestion
- workflow execution
- agent/model call
- report generation
- evidence export
- concurrent approvals
- connector synchronization

## Initial Design Targets

- common Terminal page: first useful content under 3 seconds
- institution tab: under 2 seconds after initial load
- simple search: under 2 seconds
- bounded graph path: under 5 seconds
- target-list query: under 15 seconds
- ordinary workflow route: under 10 seconds
- standard document parse: progress immediately visible
- report generation: status visible and resumable

## Capacity Dimensions

- active tenants
- institutions
- graph nodes/edges
- active users
- concurrent workflows
- daily ingestion jobs
- documents
- events per second
- model calls
- storage
- exports

## Test Types

- load
- stress
- spike
- soak
- failover
- large document
- large graph
- batch backlog
- model-provider degradation
- connector-rate limit

## Capacity Planning

Record:

- baseline
- tested maximum
- bottleneck
- scaling mechanism
- cost impact
- alert threshold
- owner
- remediation

## Acceptance Tests

- Performance targets are measurable.
- Load tests include tenant isolation.
- Backlogs are observable.
- Scaling cost is understood.
- Graceful degradation exists.
