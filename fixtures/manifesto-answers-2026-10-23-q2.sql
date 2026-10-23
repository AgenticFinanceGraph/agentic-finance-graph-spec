-- Q2, as run on 2026-10-23. Run b = the pre-registered main cohort (T0 2026-09-15).
-- Run a = a check added AFTER the main result was seen (T0 2026-09-22), not pre-registered.
-- The pre-registered robustness run used T0 2026-08-15; it returns an empty cohort because binding records begin 2026-09-06 (replace 2026-09-22 with 2026-08-15 to see it).
SET statement_timeout=0;
\timing on
CREATE TEMP TABLE pay AS
SELECT actor_id,
  bool_or(block_time < '2026-09-22') pb_a, bool_or(block_time >= '2026-09-22' AND block_time < '2026-10-22') po_a,
  bool_or(block_time < '2026-09-15') pb_b, bool_or(block_time >= '2026-09-15' AND block_time < '2026-10-15') po_b
FROM money_events WHERE kind='PAY' AND NOT pre_registration AND NOT pass_through AND pass_checked_at IS NOT NULL AND actor_id LIKE 'act_8453_%'
GROUP BY 1;
CREATE TEMP TABLE top_a AS SELECT lower(client_addr) c, count(*) n FROM reputation_feedback WHERE chain_id=8453 AND at < '2026-09-22' GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 10;
CREATE TEMP TABLE top_b AS SELECT lower(client_addr) c, count(*) n FROM reputation_feedback WHERE chain_id=8453 AND at < '2026-09-15' GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 10;
CREATE TEMP TABLE fb AS
SELECT agent_id,
  count(*) FILTER (WHERE at < '2026-09-22') all_a,
  count(*) FILTER (WHERE at < '2026-09-22' AND lower(client_addr) NOT IN (SELECT c FROM top_a)) feat_a,
  count(*) FILTER (WHERE at < '2026-09-15') all_b,
  count(*) FILTER (WHERE at < '2026-09-15' AND lower(client_addr) NOT IN (SELECT c FROM top_b)) feat_b
FROM reputation_feedback WHERE chain_id=8453 GROUP BY 1;
CREATE TEMP TABLE coh AS
SELECT DISTINCT 'a'::text run, g.token_id FROM registrations g JOIN bindings b ON b.actor_id = 'act_8453_' || g.token_id
 WHERE g.chain_id=8453 AND g.minted_at < '2026-09-22' AND b.valid_from < '2026-09-22' AND (b.valid_to IS NULL OR b.valid_to > '2026-09-22')
UNION
SELECT DISTINCT 'b', g.token_id FROM registrations g JOIN bindings b ON b.actor_id = 'act_8453_' || g.token_id
 WHERE g.chain_id=8453 AND g.minted_at < '2026-09-15' AND b.valid_from < '2026-09-15' AND (b.valid_to IS NULL OR b.valid_to > '2026-09-15');
CREATE TEMP TABLE res AS
SELECT c.run, c.token_id,
  CASE WHEN c.run='a' THEN coalesce(f.feat_a,0) ELSE coalesce(f.feat_b,0) END feat,
  CASE WHEN c.run='a' THEN coalesce(f.all_a,0) ELSE coalesce(f.all_b,0) END feat_all,
  CASE WHEN c.run='a' THEN coalesce(p.po_a,false) ELSE coalesce(p.po_b,false) END paid
FROM coh c LEFT JOIN pay p ON p.actor_id = 'act_8453_' || c.token_id LEFT JOIN fb f ON f.agent_id = c.token_id
WHERE NOT coalesce(CASE WHEN c.run='a' THEN p.pb_a ELSE p.pb_b END, false);
\echo == cohort summary (run a = T0 2026-09-22, run b = T0 2026-09-15, main)
SELECT run, count(*) agents, count(*) FILTER (WHERE paid) paid_in_30d, round(100.0*avg(paid::int),3) base_rate_pct,
       count(*) FILTER (WHERE feat > 0) with_feedback, count(*) FILTER (WHERE feat_all > 0) with_feedback_incl_top10 FROM res GROUP BY 1 ORDER BY 1 DESC;
