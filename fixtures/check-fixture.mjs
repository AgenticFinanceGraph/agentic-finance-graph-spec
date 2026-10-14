#!/usr/bin/env node
// Recount a fixture's published figures from the CSV alone, and check the
// invariants every row must meet. No dependencies; Node 18 or later.
//
//   node fixtures/check-fixture.mjs fixtures/erc8004-base-grounded-feedback-2026-10-14.csv
//
// Exit code 0 when every row passes, 1 when any invariant fails.

import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node fixtures/check-fixture.mjs <fixture.csv>");
  process.exit(2);
}

// RFC 4180 parser: quoted fields, doubled quotes, commas and newlines inside quotes.
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const [header, ...body] = parseCsv(readFileSync(file, "utf8"));
const col = Object.fromEntries(header.map((h, i) => [h, i]));
const required = [
  "feedback_id", "agent_id", "rater", "feedback_at", "feedback_tx",
  "payment_tx", "payee", "amount_usd", "asset", "rail", "payment_at", "feedback_uri",
];
const missing = required.filter((c) => !(c in col));
if (missing.length) {
  console.error(`missing columns: ${missing.join(", ")}`);
  process.exit(1);
}

const get = (r, c) => r[col[c]];
const failures = [];
let failureCount = 0;
const fail = (n, why) => {
  failureCount++;
  if (failures.length < 20) failures.push(`row ${n}: ${why}`);
};
const hash = /^0x[0-9a-f]{64}$/;
const addr = /^0x[0-9a-f]{40}$/;
const caip10Base = /^eip155:8453:0x[0-9a-f]{40}$/;

body.forEach((r, i) => {
  const n = i + 2; // line number in the file, header is line 1
  if (r.length !== header.length) return fail(n, `${r.length} fields, expected ${header.length}`);
  if (!hash.test(get(r, "feedback_tx"))) fail(n, "feedback_tx is not a transaction hash");
  if (!hash.test(get(r, "payment_tx"))) fail(n, "payment_tx is not a transaction hash");
  if (!addr.test(get(r, "rater"))) fail(n, "rater is not a lower-case address");
  if (!caip10Base.test(get(r, "payee"))) fail(n, "payee is not a CAIP-10 address on Base (eip155:8453)");
  if (!["x402", "usdc_transfer"].includes(get(r, "rail"))) fail(n, `unknown rail "${get(r, "rail")}"`);
  const usd = Number(get(r, "amount_usd"));
  if (!(usd > 0)) fail(n, "amount_usd is not positive");
  const paid = Date.parse(get(r, "payment_at").replace(" ", "T").replace(/\+00$/, "Z"));
  const rated = Date.parse(get(r, "feedback_at").replace(" ", "T").replace(/\+00$/, "Z"));
  if (!(paid < rated)) fail(n, "payment_at is not before feedback_at");
});

const distinct = (c) => new Set(body.map((r) => get(r, c))).size;
const amounts = body.map((r) => Number(get(r, "amount_usd"))).sort((a, b) => a - b);
const median = amounts.length % 2
  ? amounts[(amounts.length - 1) / 2]
  : (amounts[amounts.length / 2 - 1] + amounts[amounts.length / 2]) / 2;
const rails = {};
for (const r of body) rails[get(r, "rail")] = (rails[get(r, "rail")] || 0) + 1;
const assets = {};
for (const r of body) assets[get(r, "asset")] = (assets[get(r, "asset")] || 0) + 1;

console.log(`file            ${file}`);
console.log(`rows            ${body.length}`);
console.log(`distinct feedback_tx ${distinct("feedback_tx")}`);
console.log(`raters          ${distinct("rater")}`);
console.log(`agents          ${distinct("agent_id")}`);
console.log(`payment txs     ${distinct("payment_tx")}`);
console.log(`rail            ${Object.entries(rails).map(([k, v]) => `${k} ${v}`).join(", ")}`);
console.log(`asset           ${Object.entries(assets).map(([k, v]) => `${k} ${v}`).join(", ")}`);
console.log(`median payment  $${median.toFixed(2)}`);
console.log(`with a feedback URI ${body.filter((r) => get(r, "feedback_uri") !== "").length}`);

if (failureCount) {
  console.error(`\n${failureCount} invariant failure(s), first ${failures.length} shown:`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log("\nall rows pass: payment before rating, Base CAIP-10 payee, known rail, positive amount");
