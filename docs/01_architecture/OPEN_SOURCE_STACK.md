# Open-Source Stack

## Application
- Next.js / React
- TypeScript
- FastAPI optional for Python-heavy ingestion and model services

## Data
- PostgreSQL / Supabase
- pgvector for semantic retrieval
- S3-compatible object storage (Supabase Storage or MinIO)

## Models and routing
- Ollama: local development
- vLLM: production open-model serving
- LiteLLM-compatible gateway: routing, budgets, normalized APIs
- GLM/Kimi/Devstral-class models: coding, batch synthesis, complex open-model work
- Claude/GPT: premium deliberation and coding escalation

## Workflow and policy
- Existing Dispatch proposal/work/evidence loop first
- Temporal later for durable external workflows if required
- Open Policy Agent later if policy complexity exceeds application rules

## Observability
- Langfuse-compatible tracing
- OpenTelemetry
- Sentry or equivalent

## Rule
All providers are adapters. No business contract may depend on one model vendor.
