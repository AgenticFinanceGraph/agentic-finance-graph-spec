# Changelog

## Unreleased

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
