# Agentic Finance Graph — the accounting specification for machine money

Software agents now hold and spend stablecoins, and most numbers quoted about them count sign-ups and money passing through. This repository is the open accounting specification behind [Agentic Finance Graph](https://agenticfinancegraph.com), an independent ledger of money held and spent by AI agents on Base.

It says, precisely enough to implement:

- which transfers count as **an agent paying someone**, and which are excluded (money that moved before the agent existed, routing hops passing through);
- which counted money went into **positions the agent still holds** and which **left its control**;
- how an agent is **ranked** from L0 (a registration exists) to L9 (it pays repeat counterparties);
- what a **drain-shaped payment** is;
- the **37 checks** we run on our own data every three hours before a figure is published;
- how a figure is **measured twice** before it is published.

## Contents

| Path | What it is |
|---|---|
| [`SPEC.md`](SPEC.md) | The specification |
| [`definitions/definitions.json`](definitions/definitions.json) | Every published metric definition, verbatim from `/api/def` (244 ids). Frozen once published |
| [`checks/checks.json`](checks/checks.json) | The data-quality checks: what each one tests, how severe a failure is, and its weight |
| [`test-vectors/classified-payments.json`](test-vectors/classified-payments.json) | Real Base transfers with the class our rules gave them, to test an implementation against |

## Why open

A count only becomes a standard when others can reproduce it and argue with it. If your implementation disagrees with ours on a test vector or a live figure, open an issue with the transaction hash. We publish corrections with a date.

## Live data

- Figures: https://agenticfinancegraph.com/api/state
- Definitions: https://agenticfinancegraph.com/api/def
- MCP server (read-only, free): https://agenticfinancegraph.com/mcp — and the [bridge and CLI](https://github.com/AgenticFinanceGraph/agentic-finance-graph-mcp)
- OpenAPI: https://agenticfinancegraph.com/openapi.json

## Work with us

- **Builders:** see [how to contribute](CONTRIBUTING.md) and [where we need help](https://github.com/AgenticFinanceGraph/agentic-finance-graph-mcp/blob/main/CONTRIBUTING.md) — test vectors, independent reproductions, MCP clients, framework adapters. We are open to people who want to join the founding team.
- **Platforms, institutions and investors:** [agenticfinancegraph.com/contact](https://agenticfinancegraph.com/contact)
- **Agents:** `POST https://agenticfinancegraph.com/api/contact` with `{kind, message, reply_to}`.

[X @AgenticGraph](https://x.com/AgenticGraph) · [Telegram](https://t.me/AgenticFinanceGraph) · [agenticfinancegraph@proton.me](mailto:agenticfinancegraph@proton.me) · ERC-8004 agent #95875 on Base

## Licence

CC BY 4.0. Cite as: Agentic Finance Graph, *Accounting specification for machine money*, v0.2 (2026).
