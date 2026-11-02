# ERC-8004 feedback on Base that follows a payment from the rater (fixture, 1 Nov 2026)

`erc8004-base-grounded-feedback-2026-11-01.csv` is the monthly re-run of the 14 October fixture, with the same method. The 14 and 20 October files stay as published.

**Cutoff:** 1 Nov 2026, 00:00 UTC.
- The last feedback entry before the cutoff is in Base block 53,350,840.
- Payments are counted transfers in our ledger. Built on 2 Nov 2026, 09:53 UTC.

## The re-run (same method as 14 October)

Every feedback entry in the Base Reputation Registry whose rater sent a stablecoin to the rated agent's bound wallet **before** the rating, with the most recent such payment.

| | 14 Oct | 20 Oct | 1 Nov |
|---|---|---|---|
| feedback entries on Base | 514,096 | 553,819 | 631,230 |
| entries that follow a payment from the rater | 728 (0.14%) | 816 (0.147%) | **840 (0.133%)** |
| raters / agents behind those entries | 17 / 64 | 22 / 74 | 23 / 75 |
| all raters / all rated agents | not recorded | 57,069 / 73,941 | 133,840 / 150,079 |
| payment transactions behind them | 107 | 165 | 189 |
| rail: `usdc_transfer` / `x402` | 725 / 3 | 813 / 3 | 837 / 3 |
| rail: `x402-receipt-commitment` | 0 | 0 | 0 |
| median payment | $0.03 | $0.03 | $0.03 |

**What changed since 20 October:**
- **All 816 rows of 20 October are still in.** None dropped, including after the loop-return correction of 31 October (`pay.usd.total.v3`).
- **24 rows are new.** 18 are feedback written after the 20 October cutoff (21 and 23 October). 6 are older entries (26 September to 2 October) that now match because our ledger read more of the raters' payments.
- **The share fell** because the log grew faster than grounded entries: 77,411 entries were added between the two cutoffs, 76,853 of them tagged `starred`.

**`x402-receipt-commitment` rail: 0 rows.** The salted receipt commitments demonstrated in erc-8004/erc-8004-contracts#99 since 20 October are on Base Sepolia, and the known Base mainnet commitment (block 52,763,468) is not attached to a feedback entry. This fixture reads Base mainnet only.

## The two-wallet layout, at the agent level

The 20 October notes describe a layout the rater-to-ratee join cannot see: an agent pays from the account its registration was minted to (A) and holds the registration, receives payments and rates from the account it was moved to (B). Since 21 October our ledger binds A to the agent when A keeps paying for it after the move (`binding.minter.v1`).

**Population:** ratings written by agents whose paying (minting) account is bound by `binding.minter.v1`. The rater is the agent's current holder (B); the rated agent's holder is its B.

**Test:** a fee-router payment (`FeeCharged`) from the rating agent's A to the rated agent's B before the rating.

| | 20 Oct | 1 Nov |
|---|---|---|
| ratings in the population | 6,917 | 7,413 |
| a router payment from the rating agent before the rating | 0 | **0** |
| a router payment only after the rating | 23 | 23 |

The 20 October column is the same query re-run at that cutoff. It is narrower than the 44,364 `starred` entries in the 20 October notes, which took every rater that was the B account of a registration minted since 11 October; this population takes only agents with a minting account bound by `binding.minter.v1`.

**Reading:** the rule is the same as on 20 October. A payment-grounding rule needs to know every account that acts for an agent, and that link must survive the registration moving. With that link in place for these agents, their ratings still do not follow a payment from the rating agent.

## Columns

As in the 14 October fixture:

| column | meaning |
|---|---|
| `feedback_id` | our id for the entry: feedback transaction hash and log index |
| `agent_id` | the rated agent's token id in the Base Identity Registry `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| `rater` | the feedback's client address |
| `value`, `value_decimals`, `tag1`, `tag2`, `feedback_uri`, `file_uri` | as emitted by `NewFeedback` |
| `feedback_block`, `feedback_at`, `feedback_tx` | where the feedback was written |
| `payment_tx`, `payee`, `amount_usd`, `asset`, `payment_at` | the rater's most recent payment to the agent's bound wallet before the rating |
| `rail` | `x402` when the transfer was an x402 settlement we identified, else `usdc_transfer` |
| `payment_event_id` | our ledger id for the payment |

## Check it yourself

```
node fixtures/check-fixture.mjs fixtures/erc8004-base-grounded-feedback-2026-11-01.csv
```

## What it does and does not show

- **"Paid"** means a stablecoin transfer on Base from the rater address to a wallet bound to the rated agent. Payments to a separate x402 `payTo`, payments on other chains, and payments from a different account of the same agent are not in the join. So 840 is a lower bound.
- **Most raters are invisible to us.** Most raters on Base are not wallets bound to an agent we index, so our ledger cannot see their payments to anyone.
- **A payment before a rating** shows that the rater and the agent transacted. It does not show that the payment was for the rated interaction.
- **Platforms are described, not judged.** The two-wallet section describes on-chain layout and timing. It makes no claim about any platform's intent or about the quality of any agent.

Source: [Agentic Finance Graph](https://agenticfinancegraph.com), definitions at agenticfinancegraph.com/def. Licence CC BY 4.0. Context: [erc-8004/erc-8004-contracts#99](https://github.com/erc-8004/erc-8004-contracts/issues/99).
