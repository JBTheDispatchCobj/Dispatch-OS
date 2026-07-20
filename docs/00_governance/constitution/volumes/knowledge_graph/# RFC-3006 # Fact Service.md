\# RFC-3006  
\# Fact Service

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-3005

Applies To

Every verified statement inside the Dispatch Knowledge Graph.

\---

\# Purpose

The Fact Service establishes verified operational reality.

Facts are the constitutional foundation upon which every recommendation, workflow, publication, profile, and intelligence object is built.

Dispatch never reasons from Claims.

Dispatch reasons from Facts.

\---

\# Philosophy

A Fact is not merely a high-confidence Claim.

A Fact is a verified Claim.

Verification is explicit.

Truth is earned.

\---

\# Core Principle

Every Fact must be reproducible.

Given the same evidence,

another reviewer should reach the same conclusion.

\---

\# Canonical Pipeline

\`\`\`text  
Observation

↓

Claim

↓

Verification

↓

Fact

↓

Inference

↓

Recommendation

↓

Intelligence Object  
\`\`\`

No shortcuts.

\---

\# Canonical Definition

A Fact is a Claim that has successfully passed one or more approved verification methods.

Facts remain linked to

Claims

Evidence

Observations

Verification History

Nothing is detached.

\---

\# Fact Characteristics

Every Fact contains

UUID

Canonical Statement

Verified Claim

Verification Method

Verification Timestamp

Verifier

Supporting Evidence

Supporting Observations

Confidence

Effective Date

Review Date

Expiration

Version

Metadata

\---

\# Verification Methods

Authoritative Public Source

Institution Confirmation

Human Review

Multiple Independent Sources

Deterministic Rule

Regulatory Filing

System Verification

Future verification methods may be registered.

\---

\# Verification Authorities

Government

Institution

Auric Works

Trusted Partner

Approved Cartridge

Human Reviewer

Authority is Registry-driven.

Not hardcoded.

\---

\# Fact States

Verified

Confirmed

Corroborated

Historical

Superseded

Expired

Disputed

Archived

Facts never become Claims again.

\---

\# Fact Confidence

Verification establishes

Truth.

Confidence establishes

certainty about that truth.

Both are recorded.

Confidence evolves.

Truth status does not unless re-verified.

\---

\# Effective Dates

Every Fact may contain

Observed Date

Effective Date

Verified Date

Review Date

Expiration Date

Dispatch reasons over temporal truth.

\---

\# Fact Versioning

Facts are immutable.

Changes produce

New Fact Versions.

History remains available.

Consumers choose current or historical views.

\---

\# Fact Relationships

Facts connect to

Entities

Relationships

Workflows

Profiles

Recommendations

Memory

Publications

Every downstream artifact references Facts.

Never Claims.

\---

\# Fact Freshness

Truth ages.

Every Fact defines

Review Frequency

Freshness Target

Expiration Policy

Automatic Review Trigger

Freshness influences routing.

Not truth.

\---

\# Disputed Facts

A Fact may become disputed.

Dispute records

Reason

Evidence

Reviewer

Timestamp

Outcome

Disputed Facts remain visible.

History is preserved.

\---

\# Fact Merging

Equivalent Facts merge by

Verification

Evidence

Canonical Statement

History

Merged Facts preserve

All verification history.

\---

\# Fact Events

FactCreated

FactVerified

FactReviewed

FactSuperseded

FactDisputed

FactExpired

FactArchived

Every state transition emits Events.

\---

\# Required Tables

facts

fact\_versions

fact\_verifications

fact\_review\_schedule

fact\_evidence

fact\_confidence

fact\_events

fact\_disputes

fact\_history

\---

\# TypeScript Interfaces

Fact

FactVersion

Verification

VerificationAuthority

FactReview

FactConfidence

FactDispute

\---

\# APIs

CreateFact()

VerifyFact()

ReviewFact()

DisputeFact()

SupersedeFact()

ArchiveFact()

SearchFacts()

GetFactHistory()

\---

\# Performance Goals

Support

Millions of Facts

Incremental verification

Parallel verification

Historical replay

Fast graph traversal

Temporal queries

Version retrieval

\---

\# Acceptance Criteria

Implementation is complete when

\- Every Fact originates from one or more Claims.  
\- Verification is explicit.  
\- Verification history is preserved.  
\- Facts remain versioned.  
\- Facts support temporal reasoning.  
\- Disputes never destroy history.  
\- Every downstream artifact references Facts.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.

\---

\# ADR Candidates

Verification framework

Authority hierarchy

Fact versioning

Temporal truth

Freshness policy

Dispute resolution

\---

\# End RFC-3006  
