-- dispatch-os / db/migrations/0009_outcome_metric_link.sql
--
-- Outcome <-> Metric ROI linkage (HANDOFF session-7 priority #4;
-- ROI_AND_IMPACT_MODEL §5 value hypothesis, §8 baseline/before-after,
-- §9 estimation discipline). 0003 created the `outcomes` table with
-- target_value/actual_value/related_metric_ids. This adds the columns the ROI
-- engine reads so an outcome can be tied to a COMPUTED metric and read its
-- value-vs-target trend with an honest confidence level.
--
-- Why link by NAME, not id: auto metric rows are append-only and regenerated on
-- every recompute (each gets a fresh id), so `related_metric_ids` cannot point
-- at a stable "current" row. `related_metric_names` is the durable join key; the
-- resolver collapses the metric history to the latest row per name.
--
-- FORWARD-ONLY and ADDITIVE. No in-memory dependency — idea-state runs on the
-- in-memory store, where these fields live on the Outcome type. Apply only when
-- hosting. No existing row changes meaning (all new columns are nullable / empty
-- defaults), so this is safe to apply over a populated table.

alter table outcomes
  -- Stable join to computed metrics by metric_name (first = primary metric).
  add column if not exists related_metric_names text[] not null default '{}',
  -- §8 baseline: the "before" value progress is measured against.
  add column if not exists baseline_value numeric,
  -- §9 estimation discipline: how actual_value was established.
  add column if not exists confidence text
    check (confidence is null or confidence in ('observed','estimated','hypothesized')),
  -- True when a smaller metric value is the better outcome (callbacks, blocked).
  add column if not exists lower_is_better boolean not null default false;

comment on column outcomes.related_metric_names is
  'Computed-metric names this outcome tracks (durable join; auto metric ids are regenerated each recompute). First name is the primary metric.';
comment on column outcomes.baseline_value is
  'ROI_AND_IMPACT_MODEL §8 baseline: progress reads from baseline -> target.';
comment on column outcomes.confidence is
  'ROI_AND_IMPACT_MODEL §9: observed (metric-derived) > estimated (assumptions) > hypothesized. Never present hypothesized as observed.';
comment on column outcomes.lower_is_better is
  'When true, a smaller metric value is the better outcome (e.g. callbacks, blocked jobs).';
