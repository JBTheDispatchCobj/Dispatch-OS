# Agentic Source Framework

## Source acquisition modes
1. Automated connector
2. Scheduled bulk importer
3. Developer-tool assisted browser acquisition
4. Manual user upload
5. Email ingestion
6. Partner feed

## Agent workflow
Discover → acquire → archive raw input → parse → normalize → resolve entities → extract claims → validate → score confidence → propose graph writes → publish eligible Intelligence Objects.

## Safety
- Tools are allowlisted per source.
- Raw inputs are immutable.
- Extracted claims require source pointers.
- Agent writes are staged until schema and confidence validation passes.
- Private content cannot flow into public objects without explicit policy.
