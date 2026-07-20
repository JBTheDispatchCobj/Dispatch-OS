\# RFC-3009  
\# Evidence & Provenance Service

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-3008

Applies To

Every Observation, Claim, Fact, Relationship, Inference, Recommendation, Intelligence Object, Publication, and Workflow.

\---

\# Purpose

The Evidence & Provenance Service guarantees that every conclusion inside Dispatch can be traced back to its original source.

Dispatch must always answer

Where did this come from?

Why do we believe it?

What changed?

Who verified it?

No intelligence exists without provenance.

\---

\# Philosophy

Evidence is permanent.

Interpretation evolves.

Reality changes.

History remains.

Dispatch preserves evidence while allowing understanding to improve over time.

\---

\# Core Principle

Every conclusion is explainable.

Nothing is accepted because "the AI said so."

Every statement traces to supporting evidence.

Every recommendation traces to supporting facts.

Every fact traces to supporting claims.

Every claim traces to supporting observations.

Every observation traces to a source.

\---

\# Provenance Chain

\`\`\`text  
Source

↓

Observation

↓

Claim

↓

Fact

↓

Inference

↓

Recommendation

↓

Intelligence Object

↓

Publication

↓

Workflow

↓

Outcome  
\`\`\`

Every node is traceable.

\---

\# Canonical Definition

Evidence is immutable supporting material.

Provenance is the complete chain describing how evidence became operational intelligence.

\---

\# Evidence Types

Public Filing

Website

API Response

Email

Meeting Transcript

Financial Statement

Spreadsheet

Image

Audio

Video

PDF

Human Review

Workflow Outcome

Operational Metric

Future cartridges may register new evidence types.

\---

\# Evidence Characteristics

Every Evidence Object contains

UUID

Evidence Type

Original Source

Acquisition Method

Timestamp

Checksum

Storage Reference

Visibility

License

Integrity Status

Metadata

Evidence never stores conclusions.

\---

\# Provenance Record

Every provenance record stores

Origin

Acquisition

Normalization

Extraction

Verification

Reasoning

Publication

Workflow Usage

Outcome

Review History

The chain is complete.

\---

\# Source Attribution

Every source records

Source Name

Organization

Connector

URL

Document ID

License

Authority

Trust Tier

Acquisition Date

Source identity never changes.

\---

\# Chain of Custody

Dispatch records

Who acquired

Who processed

Who verified

Who reviewed

Who modified metadata

Who consumed

Evidence itself never changes.

Only annotations evolve.

\---

\# Evidence Linking

One piece of evidence may support

Many Claims.

Many Facts.

Many Relationships.

Many Publications.

No duplication.

Only references.

\---

\# Provenance Graph

Provenance is itself a graph.

Evidence connects to

Objects

Claims

Facts

Relationships

Workflows

Recommendations

Publications

Every downstream object can walk backward through the graph.

\---

\# Integrity

Evidence receives

Checksum

Content Hash

Acquisition Timestamp

Connector Version

Storage Reference

Integrity failures create Events.

\---

\# Human Review

Review records

Reviewer

Authority

Decision

Notes

Evidence Added

Evidence Rejected

Confidence Adjustment

Reviews become provenance.

\---

\# Licensing

Evidence records

License

Usage Rights

Retention

Redistribution

Expiration

Dispatch respects source licensing.

\---

\# Evidence Events

EvidenceCaptured

EvidenceLinked

EvidenceVerified

EvidenceReferenced

EvidenceArchived

IntegrityFailure

ReviewCompleted

Every transition emits Events.

\---

\# Required Tables

evidence

evidence\_links

provenance\_chain

source\_registry

source\_authority

evidence\_reviews

evidence\_integrity

evidence\_events

provenance\_history

\---

\# TypeScript Interfaces

Evidence

EvidenceLink

ProvenanceRecord

Source

SourceAuthority

EvidenceReview

IntegrityStatus

\---

\# APIs

RegisterEvidence()

LinkEvidence()

TraceProvenance()

VerifyIntegrity()

ReviewEvidence()

SearchEvidence()

GetChainOfCustody()

\---

\# Performance Goals

Support

Millions of evidence objects

Fast provenance traversal

Immutable storage

Content-addressable lookup

Historical replay

Graph navigation

\---

\# Acceptance Criteria

Implementation is complete when

\- Every intelligence artifact has complete provenance.  
\- Every Fact traces to Evidence.  
\- Every Claim traces to Observations.  
\- Chain of custody is preserved.  
\- Integrity is verifiable.  
\- Licensing metadata is retained.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.  
\- Nothing becomes operational intelligence without provenance.

\---

\# ADR Candidates

Content hashing

Evidence storage

Chain-of-custody model

License handling

Provenance graph

Integrity verification

\---

\# End RFC-3009  