\echo == outcome rate by feedback bin, top-10 set aside
SELECT run, CASE WHEN feat=0 THEN '0' WHEN feat=1 THEN '1' WHEN feat<=4 THEN '2-4' ELSE '5+' END bin, count(*) agents, count(*) FILTER (WHERE paid) paid, round(100.0*avg(paid::int),3) rate_pct
FROM res GROUP BY 1,2 ORDER BY 1 DESC, 2;
\echo == outcome rate by feedback bin, top-10 included (comparison only)
SELECT run, CASE WHEN feat_all=0 THEN '0' WHEN feat_all=1 THEN '1' WHEN feat_all<=4 THEN '2-4' ELSE '5+' END bin, count(*) agents, count(*) FILTER (WHERE paid) paid, round(100.0*avg(paid::int),3) rate_pct
FROM res GROUP BY 1,2 ORDER BY 1 DESC, 2;
\echo == AUC implementation 1 (grouped exact pair count), top-10 aside then included
WITH g AS (SELECT run, feat v, count(*) FILTER (WHERE paid) pos, count(*) FILTER (WHERE NOT paid) neg FROM res GROUP BY 1,2),
c AS (SELECT run, v, pos, neg, coalesce(sum(neg) OVER (PARTITION BY run ORDER BY v ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),0) nb FROM g)
SELECT run, round((sum(pos*(nb + 0.5*neg)) / (sum(pos)*sum(neg)))::numeric, 4) auc_aside FROM c GROUP BY 1 ORDER BY 1 DESC;
WITH g AS (SELECT run, feat_all v, count(*) FILTER (WHERE paid) pos, count(*) FILTER (WHERE NOT paid) neg FROM res GROUP BY 1,2),
c AS (SELECT run, v, pos, neg, coalesce(sum(neg) OVER (PARTITION BY run ORDER BY v ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),0) nb FROM g)
SELECT run, round((sum(pos*(nb + 0.5*neg)) / (sum(pos)*sum(neg)))::numeric, 4) auc_included FROM c GROUP BY 1 ORDER BY 1 DESC;
\echo == known gap: cohort agents whose bound wallet at T0 was never read by the payment scan
SELECT r.run, count(DISTINCT r.token_id) FILTER (WHERE w.last_pay_check IS NULL) never_read, count(DISTINCT r.token_id) agents
FROM res r JOIN bindings b ON b.actor_id = 'act_8453_' || r.token_id
 AND b.valid_from < (CASE WHEN r.run='a' THEN '2026-09-22'::timestamptz ELSE '2026-09-15'::timestamptz END)
 AND (b.valid_to IS NULL OR b.valid_to > (CASE WHEN r.run='a' THEN '2026-09-22'::timestamptz ELSE '2026-09-15'::timestamptz END))
LEFT JOIN wallets w ON w.caip10 = b.wallet GROUP BY 1 ORDER BY 1 DESC;
\echo == feedback entries before T0 and the share from the ten set aside
SELECT 'b' run, (SELECT count(*) FROM reputation_feedback WHERE chain_id=8453 AND at < '2026-09-15') entries, (SELECT sum(n) FROM top_b) top10_entries, (SELECT count(DISTINCT lower(client_addr)) FROM reputation_feedback WHERE chain_id=8453 AND at < '2026-09-15') raters
UNION ALL SELECT 'a', (SELECT count(*) FROM reputation_feedback WHERE chain_id=8453 AND at < '2026-09-22'), (SELECT sum(n) FROM top_a), (SELECT count(DISTINCT lower(client_addr)) FROM reputation_feedback WHERE chain_id=8453 AND at < '2026-09-22');
\echo == the ten set aside (main T0)
SELECT c rater, n entries FROM top_b ORDER BY n DESC;
\copy (SELECT CASE run WHEN 'b' THEN '2026-09-15' ELSE '2026-09-22' END AS t0, token_id, feat AS feedback_top10_aside, feat_all AS feedback_all, paid::int AS paid_within_30d FROM res ORDER BY 1, 2) TO 'q2-agents.csv' CSV HEADER
