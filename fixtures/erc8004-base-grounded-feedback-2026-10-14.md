# ERC-8004 feedback on Base that follows a payment from the rater (fixture, 14 Oct 2026)

`erc8004-base-grounded-feedback-2026-10-14.csv`: every feedback entry in the Base Reputation Registry whose rater had sent a stablecoin to the rated agent's bound wallet **before** the rating, with the most recent such payment. Measured 14 Oct 2026, 10:50 UTC.

- 728 of 514,096 feedback entries on Base (0.14%), from 17 raters on 64 agents, backed by 107 payment transactions.
- 725 of the payments are plain USDC transfers, 3 are x402 settlements (`rail`). Median payment $0.03.
- 721 of the 728 entries carry a feedback URI.

On 11 Oct the same join gave 697 entries; the log has grown since.

## Columns

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

## What it does and does not show

- "Paid" means a stablecoin transfer on Base from the rater address to a wallet bound to the rated agent (owner, or a declared agent wallet). A payment to a separate x402 `payTo` that is not a bound wallet is not in this join, nor are payments on other chains. So 728 is a lower bound.
- 97% of raters on Base are not wallets bound to an agent we index, so our ledger cannot see their payments to anyone. Read 0.14% as "grounded among what a payment indexer can see".
- A payment before a rating shows the rater and the agent transacted. It does not show the payment was for the rated interaction.

Source: [Agentic Finance Graph](https://agenticfinancegraph.com), definitions at agenticfinancegraph.com/def. Licence CC BY 4.0. Context: [erc-8004/erc-8004-contracts#99](https://github.com/erc-8004/erc-8004-contracts/issues/99).
