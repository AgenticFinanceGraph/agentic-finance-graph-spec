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
3. **Counted $C$** (`pay.usd.total.v1`). Everything else, provided the recipient is a different address from the sender (self-transfers are excluded).

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
| L5 | A declared web endpoint (up to 8, in any order; never a shared hosting platform's submit URL) answers within 8 seconds: a 2xx or 402 to a GET, or a completed protocol handshake | `probe.l5.endpoint_live.v2` |
| L6 | An endpoint completes a handshake: MCP (`initialize` returns a `protocolVersion`), A2A (an agent card with a `name` and a `skills` array), or x402 (a 402 with `accepts[]` naming a scheme, a network and a `payTo`) | `probe.l6.protocol.v1` |
| **L7** | A bound wallet made a counted payment that **left the agent's control**: not into a lending or vault position the receipt shows it still holds, not to its own addresses (any wallet ever bound to it, its registration's owner, its minter), and not a bridge leg that came back to it | `rank.l7plus.v2` |
| L8 | L7, and a bound wallet holds at least $10 in stablecoins (USDC, USDT, EURC at the day's rate, DAI) at the latest balance read | `rank.l8plus.v3` |
| L9 | L8, and its payments that left control reached at least three **independent** counterparties in the last 30 days: an address with contract code, or one that at least two registered agents pay | `rank.l9.v3` |

L0 to L6 are measured on a uniform random sample of registrations; L7 to L9 on every registration (a census). The public rank starts at L7, because it is the first level that a registry entry alone cannot claim. When a ranked agent loses its payment evidence, it falls to the level its last probe measured.

Version history, each kept published and marked superseded: `rank.l7plus.v1` counted any counted payment, including deposits into the agent's own positions and payments to its own addresses; `rank.l8plus.v1` and `rank.l9.v1` read USDC only, `rank.l8plus.v2` and `rank.l9.v2` the four stablecoins with any three counterparties; `probe.l5.endpoint_live.v1` read the first four listed entries in order. The dated changes are at [/api/changepoints](https://agenticfinancegraph.com/api/changepoints).

The rank does not assert that the agent is autonomous, that the registrant controls the wallet, or anything about what a payment was for. Some ranked agents rest on less than a dollar; `rank.costtofake.v1` publishes what each level costs to fake.

## 5. Detections

A detection is a shape with evidence, never a verdict. An incident is a detection that is also a harm and is recent. The drain shape is:

> a payment at least **5×** the wallet's previous largest payment, of at least **$250**, to an address the wallet had **never paid before**, after at least **3** earlier payments (30-day look-back).

The other detection kinds (mint bursts, retry storms, endpoints that never answer, owner changes under a binding, delegation to code outside an allow-list) are defined in `definitions.json` (`detection.*`).

Known limits of the drain rule: it reads the four stablecoins only; it watches bound wallets only; a large first payment to a new seller trips it legitimately.

**Address poisoning** (`poison.*.v2`, 12 October 2026). A poisoner plants a look-alike of an address the agent pays, hoping a later payment copies the wrong one. A plant is either:

- a zero-value transfer of a real token from the agent's wallet; or
- a transfer of a token whose symbol imitates a real one; or
- another token sent to an address without code.

The recipient must match one of the wallet's payees on the first 3 and last 4 hex characters, the threshold of Tsuchiya, Dong, Soska and Christin, *Blockchain Address Poisoning* (USENIX Security 2025). For a fake-symbol token the last 4 alone suffice.

We measured the rule against the paper before adopting it:

- of 82,132 plants either rule counts, our earlier first-4 + last-4 rule found 80,509 and the paper's 80,880;
- a second, independent read of 300 sampled plants from the chain found every one sent by somebody other than the wallet, to an address without code.

The paper's third kind, the incoming *tiny transfer* (look-alike to wallet, a real token, under 10 USD), is read hourly from Base's public node since 12 October 2026 and published on its own (`poison.tiny.24h.v1`); in its first hours we saw none.

**Drain, wallet abandoned** (`drain.abandoned.v1`, 13 October 2026) is published as candidates, never as detections. A dominant-share window opens when, in the 72 hours after an agent's first counted payment to a new payee, that payee takes at least 80% of everything the agent paid, at the drain thresholds above, with two or more payments of varying amounts. The window is a candidate when the payee is not a service (no label, paid by fewer than ten registered agents) and the agent has paid no one else from the end of the window until now, for at least 30 days. A person cashing out and a thief with a stolen key leave the same shape.

A **loss** is a real payment to an address planted in that wallet's history first and never paid before. It is confirmed by a second source: Blockscout, or the transaction receipt from Base's public nodes.

## 6. Checking our own tables

Forty-three assertion checks ([`checks/checks.json`](checks/checks.json)) run against the tables every three hours: required fields, duplicate logs, amount ranges, self-transfers in the counted set, payments dated before their registration, classification backlogs, stalled collectors, and more. A check passes when its query returns no rows. Failing rows are published. Each check has a weight (3 for the tables the rank is built from, 2 for the published snapshot, 1 for partner and catalogue tables) that feeds a health score.

One check reads our own series rather than our tables (`unexplained_step`, added 12 October 2026). Changepoint detection (PELT, Killick, Fearnhead and Eckley 2012) finds sudden steps in each archived daily series. A step must be a material move, concentrated in one day, that persisted. Every step is matched against our dated register of coverage, method, label and detector-rule changes (`/api/changepoints`) or a checked note; one that nothing explains is a warning. On its first run it found that the register entry for the 27 September 2026 sweep named too few series, and a correcting entry was added. Entries in the register are never edited.

## 7. Measuring it twice

A figure is ready to publish only when it has been measured two ways. For payments, the reconciliation is:

1. Take every payment in $O$ for a window, keyed by `(transaction hash, log index)`.
2. Read the same transfers from an independent source (a different node provider or indexer, using raw `Transfer` logs whose sender is a bound wallet).
3. Report: matched rows and value; rows only in ours, each with a reason; rows only in the other source, each with a reason (wallet not yet scanned, bound after the transfer, and so on); matched rows whose amount, sender, recipient or asset disagree.

A published total carries its reconciliation date. Registrations are already measured twice. On 27 September 2026 our census and an independent index agreed to within 0.4% on each of the five chains we cover (Base: 95,882 against 95,956, the gap being registrations minted between the two reads).

## 7a. A history that cannot be quietly rewritten

Every signed statement-window root is a leaf of an append-only Merkle log in the shape of Certificate Transparency (RFC 6962 section 2.1). The hashing is SHA-256 with 0x00 before a leaf and 0x01 before a node pair. Each leaf is the exact message its root was signed over.

A signed tree head (size, root hash, time; Ed25519, `afg-statement-log:v1:<size>:<root>:<ms>`) is published whenever the log grows, and every head is kept. A reader who stores a head can later ask for a consistency proof (`/api/statements/log?consistency=<size>`) and check, with the RFC 9162 algorithm, that the new head extends the old one. If any earlier root had been changed, the proof fails. `agent.statement.log.v1`.

## 8. Test vectors

[`test-vectors/classified-payments.json`](test-vectors/classified-payments.json) lists real Base transfers with the class our rules gave them: `counted_left_control`, `counted_own_position`, `excluded_pass_through`, `excluded_pre_registration`. An implementation should assign the same classes from the chain alone: the transaction receipt, the registration's mint block and the recipient's category.

## 9. What this specification does not claim

- That a counted payment was approved by software rather than a person.
- That the counted set is the size of the agent economy. It is what can be observed from bound wallets, on one chain, in four assets.
- That a ranked agent is trustworthy, or that an unranked one is not.

## 10. Citing

Agentic Finance Graph, *Accounting specification for machine money*, v0.1, 28 September 2026, https://agenticfinancegraph.com. Live figures: https://agenticfinancegraph.com/api/state. Definitions: https://agenticfinancegraph.com/api/def.
