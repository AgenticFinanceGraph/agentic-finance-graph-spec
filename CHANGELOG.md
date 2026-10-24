# Changelog

## 0.9 — 24 October 2026

363 definitions (5 new since 0.8), exported verbatim from [agenticfinancegraph.com/def](https://agenticfinancegraph.com/def); 50 data checks (5 new); test vectors unchanged.

- **New definitions:** `research.exclusion_sensitivity.v1` and `research.feedback_predicts_paying.v1` (the manifesto's two pre-registered questions, answered 23 Oct 2026); `x402.settle.submitter.v4` (every transfer found is counted, an even stride sample is read); `x402.settle.oversize.v1` (settlements at least 100× the seller's median, the on-chain shape of the x402 client SDKs' missing spend cap reported by V12 on 22 Oct 2026); `reg.chains.upperbound.v1` (the ERC-8004 registry read from public nodes on 40 EVM chains: highest agent id per chain, an upper bound on registrations, and the platform behind each wave).
- **New checks (50):** `payer_vs_logs` (stored payments against Transfer logs read straight from the chain for a sample of wallets), `offsite_backup_stale`, `sweep_lag`, `census_gap`, `payer_queue_age`.
- **Frozen links made two-way.** The 13 superseded ids that carried `superseded_by` without `valid_until` now carry it (`agent.pass.v1`, `behaviour.out_of_character.v1`, `cctp.*.v1`, `detector.*.v1`, `incident.open.v1`, `rank.l9.v3`, `xchain.bnb.sample.*`); the 14 successors that lacked a backward `supersedes` now carry it. Bodies are unchanged.
- **SPEC.md** now cites the current ids: the counted set is `pay.usd.total.v2` with the own-address exclusion (`pay.excluded.ownaddress.v1`, 21 Oct 2026) in the prose, L9 is `rank.l9.v4`, the check count is fifty, and the version string matches this file and `CITATION.cff`.
- **Alias:** the headline metric `observed_pay_usd_total` resolves to `pay.usd.total.v2`.
- **Correction, Q2 recompute script.** `fixtures/manifesto-answers-2026-10-23-q2-auc.mjs` read the agent table by column position, and the published CSV carries `token_id` as its second column, so since 23 Oct the script computed on the wrong columns (it printed AUC 0.248 for the 15 Sep cohort). It now reads columns by header name and reproduces the published figures exactly: 24,727 agents, 131 paid, AUC 0.4524 (0.4218–0.4866), 0.4227 with the ten included; 22 Sep cohort 0.5344 (0.4985–0.5722). The published figures were never wrong; the public way to recount them was.
- **CI:** the fixture recount ran over every CSV in `fixtures/`, so the manifesto-answers agent table (a different schema, added in 0.8) failed it on every push since 23 Oct. The recount now runs over the grounded-feedback fixtures only, and a second step recomputes the Q2 AUC from its own CSV.
- Open items for 1.0 are listed in the gap review of 24 Oct 2026 (empty `excludes` on 55 ids, voluntary fields, CAIP-2 normalisation, `cost_to_fake` on the rank ids, new test vectors, CI checks on cited ids).

## 0.8 — 21 October 2026

358 definitions (36 new since 0.7), exported verbatim from [agenticfinancegraph.com/def](https://agenticfinancegraph.com/def). The data checks (45) and the test vectors are unchanged.

- **The whole x402 rail on Base** (21 October 2026): `eip3009.base.auths.24h.v1`, `eip3009.base.usd.24h.v1`, `eip3009.base.payers.24h.v1` and `eip3009.base.agentpayers.24h.v1` read every `AuthorizationUsed` event of Base USDC, paired with its transfer, hourly; `x402.base.facilitated.share.24h.v1` estimates which of those transactions are x402 from a random sample checked against the public facilitator list. First full day, 24 hours to 21 October 07:48 UTC: 300,164 authorisations, $1.71M, 8,572 payers (653 of them registered agents' wallets), 85.3% of sampled transactions submitted by listed facilitators. Live at [/api/x402-rail](https://agenticfinancegraph.com/api/x402-rail).
- **`x402.settle.submitter.v3`** (21 October 2026): facilitators are also recognised from a dated snapshot of the public facilitator list, and named. Over the 20,000 stored settlements of 12 to 19 October: third_party 125 → 61; Coinbase 19,655, PayAI 128. v2 stays published, marked superseded.
- **`incident.live.v3`** (21 October 2026): a registration that changes owner within 24 hours of its mint (a platform handing a new registration to its holder) is logged as an info detection and is never a live incident. Of the 2,799 transfer detections ever logged, 2,786 were this shape; live incidents went from 1,924 to 0. v2 stays published, marked superseded.
- **The security layer, in shadow** (16 October 2026): `payee.facts.v1` (seven measured facts about an address before paying it), `behaviour.out_of_character.v1` and `.v2` (is a payment in character for this agent, with reasons), `agent.pass.v1` and `.v2` (a three-hour statement of eight checks), `agent.blast_radius.v1` (what a stolen key controls at one block) and `canary.trigger.v1`. Measured, never enforced.
- **Six measured layers** (13 October 2026, evening): `detector.test_then_drain.v1`; operator sets and sibling notices (`cluster.ratio.v1`, `fleet.sibling.v1`); a behaviour clock per ranked agent (`stability.run_length.v1`, `stability.heartbeat.v1`); the independence of a rank (`rank.independence.v1`, `rank.inflation.v1`, `rank.l9.v4`, `counterparty.botlike.v1`); how ranked agents end (`ladder.exit_incidence.v1`, `ladder.transition.v1`, `platform.sdr.v1`, `survival.landmark.v1`); a Merkle-sum tree over every counted payment (`sumlog.v1`); issuer freezes on Base (`issuer.freeze.v1`); who submits x402 settlements (`x402.settle.submitter.v1`); and the trace pack (`check.trace.v1`).

Also in 0.8:

- **Two-wallet agents and own-address netting** (21 October 2026): `binding.minter.v1` binds the account a registration was minted to when it keeps paying for the agent after the registration moved; `pay.usd.total.v2` and `pay.excluded.ownaddress.v1` net transfers to an agent's own addresses out of counted payments (4,061 transfers, $688.05 at the switch); `census.bound.wallets.v2`. Earlier versions stay published, marked superseded.
- **Fixture re-run, 20 October 2026** (`fixtures/erc8004-base-grounded-feedback-2026-10-20.csv`): 816 of 553,819 feedback entries on Base follow a payment from the rater (0.147%; 22 raters, 74 agents), same method as 14 October, which stays published. Adds a measured section on a layout the method cannot see: on Central City, each agent pays from the account its registration was minted to and rates from the account it was moved to; 0 of its 44,364 `starred` entries follow a router payment from the rating agent to the rated one (checked a second way on chain, with a positive control).
- **`x402.settle.submitter.v2`** (20 October 2026): an EIP-3009 authorisation submitted inside a batch (Multicall3 `aggregate3` and the like) now counts as an authorisation, read from the receipt's `AuthorizationUsed`. v1 stays published, marked superseded. Measured on the 20,000 stored settlements of 12 to 19 October: 128 of 173 "other" were batched authorisations; third_party 61 → 125. Context: [erc-8004/erc-8004-contracts#99](https://github.com/erc-8004/erc-8004-contracts/issues/99#issuecomment-6296802380).
- **Fixtures** (`fixtures/`): the first data set, ERC-8004 feedback on Base that follows a payment from the rater (14 October 2026, 728 rows, CC BY 4.0), with notes. Context: [erc-8004/erc-8004-contracts#99](https://github.com/erc-8004/erc-8004-contracts/issues/99).
- **`fixtures/check-fixture.mjs`**: recounts a fixture's published figures from its CSV and checks every row (payment before rating, Base CAIP-10 payee, known rail, positive amount). Exit code 1 on any failure.
- **Automatic checks** (`.github/workflows/check.yml`): on every push and pull request, the JSON files must parse, every fixture must recount and pass `check-fixture.mjs`, and every relative link in README, SPEC, CHANGELOG and CONTRIBUTING must resolve (`scripts/check-links.mjs`).

## 0.7 — 13 October 2026

322 definitions (12 new), exported verbatim from [agenticfinancegraph.com/def](https://agenticfinancegraph.com/def), and 45 data checks (2 new).

- **The liveness ladder, each rung as one test.** `rank.l7plus.v2`: a payment counts toward L7 only when it left the agent's control (not into its own lending or vault position, not to its own addresses, not a bridge leg that came back). `rank.l9.v3`: three independent counterparties (contract code, or paid by two or more agents). `rank.l8plus.v3` rests on the new L7. `probe.l5.endpoint_live.v2` reads up to 8 web endpoints in any order and counts a completed handshake; `probe.l6.protocol.v1` measures L6 (MCP, A2A or x402); `probe.hosted_sink.v2`. SPEC section 4 is rewritten to match. The earlier versions stay published, marked superseded.
- **Drain, wallet abandoned** (`drain.abandoned.v1`), published as candidates, never detections, and the exit pack that lists one agent's windows (`check.exit.v1`); see SPEC section 5.
- **Builder Codes in smart-wallet payments** (`pay.builder.attribution.v2`): the ERC-8021 suffix is also read inside a UserOperation's calldata, and schema 2 is decoded.
- **Native ETH out of agent wallets** (`eth.out.wallets.30d.v1`, `eth.out.usd.30d.v1`, `eth.out.checked.v1`), published on its own; counted spending is unchanged.
- **Two data checks**: `actor_rank_evidence_withdrawn` (a ranked agent whose payment evidence no longer meets its rank) and `actor_unmeasured_l6` (no agent sits at L6 without a measured handshake).

## 0.6 — 12 October 2026, night

310 definitions (22 new), exported verbatim from [agenticfinancegraph.com/def](https://agenticfinancegraph.com/def), and 43 data checks.

- **Address poisoning, rule v2** (`poison.events.24h.v2` and five more). A look-alike now also counts when it matches a payee on the first 3 and last 4 hex characters (Tsuchiya, Dong, Soska and Christin, USENIX Security 2025), measured against that paper first; see SPEC section 5. The v1 definitions are kept, superseded, each with a dated revision.
- **Who paid an agent** (`payers.set.v1`) and **payment-grounded feedback** (`rep.grounded.v1`, `rep.grounded.base.v1`, `rep.grounded.share.v1`). These are the reviewer filter ERC-8004's `getSummary` asks for. Counted per reviewer-agent pair: on 12 October 2026, 6 of 619 pairs were grounded.
- **Endpoint-domain verification** (`probe.domain.checked.v1`, `.verified.v1`, `.file.v1`, `.tophost.v1`). This is ERC-8004's optional `/.well-known/agent-registration.json` proof, read by the liveness sweep.
- **Incoming tiny transfers** (`poison.tiny.24h.v1`): the paper's third kind of plant, read hourly and published on its own.
- **Token approvals** (`approval.wallets.30d.v1`, `approval.unlimited.wallets.v1`, `approval.unlimited.usd.v1`, `approval.top_spender.share.v1`, `approval.plain.30d.v1`): what paying agent wallets approve, and the balances behind standing unlimited approvals.
- **L9 with independent counterparties** (`rank.l9.independent.v1`), published beside L9.
- **The statement log** (`agent.statement.log.v1`): RFC 6962, with signed tree heads and consistency proofs; see SPEC section 7a.
- **A data check for unexplained steps** in our own series (`unexplained_step`); see SPEC section 6. checks.json now lists all 43 checks.

## 0.5 — 12 October 2026

288 definitions, exported verbatim from [agenticfinancegraph.com/def](https://agenticfinancegraph.com/def), each now with a dated `revisions` list and `body_sha256` (the hash of the frozen body, status fields excluded):

- **`rank.l8plus.v2`, `rank.l9.v2`.** Since 27 September 2026 the L8 line has counted the four-stablecoin float (USDC, USDT, EURC at the day's rate, DAI), while `rank.l8plus.v1` still said USDC. v2 states the rule the counts follow; v1 stays published, superseded. The ladder table in SPEC.md follows.
- **`pay.composition.v1`**: the counted total taken apart in one pass, every payment in exactly one part (own positions, bridge, work escrow, swap, other labelled, agent-to-agent, x402 sellers, unnamed), so the parts add up to that pass's total.
- **`pay.usd.leftcontrol.netbridge.v1`**: left control minus the bridged money that reached the paying wallet's own address on another chain.
- **`cp.labelled.usd.share.v1`**: the labelled share by value, beside the existing share by count. The category definitions carry a dated revision: their base is the counted set.

Our own changes of coverage, method, labels and detector rules are now listed with dates at [/api/changepoints](https://agenticfinancegraph.com/api/changepoints). The data checks and the test vectors are unchanged.

## 0.4 — 11 October 2026

Four detector definitions (280 in all), exported verbatim from [agenticfinancegraph.com/def](https://agenticfinancegraph.com/def):

- **`detector.retry_storm.v2`** and **`detector.mint_burst.v2`** replace the calendar-hour rules. Both read runs with a peak: consecutive events never more than the window apart, reported when the densest window inside the run reaches the threshold, keyed on the hour the run starts. The hour-bucketed v1 rules under-counted storms four to one; the fault was found on synthetic data with known answers ([amlsim-agentic](https://github.com/AgenticFinanceGraph/amlsim-agentic)) and confirmed on the live ledger (10 storm detections reported, 45 in the ledger).
- **`detector.drain_pattern.v2`**: every drain detection carries the share of the wallet the payment took, read from the chain at the block before. Evidence beside the rule for a month, then a filter.
- **`detector.layering_fan.v1`**: one agent paying four or more others the same exact amount within days, the same-amount fan-out shape. A shape, never an incident.

The note on the x402 observed-value definition was corrected. The data checks and the test vectors are unchanged.

## 0.3 — 5 October 2026

Thirty-two new definitions (276 in all), exported verbatim from [agenticfinancegraph.com/def](https://agenticfinancegraph.com/def):

- **Agent statements** (`agent.statement.v1`, `agent.statement.root.v1`). For every agent at L7 or above, every three hours, a statement of one closed window: payments out split into spend, routing hops and payments whose receipt is not read yet (they must add up to the outflow), what left the agent's control, income in, open flags. Canonical JSON (keys sorted, numbers as decimal strings) hashed with keccak-256, each statement carrying the previous one's hash, and one Merkle root per window over keccak256(uint256(agentId) || statementHash), sorted-pair hashing, signed with Ed25519. Roots are published at /api/statements and not yet committed on chain.
- **Detector records** (`detector.score.v1`): per rule, fired, open, re-derived, held, withdrawn, next to address poisoning. A cell no stored record can fill is null.
- **Who paid an address** (`cp.payers.l7.v1`): counted payments into one receiving address, distinct paying agents at L7 or above, and the top payer's share. An address that only received routing hops is not a payee.
- **Spending by the day it was paid** (`pay.usd.by_day.v1`), **the address-poisoning watch** (`poison.*`, nine definitions), **Solana agents** (`sol.agents.*`, five) and **every BNB Smart Chain registration owner, receipt-checked** (`xchain.bnb.*`, fourteen).

The data checks and the test vectors are unchanged.

## 0.2 — 2 October 2026

Fourteen new definitions (244 in all), exported verbatim from [agenticfinancegraph.com/def](https://agenticfinancegraph.com/def):

- **Bridges, followed to the other side** (`bridge.follow.*`, seven definitions). A counted payment into a bridge is asked of the bridge's own public status record (Across, LI.FI, Relay, deBridge, Circle's attestation service for CCTP): which chain it reached, which address received it. `bridge.follow.back_to_payer.v1` follows a delivery one step further when a bridge hands it to a contract, by reading the delivery's receipt on the destination chain. Destination dollars are never added to a Base figure, and moving money is never called spending.
- **A correction: `cctp.exits.v2`, `cctp.exit.usd.v2`, `cctp.watched.v2`.** The v1 check matched Circle's messenger contracts and read zero. A CCTP burn moves the USDC to the TokenMinter, so v2 matches the minters too. The v1 definitions stay published, frozen, with `superseded_by` pointing to v2.
- **Who can sign for the counted money** (`controller.kind.v1`, `controller.read.v1`): counted dollars by the paying wallet's account type (contract account, plain key, EIP-7702 delegated), with the read coverage beside it. It says who can sign, not what any spending rule allows.
- **Registrations per chain from our own reads** (`census.registrations.bnb.v1`, `census.registrations.chain.v1`): the ERC-8004 registry numbers tokens from 0 on each chain, so the highest id minted plus one is the chain's registration count. Issuance, not agents.

The 37 data checks are unchanged. The test vectors are unchanged on purpose: stable examples are more useful to an implementation than fresh ones.

## 0.1 — 28 September 2026

First public draft: the partition of outflows (pre-registration, pass-through, counted), own positions and left control, the L0–L9 ladder, the drain shape, the 37 data checks, the reconciliation method, 230 definitions and 24 test vectors.
