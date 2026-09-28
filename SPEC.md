# The Agentic Finance Graph accounting specification

**Version 0.1 (draft), 28 September 2026.** Licence: CC BY 4.0.

This document states how Agentic Finance Graph counts money held and spent by AI agents: which transfers count as an agent paying someone, which are excluded and why, how an agent is ranked, and how the counting is checked. It is written so that anyone can implement it from public chain data and compare their numbers with ours. Where this document and a definition in [`definitions/definitions.json`](definitions/definitions.json) disagree, the definition wins; definitions are frozen once published (a breaking change is a new id ending `.v2`, never an edit to `.v1`).

---

## 1. Scope

| Item | Value |
|---|---|
| Chain for payments | Base mainnet, `eip155:8453` |
| Identity registry | ERC-8004 Identity registry, `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` (same address on the other chains that deploy it) |
| Reputation registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` |
| Assets | USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`, USDT `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2`, EURC `0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42`, DAI `0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb` |
| Valuation | USD; USDC, USDT and DAI at 1.00; EURC at the day's EURC/USD |

An implementation that measures another chain or asset must say so and must not merge its figures with these without a new definition.

## 2. Objects

- **Registration (actor).** One ERC-8004 identity token. Its *mint time* is the block time of the ERC-721 `Transfer` from the zero address that created it.
- **Binding.** A link between a registration and a wallet, with a method and a validity interval.
  - Method 1, `ownerOf`: the wallet that holds the registration NFT.
  - Method 3, declared: the `agentWallet` named in the registration file.
  - Bindings are closed, never deleted, when the NFT changes owner or the declaration changes.
- **Payment.** A `Transfer` event of one of the assets above whose sender is a bound wallet, identified by `(transaction hash, log index)`.

**Proposed for v0.2: binding tiers.** Tier A is declared by the registration or confirmed by its operator. Tier B is a holder wallet with evidence of automation: a smart account or EIP-7702 delegation, bundler or relayer submission, paymaster-paid gas, x402 settlement, or machine-regular timing. Tier C is a holder wallet with none of these. Today almost all counted money comes from method-1 wallets, so part of it can be the owner's own spending.

## 3. The partition of outflows

Let $O$ be every payment out of a bound wallet. Every payment falls in exactly one of three sets:

$$O = P \;\cup\; T \;\cup\; C, \qquad P \cap T = P \cap C = T \cap C = \varnothing$$

1. **Pre-registration $P$** (`pay.excluded.preregistration.v1`). The payment's block time is earlier than the mint time of the registration its wallet is bound to. The wallet existed before the agent did.
2. **Pass-through $T$** (`pay.excluded.passthrough.v1`). The payment forwards money the wallet received in the same transaction: the receipt shows approximately the same amount (within 2%) arriving at the wallet. It is a routing hop, not a purchase. A payment is only counted after this check has run on it.
3. **Counted $C$** (`pay.usd.total.v1`, `rank.l7plus.v1`). Everything else, provided the recipient is a different address from the sender (self-transfers are excluded).

The counted set is further split by reading each receipt:

$$C = C_{own} \;\cup\; C_{left}$$

- **Own positions $C_{own}$** (`pay.usd.ownpositions.v1`). The recipient is labelled lending or yield vault, and in the same transaction the payer receives the position's claim token: a `Transfer` to the payer from the zero address, or from the recipient contract of its own token. The money went into a position the payer still holds.
- **Left control $C_{left}$** (`pay.usd.leftcontrol.v1`). $C \setminus C_{own}$: what left the paying wallet's control on Base.

Every excluded amount is published as its own metric, so each exclusion can be audited, not just trusted. The three shares of $O$ always add up to 100%.

## 4. The liveness ladder

