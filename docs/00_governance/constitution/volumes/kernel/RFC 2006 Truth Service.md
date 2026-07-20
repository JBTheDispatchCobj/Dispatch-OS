\# RFC-2006  
\# Truth Service

Status: Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2001  
\- RFC-2005

Applies To

Every observation, claim, fact, inference, recommendation, publication, workflow, and model execution.

\---

\# Purpose

The Truth Service is the constitutional source of reality inside Dispatch.

Nothing becomes actionable until it has passed through the Truth Service.

The Truth Service does not make business decisions.

It establishes what is currently believed to be true, why, by whom, with what confidence, and from which evidence.

\---

\# Philosophy

Truth is not binary.

Dispatch recognizes multiple states of certainty.

Information progresses through increasingly trusted states as additional evidence accumulates.

Truth is never assumed.

Truth is earned.

\---

\# Core Principle

Reality precedes intelligence.

Intelligence precedes execution.

Execution precedes outcomes.

Outcomes refine reality.

\---

\# Truth Pipeline

\`\`\`text  
Source

↓

Observation

↓

Claim

↓

Evidence

↓

Verification

↓

Fact

↓

Inference

↓

Recommendation

↓

Workflow

↓

Outcome

↓

Truth Update  
\`\`\`

Truth is continuously refined.

\---

\# Truth States

Unknown

Observed

Claimed

Verified

Corroborated

Fact

Superseded

Disputed

Withdrawn

Archived

Only Facts may participate in deterministic automation.

\---

\# Observation

An Observation is raw evidence.

Examples

Call Report

SEC Filing

Meeting Notes

Email

Transcript

Website

API Response

User Upload

Observation is never edited.

Only annotated.

\---

\# Claim

A Claim is a structured statement extracted from one or more Observations.

Example

"This credit union uses Jack Henry."

Claims contain

Statement

Supporting Evidence

Confidence

Extraction Method

Source References

Claims may conflict.

\---

\# Evidence

Evidence supports Claims.

Evidence may include

Documents

Images

Emails

Audio

Video

API Responses

Public Records

Internal Documents

Evidence is immutable.

\---

\# Verification

Verification may occur through

Authoritative Source

Institution Confirmation

Human Expert

Multiple Independent Sources

Deterministic Rule

Verification records

Verifier

Method

Timestamp

Confidence

Notes

\---

\# Facts

Facts are verified Claims.

Facts remain linked to

Claims

Evidence

Sources

Verification Records

Facts are versioned.

Not rewritten.

\---

\# Inference

Inference extends Facts.

Inference is never treated as Fact.

Inference includes

Reasoning Method

Supporting Facts

Confidence

Model

Prompt Version

Assumptions

Expiration

\---

\# Recommendation

Recommendations combine

Facts

↓

Inferences

↓

Goals

↓

Policies

↓

Relationships

↓

Context

Recommendations never become truth.

\---

\# Truth Conflicts

Conflicting Claims coexist.

Dispatch does not silently choose.

Conflict resolution methods

Authoritative Override

Institution Override

Human Review

Evidence Weight

Time

Confidence

Policy

Every conflict is auditable.

\---

\# Confidence

Confidence is calculated.

Not guessed.

Inputs

Source Authority

Freshness

Corroboration

Extraction Quality

Verification

Historical Accuracy

Relationship Strength

Confidence is explainable.

\---

\# Source Authority

Priority

Government

Institution

Licensed Data

Public Company

Trusted Publication

Community

Model

Authority is configurable.

\---

\# Freshness

Truth decays.

Every Fact defines

Observed

Effective

Review Date

Expiration

Stale facts require review.

\---

\# Truth Graph

Truth exists across

Objects

Relationships

Profiles

Workflows

Publications

No duplicated truth stores.

\---

\# Truth Events

ObservationCreated

ClaimCreated

ClaimVerified

FactCreated

InferenceCreated

RecommendationCreated

ConflictDetected

FactSuperseded

TruthReviewed

Every transition emits an Event.

\---

\# Required Tables

observations

claims

claim\_sources

claim\_evidence

verifications

facts

fact\_versions

inferences

recommendations

truth\_conflicts

confidence\_scores

truth\_reviews

\---

\# API Contracts

CreateObservation()

CreateClaim()

VerifyClaim()

CreateFact()

CreateInference()

ResolveConflict()

CalculateConfidence()

SearchTruth()

ReviewTruth()

\---

\# Security

Truth visibility follows

Tenant

↓

Object

↓

Evidence

↓

Policy

Private evidence may support public facts.

Public evidence never reveals private information.

\---

\# Metrics

Verification Rate

Conflict Rate

Confidence Distribution

Fact Freshness

Evidence Coverage

Human Reviews

Inference Accuracy

Recommendation Success

\---

\# Acceptance Criteria

Complete when

\- Observations remain immutable.  
\- Claims preserve provenance.  
\- Facts require verification.  
\- Inferences remain distinct from facts.  
\- Recommendations never masquerade as truth.  
\- Confidence is reproducible.  
\- Conflicts are auditable.  
\- Truth supports replay.  
\- Events are emitted.  
\- APIs are versioned.

\---

\# ADR Candidates

Confidence algorithm

Truth state machine

Conflict policy

Evidence retention

Verification authority

Fact versioning

\---

\# End RFC-2006  
