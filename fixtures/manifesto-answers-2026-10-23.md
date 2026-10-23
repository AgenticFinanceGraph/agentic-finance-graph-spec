# Answers to the manifesto's two research questions (23 Oct 2026)

The [manifesto](https://agenticfinancegraph.com/about-agentic-finance-graph-manifesto-machine-money) published two open questions, each with our expectation, and promised both results "whichever way they fall". The method was written down at 2026-10-23T09:13:00Z, before either query ran. Both expectations turned out wrong.

## Q1: which exclusion rule moves the spending share most?

USDC that left agent-bound wallets on Base, 3 Feb 2026 to 23 Oct 2026 09:00 UTC: **642,172 payments, $307,980,849.83.** We count $38,479,822.89 of it as spending, a share of **12.494%** by value.

| Rule removed on its own | Share by value | Move | Move by count |
|---|---|---|---|
| Routing hop (`pay.excluded.passthrough.v1`) | 49.082% | **+36.588 pp** | +5.434 pp |
| Pre-registration (`pay.excluded.preregistration.v1`) | 19.240% | +6.746 pp | +1.290 pp |
| Own address (`pay.excluded.ownaddress.v1`) | 12.495% | +0.001 pp | +1.969 pp |

We expected the pre-registration rule to move it most. The routing-hop rule does. Of the $156.8M that left before registration, $123.7M was also a routing hop, so removing the pre-registration rule alone leaves that money excluded.

**Checks:**
- Pre-registration recomputed from each registration's mint time, instead of the stored flag: identical, with 0 disagreements.
- The same SQL without the USDC and date filters reproduces the published `observed_pay_usd_total` ($38,691,484.08) and `pre_registration_pay_usd_excluded` to the cent.

**Not yet in either set:** $12,335,464.17 still waits for its receipt check. Almost all of it is pre-registration.

## Q2: does feedback volume predict later paying, with the ten most active raters set aside?

- **Cohort:** 24,727 Base agents registered before 15 Sep 2026, with a wallet binding valid on that day and no counted payment before it.
- **Outcome:** 131 made a counted payment in the next 30 days (0.53%).
- **Ten raters set aside:** they wrote 227,913 of the 437,513 feedback entries before that day.

| Feedback entries (ten set aside) | Agents | Paid within 30 days |
|---|---|---|
| 0 | 18,140 | 0.595% |
| 1 | 3,402 | 0.382% |
| 2–4 | 1,822 | 0.494% |
| 5+ | 1,363 | 0.073% |

**AUC 0.4524**, 95% bootstrap interval **0.4218–0.4866**, computed two independent ways. Under the rule fixed in advance this is **worse than chance**. We expected "no better than chance".

**Robustness:**
- The pre-registered robustness cohort (15 Aug) could not be computed, because binding records begin on 6 Sep 2026.
- A cohort at 22 Sep was added *after* seeing the main result, so it is not pre-registered. It gives AUC 0.5344 (0.4985–0.5722): within chance, leaning the other way.

**Reading:** feedback volume is not a usable predictor of whether an agent starts paying.

## Files

- `manifesto-answers-2026-10-23.json`: every figure, with its definition id and times.
- `manifesto-answers-2026-10-23-q1.sql`, `manifesto-answers-2026-10-23-q2.sql`: the queries as run against our database.
- `manifesto-answers-2026-10-23-q2-agents.csv`: one row per agent and cohort (token id, feedback with and without the ten, paid within 30 days). Anyone can recount the AUC from it with `node manifesto-answers-2026-10-23-q2-auc.mjs` after renaming the columns, or check any row against the chain.
- `manifesto-answers-2026-10-23-q2-auc.mjs`: rank-sum AUC with a seeded bootstrap (seed 20261023, 1,000 resamples).

## Limits

- **Q1:** "Left agent-bound wallets" means wallets we have bound to a registration. Payments from accounts we have not bound are not in the universe.
- **Q2:** "Did not pay" includes agents whose operator pays from an account we cannot attribute. 912 cohort agents (3.7%) have a bound wallet the payment scan had not read by 23 Oct.
- Nothing here says that feedback causes or prevents paying, that any rater is fake, or that paying is quality.

Drafted with AI assistance; every figure is from the files in this folder. CC BY 4.0, Agentic Finance Graph.
