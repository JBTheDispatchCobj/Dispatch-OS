# Dispatch Specification Program

## Purpose

This program converts the Dispatch vision into a durable engineering reference that Claude, human engineers, and future model agents can implement without rereading the entire project history.

## Volume Structure

1. **Volume I — Dispatch Constitution**  
   Permanent principles, canonical language, boundaries, and acceptance rules.

2. **Volume II — Kernel Specification**  
   Identity, tenancy, objects, events, workflows, audit, cartridge registry, cost, and execution primitives.

3. **Volume III — Knowledge Graph and Truth Specification**  
   Sources, connectors, observations, claims, provenance, confidence, relationships, profiles, and graph maintenance.

4. **Volume IV — Model Harness and Agent Execution**  
   Rules, tools, open models, GLM/Kimi/Devstral-class models, frontier escalation, human review, evaluations, and cost routing.

5. **Volume V — Intelligence and Publication Engine**  
   Intelligence Objects, The Auric, Brief, Market, Network, $2 Bill, multimedia rendering, personalization, and distribution.

6. **Volume VI — Terminal Specification**  
   Institution-specific product environment, private graph, role lenses, collaboration, search, feeds, workflows, usage, and paid adoption.

7. **Volume VII — Cartridge SDK**  
   Cartridge contracts, packaging, dependencies, schemas, prompts, workflows, permissions, evaluations, versioning, and marketplace behavior.

8. **Volume VIII — Cooperative Markets Domain**  
   Credit-union profiles, startup profiles, regulations, call reports, matching, pilots, partnerships, integration, participation, investment, and monitoring.

9. **Volume IX — Data Acquisition and Connector Registry**  
   Production connector specifications, source trust, refresh policies, discovery R&D, parser contracts, and coverage maps.

10. **Volume X — Developer and Repository SDK**  
    Context packs, ADRs, coding-agent workflows, testing, migrations, releases, observability, and session handoffs.

## How Claude Uses the Volumes

Claude must not read every volume for every task. Each session reads:

1. `CLAUDE.md`
2. the Constitution summary or relevant constitutional sections
3. `CURRENT_STATE.md`
4. `ACTIVE_BUILD.md`
5. one generated subsystem context pack
6. only the referenced volume sections and registries

## Build Order

The recommended order is Constitution, Kernel, Knowledge Graph and Truth, Harness, Cooperative Markets data spine, Intelligence Objects and publication, Terminal, relationship workflows, and UI.

## Maintenance

The Constitution changes rarely. Subsystem volumes evolve through ADRs. Registries change frequently. Active build documents change every session. Context packs are generated from authoritative files and should never become independent sources of truth.


## Volume Completion Standard

A volume is complete when it is internally consistent, cross-referenced, implementation-oriented, and sufficient to generate bounded context packs. Page count is secondary to executable specificity; Volume I is intentionally comprehensive and may render near or above 120 pages depending on Markdown renderer, font, spacing, and code-block treatment.
