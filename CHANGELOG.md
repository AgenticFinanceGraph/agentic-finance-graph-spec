# Changelog

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
