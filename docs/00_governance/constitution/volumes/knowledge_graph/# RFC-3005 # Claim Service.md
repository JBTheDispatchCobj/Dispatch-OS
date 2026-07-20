\# RFC-3005  
\# Claim Service

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-3004

Applies To

Every statement extracted from one or more Observations.

\---

\# Purpose

The Claim Service transforms raw Observations into structured statements that can be verified.

Claims are the first semantic interpretation performed by Dispatch.

Observations preserve evidence.

Claims express meaning.

Facts establish truth.

\---

\# Philosophy

A Claim is not truth.

A Claim is not opinion.

A Claim is a structured statement awaiting validation.

Dispatch should create many Claims.

It should create relatively few Facts.

\---

\# Core Principle

Nothing becomes true simply because it was observed.

Everything must first become a Claim.

\---

\# Canonical Pipeline

\`\`\`text  
Observation

↓

Extraction

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
\`\`\`

Claims exist only to bridge evidence and truth.

\---

\# Canonical Definition

A Claim is a structured assertion derived from one or more Observations.

Claims may be

Correct

Incorrect

Incomplete

Conflicting

Unverifiable

Dispatch does not assume correctness.

\---

\# Claim Characteristics

Every Claim contains

UUID

Canonical Statement

Subject Entity

Predicate

Object Entity (optional)

Source Observations

Evidence References

Extraction Method

Confidence

Status

Visibility

Version

Metadata

\---

\# Canonical Structure

Claims should normalize into

\`\`\`text  
Subject

↓

Predicate

↓

Object

↓

Evidence  
\`\`\`

Example

Alloya

↓

Owns

↓

Investment Portfolio

Example

Credit Union X

↓

Uses

↓

Corelation

Example

Startup Y

↓

Raised

↓

$12,000,000

Structured claims enable reasoning.

\---

\# Claim Categories

Identity

Ownership

Financial

Operational

Regulatory

Relationship

Technology

Geographic

Strategic

Editorial

Temporal

Risk

Cartridges may extend categories.

\---

\# Claim Sources

One Observation

↓

Many Claims

Many Observations

↓

One Claim

Claims aggregate evidence.

Not documents.

\---

\# Extraction

Claims may originate from

Rules

NER

LLMs

Structured APIs

Human Entry

Connector Logic

Extraction method is always recorded.

\---

\# Claim Status

Extracted

Pending Review

Verified

Rejected

Conflicted

Superseded

Archived

Status changes emit Events.

\---

\# Claim Confidence

Confidence evaluates

Extraction Quality

Observation Quality

Source Trust

Internal Consistency

Historical Accuracy

Confidence is not truth.

Confidence predicts verification probability.

\---

\# Conflicting Claims

Multiple Claims may coexist.

Example

Institution uses Fiserv.

Institution uses Jack Henry.

Dispatch preserves both until verification resolves the conflict.

Contradictions are healthy.

Silent assumptions are not.

\---

\# Temporal Claims

Claims may include

Effective Date

Expiration

Observed Date

Reported Date

Review Date

Dispatch reasons through time.

Not snapshots.

\---

\# Entity Linking

Every Claim attempts to resolve

Subject

Object

Organizations

People

Products

Places

Events

Unresolved entities create Entity Candidates.

\---

\# Claim Merging

Equivalent Claims may merge.

Merged Claims preserve

Original Evidence

Observation References

Extraction History

Confidence History

Nothing is discarded.

\---

\# Claim Splitting

Composite Claims should split.

Bad

"Alloya invested in Startup X and partnered with CU Y."

Good

Claim 1

Alloya invested in Startup X.

Claim 2

Alloya partnered with CU Y.

Atomic claims improve reasoning.

\---

\# Claim Relationships

Claims may support

Facts

Inferences

Recommendations

Profiles

Workflows

Publications

Claims never directly generate Publications.

\---

\# Claim Events

ClaimCreated

ClaimMerged

ClaimSplit

ClaimVerified

ClaimRejected

ClaimSuperseded

ClaimArchived

ClaimLinked

Every transition emits Events.

\---

\# Required Tables

claims

claim\_versions

claim\_sources

claim\_subjects

claim\_objects

claim\_status

claim\_conflicts

claim\_confidence

claim\_events

\---

\# TypeScript Interfaces

Claim

ClaimVersion

ClaimEvidence

ClaimStatus

ClaimConfidence

ClaimConflict

ClaimReference

\---

\# APIs

CreateClaim()

MergeClaims()

SplitClaim()

LinkClaim()

SearchClaims()

VerifyClaim()

RejectClaim()

ArchiveClaim()

\---

\# Performance Goals

Support

Large-scale extraction

Incremental verification

Batch imports

Semantic search

Entity linking

Conflict detection

Version history

\---

\# Acceptance Criteria

Implementation is complete when

\- Every semantic statement exists as a Claim before becoming a Fact.  
\- Claims remain linked to Observations.  
\- Contradictory Claims coexist safely.  
\- Entity resolution functions.  
\- Confidence is explainable.  
\- Atomic claim decomposition is supported.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.  
\- Claims never bypass verification.

\---

\# ADR Candidates

Claim grammar

Triple representation

Entity linking

Conflict model

Confidence scoring

Merge strategy

\---

\# End RFC-3005  
