#!/usr/bin/env node
// For rows that rule v2 of payment-grounded feedback drops and rows it keeps, read the owner of the rated
// identity at the block of the payment from public Base nodes:
//   dropped row: the identity did not exist yet, so ownerOf(token) must fail at that block;
//   kept row:    ownerOf(token) at that block must be the address that was paid.
// No dependencies, no key; Node 18 or later.
//
//   node fixtures/check-owner-at-payment.mjs fixtures/erc8004-grounded-v2-owner-check-2026-11-16.json [rpc url ...]
//
// Exit code 0 when every row agrees, 1 otherwise.

import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) { console.error("usage: node fixtures/check-owner-at-payment.mjs <rows.json> [rpc url ...]"); process.exit(2); }
const RPCS = process.argv.slice(3).length ? process.argv.slice(3) : ["https://mainnet.base.org", "https://base-rpc.publicnode.com"];
const REGISTRY = "0x8004a169fb4a3325136eb29fa0ceb6d2e539a432";      // ERC-8004 Identity Registry on Base
const rows = JSON.parse(readFileSync(file, "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let id = 1;
async function rpc(url, method, params) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: id++, method, params }), signal: AbortSignal.timeout(15000) });
      if (r.status === 429) { await sleep(1500 * (i + 1)); continue; }
      return await r.json();
    } catch { await sleep(800); }
  }
  return { error: { message: "no answer" } };
}
const pad = (n) => BigInt(n).toString(16).padStart(64, "0");
async function ownerAt(url, token, block) {
  const x = await rpc(url, "eth_call", [{ to: REGISTRY, data: "0x6352211e" + pad(token) }, block]);   // ownerOf(uint256)
  if (x.result && x.result.length >= 66) return { owner: "0x" + x.result.slice(-40).toLowerCase() };
  const msg = x.error ? String(x.error.message || "") + " " + String(x.error.data || "") : "empty";
  if (/missing trie node|not available|historical state|pruned|archive|header not found|no answer/i.test(msg)) return { unavailable: true };
  return { reverted: true };
}
async function blockOf(tx) {
  for (const u of RPCS) { const x = await rpc(u, "eth_getTransactionReceipt", [tx]); if (x.result && x.result.blockNumber) return x.result.blockNumber; }
  return null;
}
let agree = 0, other = 0;
for (const kind of ["dropped", "kept"]) {
  for (const s of rows[kind]) {
    const block = await blockOf(s.payment_tx);
    let res = null;
    if (block) for (const u of RPCS) { const r = await ownerAt(u, s.agent_id, block); if (!r.unavailable) { res = r; break; } }
    const ok = res && (kind === "dropped" ? !!res.reverted : res.owner === s.payee.toLowerCase());
    if (ok) agree++; else { other++; console.log("NOT AGREE", kind, "token", s.agent_id, "block", block ? parseInt(block, 16) : "?", res ? (res.owner || "no such token") : "unread"); }
    await sleep(120);
  }
}
console.log(`rows ${rows.dropped.length + rows.kept.length}: ${agree} agree, ${other} do not`);
process.exit(other ? 1 : 0);
