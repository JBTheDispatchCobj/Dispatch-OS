# 8005 — Email, Calendar & Communication Ingestion V1 Release Complete

## Purpose

Define controlled ingestion of institutional communication for relationship context, workflow triggers, attachments, commitments, meetings, and evidence.

## Sources

- Gmail
- Microsoft mail systems when connected
- calendar systems
- exported EML/MBOX
- approved team collaboration systems
- meeting notes
- approved transcripts

## Email Objects

- message
- thread
- sender
- recipients
- subject
- body
- attachments
- timestamps
- labels/folders
- related institution
- related people
- related workflow
- confidentiality
- evidence status
- extracted commitments
- extracted dates
- action items

## Calendar Objects

- event
- organizer
- attendees
- start/end
- timezone
- location
- conference link
- description
- related institution
- meeting type
- preparation materials
- follow-up tasks
- outcome notes

## Ingestion Rules

- Read only within authorized scope.
- Preserve thread and message identity.
- Do not treat drafts as sent commitments.
- Distinguish internal versus external messages.
- Preserve attachment lineage.
- Do not infer approval from informal discussion.
- Respect privilege and confidential labels.
- Allow user-defined exclusions.
- Minimize unrelated personal communication.

## Communication Extraction

May extract:

- institution
- people
- project
- opportunity
- decision request
- commitment
- due date
- meeting
- attachment
- risk
- next action
- sentiment only when permitted and non-dispositive

## Commitment Object

- commitment_id
- speaker/sender
- recipient
- exact source reference
- summarized commitment
- due date
- confidence
- status
- related workflow
- approval status

No extracted commitment becomes binding without human review.

## Calendar Workflow Triggers

Examples:

- prepare meeting brief
- retrieve prior correspondence
- create follow-up tasks
- identify open commitments
- attach relevant institution profile
- draft internal briefing

## Privacy Controls

- tenant configuration
- mailbox/folder filters
- sender/domain filters
- date filters
- retention
- privilege labels
- personal-data minimization
- access audit
- deletion/revocation behavior

## Outputs

- communication graph
- relationship timeline
- meeting brief
- follow-up queue
- attachment ingestion jobs
- commitment candidates
- workflow triggers

## Acceptance Tests

- Email identity and thread structure are preserved.
- Drafts are distinguished from sent messages.
- Commitments require review.
- Excluded communication is not indexed.
- Revoked connector access stops ingestion.

## V1 Completion Additions

### Mailbox and Calendar Boundaries

Connection is opt-in, scope-limited, tenant-authorized, and revocable. V1 supports selected folders, labels, accounts, calendars, date windows, senders, and object types. The default excludes deleted items, drafts, personal calendars, sensitive folders, and message bodies not needed for the approved use case.

### Communication-to-Object Rules

Messages and events may produce candidate commitments, tasks, relationships, decisions, evidence, meetings, and workflow triggers. A candidate is not treated as approved institutional truth until confidence, permission, and review requirements pass.

### Sending Authority

FS-8000 only ingests and stages communication context. Sending, replying, accepting invitations, or representing the institution requires a separately authorized runtime action, explicit permissions, and applicable human approval.
