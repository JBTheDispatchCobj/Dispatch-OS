# Model Harness Architecture

## Complexity ladder
0. SQL/rules/calculators
1. Small shared open model
2. Strong open model such as GLM/Kimi/Devstral class
3. Frontier model such as Claude/GPT
4. Human expert

## Router inputs
- task type
- risk level
- novelty
- context size
- structured-output requirement
- latency tolerance
- tenant policy
- cost ceiling
- confidence threshold

## Required abstractions
- ProviderRegistry
- ModelCapabilityRegistry
- RoutingPolicy
- PromptRegistry
- ToolRegistry
- ContextAssembler
- StructuredOutputValidator
- CostLedger
- EvaluationSuite
- EscalationPolicy

## Ownership
Models do not own truth. The database, rules, evidence, and approved decisions do.

## Open-source serving path
- Ollama for local development
- vLLM for shared production inference
- LiteLLM-compatible gateway for provider normalization and cost tracking
- Frontier APIs invoked only through the router
