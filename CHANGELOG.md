# Changelog

## 0.2 — 2 October 2026

Fourteen new definitions (244 in all), exported verbatim from [agenticfinancegraph.com/def](https://agenticfinancegraph.com/def):

- **Bridges, followed to the other side** (`bridge.follow.*`, seven definitions). A counted payment into a bridge is asked of the bridge's own public status record (Across, LI.FI, Relay, deBridge, Circle's attestation service for CCTP): which chain it reached, which address received it. `bridge.follow.back_to_payer.v1` follows a delivery one step further when a bridge hands it to a contract, by reading the delivery's receipt on the destination chain. Destination dollars are never added to a Base figure, and moving money is never called spending.
- **A correction: `cctp.exits.v2`, `cctp.exit.usd.v2`, `cctp.watched.v2`.** The v1 check matched Circle's messenger contracts and read zero. A CCTP burn moves the USDC to the TokenMinter, so v2 matches the minters too. The v1 definitions stay published, frozen, with `superseded_by` pointing to v2.
- **Who can sign for the counted money** (`controller.kind.v1`, `controller.read.v1`): counted dollars by the paying wallet's account type (contract account, plain key, EIP-7702 delegated), with the read coverage beside it. It says who can sign, not what any spending rule allows.
- **Registrations per chain from our own reads** (`census.registrations.bnb.v1`, `census.registrations.chain.v1`): the ERC-8004 registry numbers tokens from 0 on each chain, so the highest id minted plus one is the chain's registration count. Issuance, not agents.

The 37 data checks are unchanged. The test vectors are unchanged on purpose: stable examples are more useful to an implementation than fresh ones.

## 0.1 — 28 September 2026

First public draft: the partition of outflows (pre-registration, pass-through, counted), own positions and left control, the L0–L9 ladder, the drain shape, the 37 data checks, the reconciliation method, 230 definitions and 24 test vectors.
