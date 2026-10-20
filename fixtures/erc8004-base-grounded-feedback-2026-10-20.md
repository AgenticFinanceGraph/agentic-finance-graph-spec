# ERC-8004 feedback on Base that follows a payment from the rater (fixture, 20 Oct 2026)

`erc8004-base-grounded-feedback-2026-10-20.csv` is the 14 October fixture re-run with the same method, plus a measurement of a payment layout the method cannot see. The 14 October file stays as published.

**Cutoff:** 20 Oct 2026, 21:00 UTC.
- Feedback was read up to Base block 52,870,739.
- Payments are counted transfers in our ledger.

## The re-run (same method as 14 October)

Every feedback entry in the Base Reputation Registry whose rater sent a stablecoin to the rated agent's bound wallet **before** the rating, with the most recent such payment.

| | 14 Oct | 20 Oct |
|---|---|---|
| feedback entries on Base | 514,096 | 553,819 |
| entries that follow a payment from the rater | 728 (0.14%) | **816 (0.147%)** |
| raters / agents | 17 / 64 | 22 / 74 |
| payment transactions behind them | 107 | 165 |
| rail: `usdc_transfer` / `x402` | 725 / 3 | 813 / 3 |
| median payment | $0.03 | $0.03 |

**Two reasons the count grew:**
- **The log grew:** more feedback from raters who had paid.
- **Our ledger read more payments:** between 18 and 20 October our payment reader caught up on a queue it had served in address order (changepoint `cp-2026-10-18-payer-queue` at agenticfinancegraph.com/api/changepoints). Some of the payments behind these rows were read in that catch-up.

**`x402-receipt-commitment` rail: 0 rows.** We know of one opened commitment on Base mainnet (block 52,763,468, discussed in erc-8004/erc-8004-contracts#99). It is not attached to a feedback entry, and its salt is not published, so we have not opened it ourselves.

## A layout the join cannot see: one agent, two wallets

Since 11 October one platform, Central City, has registered most new Base agents (its agent files point to `centralcity.ai`). Each of its agents uses **two** accounts:
- **A, the account the registration was minted to.** A pays for services through the platform's fee routers on Base. They emit `FeeCharged(payer, payee, ref, kind, gross, fee)`.
- **B, the account the registration was moved to.** B holds the registration, receives payments, and writes feedback.

ERC-8004 clears `agentWallet` when a registration moves. After the move, nothing on chain links A to the agent.

**Measured at the same cutoff:**
- **Payments:** 165,041 `FeeCharged` events. Every payer is an A account, and almost every payee is a B account. No payment goes from an agent's A to its own B.
- **Ratings:** Central City agents (rater = the B account of a registration minted since 11 October) wrote **44,364** feedback entries tagged `starred`, on 44,348 agents.
- **Grounding at the agent level:** rater agent X, rated agent Y, a router payment from X's A to Y's B. Of the 44,364 entries:
  - **0** follow such a payment;
  - 23 have one only after the rating;
  - 44,341 have none.
- **Checked a second way, from the chain:** for 60 randomly sampled rating pairs, `eth_getLogs` on the three routers filtered by payer (X's A) and payee (Y's B) over the routers' whole life. 0 paid before the rating, and 1 only after. As a positive control, 3 of 3 pairs known to have paid were found by the same query.

**What this means for a payment-grounding rule:**
- **Rater-to-ratee matching cannot see it.** On this layout the paying account is never the rating account, so even a fully paid relationship would not match.
- **On this layout the two waves are separate.** These ratings do not follow payments by the rating agent, whichever of its accounts is tried.
- **A rule needs an agent-to-wallet link.** To ground feedback here, a rule must know every account that acts for the agent, and the link must survive the registration moving.

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
node fixtures/check-fixture.mjs fixtures/erc8004-base-grounded-feedback-2026-10-20.csv
```

## What it does and does not show

- **"Paid"** means a stablecoin transfer on Base from the rater address to a wallet bound to the rated agent. Payments to a separate x402 `payTo`, payments on other chains, and payments from a different account of the same agent (as in the layout above) are not in the join. So 816 is a lower bound.
- **Most raters are invisible to us.** Most raters on Base are not wallets bound to an agent we index, so our ledger cannot see their payments to anyone.
- **A payment before a rating** shows that the rater and the agent transacted. It does not show that the payment was for the rated interaction.
- **Central City is described, not judged.** The section above describes on-chain layout and timing. It makes no claim about the platform's intent or about the quality of any agent.

Source: [Agentic Finance Graph](https://agenticfinancegraph.com), definitions at agenticfinancegraph.com/def. Licence CC BY 4.0. Context: [erc-8004/erc-8004-contracts#99](https://github.com/erc-8004/erc-8004-contracts/issues/99).
