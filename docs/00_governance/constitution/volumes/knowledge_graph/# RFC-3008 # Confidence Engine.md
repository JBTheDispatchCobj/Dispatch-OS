\# RFC-3008  
\# Confidence Engine

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-3007

Applies To

Every Observation, Claim, Fact, Relationship, Profile, Inference, Recommendation, Workflow, Publication, and Intelligence Object.

\---

\# Purpose

The Confidence Engine quantifies how much trust Dispatch places in information.

Confidence is not truth.

Confidence measures the probability that a statement, relationship, or recommendation accurately reflects reality.

Truth answers

"Is this verified?"

Confidence answers

"How certain are we?"

\---

\# Philosophy

Confidence is calculated.

Never guessed.

Every confidence score must be reproducible from measurable inputs.

No model may invent confidence.

\---

\# Core Principle

Confidence compounds.

Weak evidence produces weak confidence.

Strong evidence produces strong confidence.

Multiple independent sources increase confidence.

Contradictory evidence reduces confidence.

\---

\# Confidence Hierarchy

\`\`\`text  
Observation

↓

Claim

↓

Fact

↓

Relationship

↓

Inference

↓

Recommendation

↓

Intelligence Object

↓

Publication  
\`\`\`

Confidence propagates upward.

It never propagates downward.

\---

\# Canonical Definition

Confidence is a normalized score representing Dispatch's calculated certainty based on evidence, provenance, freshness, corroboration, and historical accuracy.

Confidence exists independently from truth.

\---

\# Confidence Inputs

Observation Quality

Source Authority

Evidence Count

Evidence Diversity

Verification Method

Relationship Strength

Temporal Freshness

Historical Accuracy

Contradictory Evidence

Human Review

Execution Outcomes

Every input is measurable.

\---

\# Source Authority

Authority tiers are Registry-driven.

Example

Government

Institution

Public Filing

Trusted Partner

Commercial Dataset

Public Website

Community Source

Model Extraction

Unknown

Authority contributes to confidence.

Not truth.

\---

\# Evidence Weight

Evidence quality depends upon

Authority

Independence

Freshness

Completeness

Verification

Redundancy

Multiple copies of the same source do not substantially increase confidence.

Independent corroboration does.

\---

\# Freshness

Confidence decays over time.

Each object defines

Freshness Half-Life

Review Frequency

Expiration Policy

Automatic Refresh Trigger

Old information becomes less reliable.

Not necessarily false.

\---

\# Confidence States

Unknown

Very Low

Low

Moderate

High

Very High

Verified

States are configurable.

Numeric scores remain canonical.

\---

\# Confidence Propagation

Facts influence

Relationships.

Relationships influence

Profiles.

Profiles influence

Recommendations.

Recommendations never alter underlying confidence.

Confidence flows upward only.

\---

\# Contradictions

Contradictory evidence creates

Confidence reduction.

Never silent replacement.

Dispatch records

Supporting Evidence

Conflicting Evidence

Resolution Status

Human Review

Conflict itself is valuable information.

\---

\# Human Review

Human review affects confidence.

Not truth.

Review records

Reviewer

Authority

Decision

Confidence Adjustment

Reason

Timestamp

Every adjustment is auditable.

\---

\# Outcome Feedback

Operational outcomes refine confidence.

Example

Recommendation succeeded.

↓

Future confidence in similar reasoning increases.

Recommendation failed.

↓

Confidence decreases.

Dispatch learns from execution.

\---

\# Confidence History

Every score maintains

Previous Value

New Value

Reason

Inputs

Timestamp

Version

Confidence is historical.

Not ephemeral.

\---

\# Confidence Events

ConfidenceCalculated

ConfidenceAdjusted

ConfidenceReduced

ConfidenceIncreased

ConflictDetected

HumanOverride

ConfidenceExpired

Every adjustment emits Events.

\---

\# Required Tables

confidence\_scores

confidence\_history

confidence\_inputs

confidence\_rules

confidence\_reviews

confidence\_decay

confidence\_events

confidence\_metrics

\---

\# TypeScript Interfaces

ConfidenceScore

ConfidenceRule

ConfidenceInput

ConfidenceHistory

ConfidenceReview

ConfidenceDecay

ConfidenceCalculation

\---

\# APIs

CalculateConfidence()

RefreshConfidence()

AdjustConfidence()

GetConfidenceHistory()

SearchConfidence()

RegisterConfidenceRule()

EvaluateConfidence()

\---

\# Performance Goals

Support

Real-time calculation

Incremental updates

Historical replay

Batch recalculation

Graph-wide propagation

Low-latency scoring

\---

\# Acceptance Criteria

Implementation is complete when

\- Confidence is deterministic.  
\- Confidence is explainable.  
\- Inputs are measurable.  
\- Contradictions reduce confidence.  
\- Freshness decay functions.  
\- Human review is auditable.  
\- Operational outcomes influence future confidence.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Confidence never replaces truth.

\---

\# ADR Candidates

Confidence formula

Decay algorithm

Propagation model

Authority weighting

Feedback learning

Conflict weighting

\---

\# End RFC-3008

