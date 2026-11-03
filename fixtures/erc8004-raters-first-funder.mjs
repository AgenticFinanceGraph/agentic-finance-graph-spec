// First funder of each rater in the 1 Nov grounded-feedback fixture (erc-8004#99 follow-up, 3 Nov 2026).
// Reads the earliest inbound transfer (ETH or ERC-20) to each rater on Base with alchemy_getAssetTransfers, through
// the governor (150 CU a call). Input: raters.txt (one 0x address per line) and rows.json ([{rater, payee, agent_id}]).
// Output JSON on stdout. Run from /opt/afg/pulse. Keys are read inside the process and never printed.
import fs from "node:fs";
import pg from "pg";
import { Governor } from "../lib/governor.mjs";
const env = Object.fromEntries(["/opt/afg/db.env", "/opt/afg/providers.env"].flatMap((f) => { try { return fs.readFileSync(f, "utf8").split(/\r?\n/); } catch { return []; } })
  .filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const pool = new pg.Pool({ host: env.PGHOST || "localhost", port: +(env.PGPORT || 5432), database: env.PGDATABASE || "afg", user: env.PGUSER || "afg", password: env.PGPASSWORD, max: 2 });
const gov = new Governor(pool);
const raters = fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/).map((s) => s.trim().toLowerCase()).filter(Boolean);
const rows = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
async function firstIn(addr) {
  // 3 Nov 2026: only ETH and real tokens by contract address. Spam airdrops copy the USDC name (with Cyrillic letters)
  // and fake a sender of the USDC contract itself, so the earliest "any token" transfer is often spam.
  const REAL = ["0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2", "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42", "0x4200000000000000000000000000000000000006"];
  const call = (p) => gov.run("alchemy", 150, async () => { const x = await fetch(env.ALCHEMY_BASE_HTTP, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "alchemy_getAssetTransfers", params: [Object.assign({ fromBlock: "0x0", toBlock: "latest", toAddress: addr, order: "asc", maxCount: "0x1", withMetadata: true, excludeZeroValue: true }, p)] }) }); const j = await x.json(); if (j.error) throw new Error("rpc error"); return j.result; });
  const a = await call({ category: ["external"] }), b = await call({ category: ["erc20"], contractAddresses: REAL });
  if (a.skipped || a.error || b.skipped || b.error) return { error: (a.skipped || b.skipped) ? "budget" : "rpc" };
  const cands = [...(a.value.transfers || []), ...(b.value.transfers || [])].sort((x, y) => parseInt(x.blockNum, 16) - parseInt(y.blockNum, 16));
  const t = cands[0];
  return t ? { from: String(t.from).toLowerCase(), asset: t.asset, value: t.value, block: parseInt(t.blockNum, 16), at: t.metadata && t.metadata.blockTimestamp, tx: t.hash } : { none: true };
}
const out = {};
for (const a of raters) out[a] = await firstIn(a);
// rows per rater, payees per rater, and whether a rater was first funded by a payee it paid (or by another rater)
const byRater = {};
for (const r of rows) { const k = r.rater.toLowerCase(); (byRater[k] = byRater[k] || { rows: 0, payees: new Set(), agents: new Set() }); byRater[k].rows++; byRater[k].payees.add(String(r.payee).toLowerCase()); byRater[k].agents.add(String(r.agent_id)); }
const funders = {};
for (const [a, f] of Object.entries(out)) if (f.from) (funders[f.from] = funders[f.from] || []).push(a);
const result = raters.map((a) => { const f = out[a]; const b = byRater[a] || { rows: 0, payees: new Set(), agents: new Set() };
  return { rater: a, rows: b.rows, agents: b.agents.size, first_funder: f.from || null, first_in: f.from ? { asset: f.asset, value: f.value, at: f.at, tx: f.tx } : f,
    funder_is_payee_it_paid: f.from ? b.payees.has(f.from) : null, funder_is_another_rater: f.from ? raters.includes(f.from) && f.from !== a : null,
    raters_sharing_funder: f.from ? funders[f.from].length : null }; });
console.log(JSON.stringify({ measured_at: new Date().toISOString(), raters: raters.length, result, shared_funders: Object.entries(funders).filter(([, v]) => v.length > 1).map(([k, v]) => ({ funder: k, raters: v.length })) }, null, 1));
await pool.end();
