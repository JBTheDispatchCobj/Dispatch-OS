# 14002 — Cross-Section Dependency Graph V1

## Purpose

Define dependencies between all V1 sections, artifacts, registries, services, and deployment stages.

## Section Dependency Order

### FS-4000

Provides domain meaning.

### FS-5000

Provides canonical registries and cartridge manifests.

### FS-6000

Provides institution, executive, opportunity, readiness, routing, evidence, approval, and audit models.

### FS-7000

Provides product demonstrations and pilot narratives.

### FS-8000

Provides sources, connectors, ingestion, mapping, quality, and lineage.

### FS-9000

Provides population, graph, relationship, search, peers, and inference.

### FS-10000

Provides Terminal surfaces and user workspaces.

### FS-11000

Provides runtime, agents, tools, events, scheduling, and model routing.

### FS-12000

Provides security, governance, IAM, vendor risk, incident, audit, and administration.

### FS-13000

Provides deployment, pilot, support, pricing, contracting, GTM, and commercialization.

### FS-14000

Provides final integration, testing, release, and refinement control.

## Dependency Types

- schema
- registry
- service
- runtime
- security
- user experience
- data
- legal/commercial
- test
- deployment

## Artifact Dependency Record

- artifact ID
- section
- depends on
- dependency type
- version
- required/optional
- compatibility rule
- owner
- status
- test reference

## Critical Paths

### Institution Terminal

8000 data  
→ 5000 objects  
→ 6000 profiles  
→ 9000 graph  
→ 10000 UI

### Fintech Pilot

4002/4007/4014 domains  
→ 6000 readiness/router  
→ 8000 data  
→ 11000 workflow/agents  
→ 12000 vendor/security  
→ 10000 workspace  
→ 13000 pilot

### Exam Binder

4014 domain  
→ 6000 evidence/approval  
→ 8000 documents  
→ 11000 workflow  
→ 12000 audit/security  
→ 10000 evidence workspace

### Participation

4003/4005/4008 domains  
→ 6000 opportunity/router  
→ 8000 package ingestion  
→ 9000 buyer graph  
→ 11000 workflow  
→ 12000 controls  
→ 10000 workspace

## Acceptance Tests

- Every artifact identifies dependencies.
- Circular dependencies are documented or eliminated.
- Critical paths have integration tests.
- Version compatibility is explicit.
- Deployment order follows required dependencies.
