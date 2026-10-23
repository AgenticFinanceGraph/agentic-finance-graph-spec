-- Q1, as run on 2026-10-23 (cutoff 2026-10-23T09:00:00Z). Rules: plans pre-registration, 09:13 UTC.
SET statement_timeout=600000;
\echo == Q1 route (a): USDC since 2026-02-03, cutoff 2026-10-23 09:00 UTC
CREATE TEMP TABLE u AS
SELECT m.event_id, m.actor_id, m.amount_usd::float usd, m.block_time, m.pre_registration r1,
       (m.pass_through AND t.event_id IS NULL) r2, (t.event_id IS NOT NULL) r3,
       (m.pass_checked_at IS NULL) p, coalesce(m.own_position, false) ownpos
FROM money_events m LEFT JOIN own_transfers t ON t.event_id = m.event_id
WHERE m.kind = 'PAY' AND m.asset = 'USDC' AND m.block_time >= '2026-02-03T00:00:00Z' AND m.block_time < '2026-10-23T09:00:00Z';
SELECT count(*) n, round(sum(usd)::numeric,2) u_usd,
  round(sum(usd) FILTER (WHERE NOT r1 AND NOT r2 AND NOT r3 AND NOT p)::numeric,2) counted,
  round(sum(usd) FILTER (WHERE NOT r2 AND NOT r3 AND NOT p)::numeric,2) counted_without_r1,
  round(sum(usd) FILTER (WHERE NOT r1 AND NOT r3 AND NOT p)::numeric,2) counted_without_r2,
  round(sum(usd) FILTER (WHERE NOT r1 AND NOT r2 AND NOT p)::numeric,2) counted_without_r3,
  round(sum(usd) FILTER (WHERE r1)::numeric,2) r1_usd, round(sum(usd) FILTER (WHERE r2)::numeric,2) r2_usd,
  round(sum(usd) FILTER (WHERE r3)::numeric,2) r3_usd, round(sum(usd) FILTER (WHERE p)::numeric,2) pending_usd,
  round(sum(usd) FILTER (WHERE r1 AND r2)::numeric,2) r1_and_r2, round(sum(usd) FILTER (WHERE r1 AND r3)::numeric,2) r1_and_r3,
  round(sum(usd) FILTER (WHERE r1 AND p)::numeric,2) r1_and_p,
  round(sum(usd) FILTER (WHERE NOT r1 AND NOT r2 AND NOT r3 AND NOT p AND ownpos)::numeric,2) counted_own_positions
FROM u;
\echo == same, by count of payments
SELECT count(*) n, count(*) FILTER (WHERE NOT r1 AND NOT r2 AND NOT r3 AND NOT p) counted,
  count(*) FILTER (WHERE NOT r2 AND NOT r3 AND NOT p) without_r1, count(*) FILTER (WHERE NOT r1 AND NOT r3 AND NOT p) without_r2,
  count(*) FILTER (WHERE NOT r1 AND NOT r2 AND NOT p) without_r3, count(*) FILTER (WHERE r1) r1, count(*) FILTER (WHERE r2) r2, count(*) FILTER (WHERE r3) r3, count(*) FILTER (WHERE p) pending,
  min(block_time) first_payment, max(block_time) last_payment
FROM u;
\echo == Q1 route (b): pre-registration recomputed from mint time, not the flag
SELECT count(*) FILTER (WHERE u.block_time < r.minted_at) by_mint_time_n, round(sum(u.usd) FILTER (WHERE u.block_time < r.minted_at)::numeric,2) by_mint_time_usd,
       count(*) FILTER (WHERE u.r1) by_flag_n, round(sum(u.usd) FILTER (WHERE u.r1)::numeric,2) by_flag_usd,
       count(*) FILTER (WHERE u.r1 <> (u.block_time < r.minted_at)) disagree_n, round(sum(u.usd) FILTER (WHERE u.r1 <> (u.block_time < r.minted_at))::numeric,2) disagree_usd,
       count(*) FILTER (WHERE r.token_id IS NULL) no_registration_row
FROM u LEFT JOIN registrations r ON r.chain_id = 8453 AND u.actor_id = 'act_8453_' || r.token_id;
\echo == reconciliation: unfiltered partition vs the published metrics
SELECT round(sum(amount_usd) FILTER (WHERE NOT pre_registration AND NOT pass_through AND pass_checked_at IS NOT NULL)::numeric,2) counted_all,
       round(sum(amount_usd) FILTER (WHERE pre_registration)::numeric,2) prereg_all
FROM money_events WHERE kind='PAY';
SELECT metric, round(value::numeric,2) v, as_of FROM snapshots WHERE metric IN ('observed_pay_usd_total','pre_registration_pay_usd_excluded','pass_through_pay_usd_excluded','own_address_pay_usd_excluded') ORDER BY as_of DESC LIMIT 8;