| Level | Meaning | Definition id |
|---|---|---|
| L0 | A registration exists on-chain | — |
| L1 | It declares a non-empty URI | `probe.l1.uri_nonempty.v1` |
| L2 | The URI answers with a 2xx response | `probe.l2.uri_2xx.v1` |
| L3 | The document parses as an agent descriptor | `probe.l3.schema_valid.v1` |
| L4 | It declares at least one service | `probe.l4.services_declared.v1` |
| L5 | A declared endpoint answers a plain GET | `probe.l5.endpoint_live.v1` |
| L6 | The endpoint speaks MCP or A2A | — |
| **L7** | A bound wallet was observed paying a **different** address after registration (a counted payment) | `rank.l7plus.v1` |
| L8 | L7, and the paying wallet holds at least $10 of USDC at the latest balance read | `rank.l8plus.v1` |
| L9 | L8, and payments to three or more distinct counterparties in the last 30 days | `rank.l9.v1` |

L0 to L5 are measured on a uniform random sample of registrations; L7 to L9 on every registration (a census). The public rank starts at L7, because it is the first level that a registry entry alone cannot claim.

The rank does not assert that the agent is autonomous, that the registrant controls the wallet, or anything about what a payment was for. Some ranked agents rest on less than a dollar; `rank.costtofake.v1` publishes what each level costs to fake.

## 5. Detections

A detection is a shape with evidence, never a verdict. An incident is a detection that is also a harm and is recent. The drain shape is:

> a payment at least **5×** the wallet's previous largest payment, of at least **$250**, to an address the wallet had **never paid before**, after at least **3** earlier payments (30-day look-back).

The other detection kinds (mint bursts, retry storms, endpoints that never answer, owner changes under a binding, delegation to code outside an allow-list) are defined in `definitions.json` (`detection.*`).

Known limits of the drain rule: it reads the four stablecoins only; it watches bound wallets only; a large first payment to a new seller trips it legitimately.

## 6. Checking our own tables

Thirty-seven assertion checks ([`checks/checks.json`](checks/checks.json)) run against the tables every three hours: required fields, duplicate logs, amount ranges, self-transfers in the counted set, payments dated before their registration, classification backlogs, stalled collectors, and more. A check passes when its query returns no rows. Failing rows are published. Each check has a weight (3 for the tables the rank is built from, 2 for the published snapshot, 1 for partner and catalogue tables) that feeds a health score.

## 7. Measuring it twice

A figure is ready to publish only when it has been measured two ways. For payments, the reconciliation is:

1. Take every payment in $O$ for a window, keyed by `(transaction hash, log index)`.
2. Read the same transfers from an independent source (a different node provider or indexer, using raw `Transfer` logs whose sender is a bound wallet).
3. Report: matched rows and value; rows only in ours, each with a reason; rows only in the other source, each with a reason (wallet not yet scanned, bound after the transfer, and so on); matched rows whose amount, sender, recipient or asset disagree.

A published total carries its reconciliation date. Registrations are already measured twice. On 27 September 2026 our census and an independent index agreed to within 0.4% on each of the five chains we cover (Base: 95,882 against 95,956, the gap being registrations minted between the two reads).

## 8. Test vectors

[`test-vectors/classified-payments.json`](test-vectors/classified-payments.json) lists real Base transfers with the class our rules gave them: `counted_left_control`, `counted_own_position`, `excluded_pass_through`, `excluded_pre_registration`. An implementation should assign the same classes from the chain alone: the transaction receipt, the registration's mint block and the recipient's category.

## 9. What this specification does not claim

- That a counted payment was approved by software rather than a person.
- That the counted set is the size of the agent economy. It is what can be observed from bound wallets, on one chain, in four assets.
- That a ranked agent is trustworthy, or that an unranked one is not.

## 10. Citing

Agentic Finance Graph, *Accounting specification for machine money*, v0.1, 28 September 2026, https://agenticfinancegraph.com. Live figures: https://agenticfinancegraph.com/api/state. Definitions: https://agenticfinancegraph.com/api/def.
