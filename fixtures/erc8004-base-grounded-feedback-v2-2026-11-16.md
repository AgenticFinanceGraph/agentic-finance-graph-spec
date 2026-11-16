# ERC-8004 feedback on Base that follows a payment from the rater, rule v2 (fixture, 16 Nov 2026)

`erc8004-base-grounded-feedback-v2-2026-11-16.csv` is built under a stricter rule than the files of 14 October, 20 October and 1 November. Those three stay as published.

**Cutoff:** 16 Nov 2026, 07:00 UTC. Built on 16 Nov 2026, 07:49 UTC. Payments are counted transfers in our ledger.

## The rule

Every feedback entry in the Base Reputation Registry whose rater, **before** the rating, sent a counted stablecoin payment to an address that was the rated identity's address **at the time of that payment**, with the most recent such payment.

The identity's address at a time is the owner of the registration then, read from the registry's own history (the recipient of the last ERC-721 transfer of the token at or before that time, or the mint recipient when no transfer came before; before the mint there is none), or its minting account or declared agent wallet from the mint on.

Definition: <https://agenticfinancegraph.com/def/rep.grounded.share.v2>.

Rule v1 took the wallets bound to the agent on the day the file was built. A payment made to a wallet before the identity existed then grounded a rating, when that wallet became the identity's owner afterwards.

## Who found it

[nablaz-sdk](https://github.com/cyninzf/nablaz-sdk/blob/c69a817a02b6929351adfe9d7e1d9aee9c0783cd/docs/reader/retroactive-binding-2026-10.md) re-ran the 20 October file row by row with its own reader and reported 122 of its 816 rows as grounded on a payment that came before the identity (38 identities, 3 raters). Rule v2, applied to the same 816 rows, gives the same counts:

| rows of the 20 October file | the outside reader | rule v2 |
|---|---|---|
| kept | 694 | 694 |
| kept with the payment the file names | 688 | 688 |
| kept with another payment of the same rater | 6 | 6 |
| not kept: the payment came before the identity was minted | 122 | 122 |

## The figures

| | 20 Oct, rule v1, as published | 16 Nov, rule v2 |
|---|---|---|
| feedback entries on Base | 553,819 | 638,946 |
| entries that follow a payment from the rater | 816 (0.147%) | **858 (0.134%)** |
| raters / agents behind those entries | 22 / 74 | 45 / 113 |
| payment transactions behind them | 165 | 241 |
| rail: `usdc_transfer` / `x402` | 813 / 3 | 834 / 24 |
| median payment | $0.03 | $0.03 |

Two things move between the columns, and they are not the same thing:

- **The rule.** At the 16 November cutoff rule v1 gives 957 entries and rule v2 gives 858. 123 entries are in v1 only: each rests on a payment made before the rated identity was minted (39 identities, 3 raters). 24 are in v2 only: the payment went to the owner of that time, which is not bound to the agent today. 834 are in both, 831 of them with the same payment transaction.
- **The ledger.** Since 7 November our ledger reads the income of every ranked wallet, so it holds more of the raters' payments than it did in October. That is why raters, agents and `x402` rows are higher than in the earlier files, under either rule.

Counted per pair of rater and agent, on agents whose income we read: 90 of 16,712 pairs (0.539%) under v2; 96 under v1.

## How it was checked

1. The rule and the conditions for shipping it were written down on 16 November at 07:28 UTC, before anything was measured.
2. Every one of the rows v2 drops was tested by query: in each, the payment is earlier than the mint of the rated identity.
3. Forty rows were read from a public Base node at the block of the payment: 20 that v2 drops and 20 that it keeps, at the 20 October cutoff. For all 20 dropped rows `ownerOf(token)` fails at that block, because the identity did not exist yet. For all 20 kept rows `ownerOf(token)` at that block is the address that was paid.

To repeat step 3 (no key, Node 18 or later):

    node fixtures/check-owner-at-payment.mjs fixtures/erc8004-grounded-v2-owner-check-2026-11-16.json

## Columns

As in the earlier files, plus one:

| column | meaning |
|---|---|
| `payee_role` | what the paid address was to the rated identity at the time of the payment: `owner`, `minter` or `agent_wallet`. In this file: 857 `owner`, 1 `agent_wallet`. |

`node fixtures/check-fixture.mjs fixtures/erc8004-base-grounded-feedback-v2-2026-11-16.csv` recounts the figures above from the file and checks every row.

## What the file does not say

- That a rating which follows a payment is honest or independent. One operator can pay its own agent and rate it, and chain data does not show who controls an address.
- That a rating without a payment is fake. The rater may have paid by a route we do not read.
- One gap: we do not hold the history of a declared agent wallet, so such a wallet counts from the mint on, also when it was declared later. One row of this file is of that kind.

Licence: CC BY 4.0. Cite as: Agentic Finance Graph, *Accounting specification for machine money* (2026), fixture of 16 November 2026.
