# FS-7000 Demo Environment Implementation Runbook

## Build Order

1. Deploy fixture and demo-run schemas.
2. Load demo scenario registry.
3. Load fixture-pack registry.
4. Configure synthetic tenant.
5. Load deterministic fixture data.
6. Enable required FS-6000 kernel services.
7. Configure workflows and agents from FS-5000/FS-11000.
8. Configure dashboards and UI views.
9. Configure permissions and external-action blocks.
10. Run acceptance tests.
11. Validate reset.
12. rehearse presenter narrative.

## Public Demo Controls

- synthetic data only
- visible synthetic watermark
- external send disabled
- production connectors disabled
- restricted evidence unavailable
- reset available to demo admin
- full audit logging

## Scenario Start Procedure

- confirm clean environment
- select scenario
- load fixture pack
- validate objects
- validate expected workflow
- validate dashboards
- begin run
- record presenter and audience

## Reset Procedure

- pause active workflow
- archive demo run audit
- remove fixture objects by reset group
- clear workflow and approval state
- clear dashboard cache
- reload deterministic seed
- execute smoke test

## Smoke Tests

- institution Terminal opens
- opportunity queue loads
- workflow launches
- approval blocks correctly
- evidence drill-through works
- reset completes
- no private data present

## Presenter Failure Fallback

- switch to expected-results view
- show stored sample output
- disclose demo runtime issue
- preserve audit
- do not fabricate live completion
