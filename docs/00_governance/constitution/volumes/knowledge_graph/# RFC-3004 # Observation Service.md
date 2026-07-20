\# RFC-3004  
\# Observation Service

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-3003

Applies To

Every external or internal piece of information entering Dispatch.

\---

\# Purpose

The Observation Service is the ingestion boundary of the Knowledge Graph.

Nothing enters Dispatch as Truth.

Everything enters as an Observation.

Observations are the raw materials from which intelligence is constructed.

\---

\# Philosophy

An Observation is evidence.

Not knowledge.

Not truth.

Not intelligence.

The Observation Service preserves reality before interpretation.

\---

\# Core Principle

Observe first.

Interpret second.

Verify third.

Reason fourth.

Execute last.

Dispatch never skips stages.

\---

\# Canonical Pipeline

\`\`\`text  
Reality

↓

Source

↓

Connector

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
\`\`\`

Every intelligence artifact traces back to one or more Observations.

\---

\# Canonical Definition

An Observation is an immutable record describing something that was observed from a source at a specific point in time.

Observations never make assertions.

They preserve evidence.

\---

\# Observation Characteristics

Every Observation contains

UUID

Source

Timestamp

Acquisition Method

Original Content

Normalized Content

Object References

Relationship Candidates

Metadata

Confidence (Source)

Visibility

Checksum

Version

\---

\# Observation Types

Document

Website

API Response

Email

Meeting Transcript

Call Report

Financial Statement

SEC Filing

NCUA Filing

CUSO Registry

RSS Feed

Podcast

Video

Social Post

Human Note

CSV

Spreadsheet

PDF

Image

Audio

Webhook

Future connector types extend this list.

\---

\# Acquisition Methods

Connector

Manual Upload

API

Webhook

Email

Scheduled Import

Human Entry

Batch Import

Streaming

Every Observation records how it entered Dispatch.

\---

\# Immutability

Observations never change.

Corrections create

New Observations.

Annotations.

Or superseding metadata.

The original artifact remains intact.

\---

\# Canonical Representation

Every Observation stores

Raw Payload

↓

Normalized Representation

↓

Extracted Metadata

↓

References

↓

Hash

Normalization never destroys original evidence.

\---

\# Source Attribution

Every Observation records

Source Name

Source Type

Connector

URL (if applicable)

Document ID

Acquisition Time

License

Trust Level

Source attribution is permanent.

\---

\# Normalization

Normalization extracts

Entities

Identifiers

Dates

Numbers

Locations

People

Organizations

Products

Relationships

Documents

Normalization never creates Claims.

\---

\# Observation Quality

Quality evaluates

Completeness

Freshness

Integrity

Structure

Readability

Parsing Success

Duplication

Quality affects downstream confidence.

\---

\# Duplicate Detection

Duplicate evaluation considers

Checksum

Semantic Similarity

Identifiers

Source

Timestamp

Entity References

Duplicates are linked.

Never discarded.

\---

\# Observation Visibility

Private

Institution

Shared

Public

Restricted

Visibility follows tenancy.

\---

\# Observation Events

ObservationCaptured

ObservationNormalized

ObservationValidated

ObservationLinked

ObservationDuplicated

ObservationArchived

ObservationRejected

Every transition emits Events.

\---

\# Observation Lifecycle

\`\`\`text  
Captured

↓

Normalized

↓

Validated

↓

Linked

↓

Referenced

↓

Archived  
\`\`\`

Observations never become Facts directly.

\---

\# Relationship to Claims

One Observation

may support

many Claims.

One Claim

may require

many Observations.

This many-to-many relationship is fundamental.

\---

\# Relationship to Memory

Observations are not Memory.

Memory references Observations.

Memory is accumulated understanding.

Observations remain raw evidence.

\---

\# Relationship to Intelligence

Observations are never consumed directly by publications.

The path is always

Observation

↓

Claim

↓

Fact

↓

Inference

↓

Intelligence Object

↓

Publication

\---

\# Required Tables

observations

observation\_sources

observation\_artifacts

observation\_hashes

observation\_metadata

observation\_links

observation\_events

observation\_quality

observation\_duplicates

\---

\# TypeScript Interfaces

Observation

ObservationSource

ObservationArtifact

ObservationMetadata

ObservationReference

ObservationQuality

DuplicateCandidate

\---

\# APIs

CreateObservation()

NormalizeObservation()

LinkObservation()

SearchObservations()

FindDuplicates()

ArchiveObservation()

RetrieveArtifact()

\---

\# Performance Goals

Observation ingestion should support

High-volume imports

Incremental updates

Streaming sources

Parallel normalization

Idempotent ingestion

Replay from source

\---

\# Acceptance Criteria

Implementation is complete when

\- Every external input becomes an Observation.  
\- Observations remain immutable.  
\- Source attribution is permanent.  
\- Normalization preserves original evidence.  
\- Duplicate detection functions.  
\- Visibility follows tenancy.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.  
\- No Observation bypasses the Truth pipeline.

\---

\# ADR Candidates

Observation schema

Artifact storage

Normalization pipeline

Duplicate detection

Source trust model

Streaming ingestion

\---

\# End RFC-3004

