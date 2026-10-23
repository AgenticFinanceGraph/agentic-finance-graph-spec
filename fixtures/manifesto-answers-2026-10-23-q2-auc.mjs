// Q2, implementation 2: AUC by explicit rank sums (Mann-Whitney with average ranks for ties),
// plus a 95% percentile bootstrap (1,000 resamples, seed 20261023), as fixed in
// plans/2026-10-23-manifesto-research-preregistration-v1.md. Input: CSV t0,feat,feat_all,paid
import { readFileSync } from "node:fs";

const rows = readFileSync(process.argv[2], "utf8").trim().split(/\r?\n/).slice(1).map((l) => {
  const [t0, feat, featAll, paid] = l.split(",");
  return { t0, feat: +feat, featAll: +featAll, paid: paid === "1" };
});

function auc(xs, key) {
  // average ranks over the score, then U = sum(ranks of positives) - n1(n1+1)/2
  const s = xs.map((r) => ({ v: r[key], p: r.paid })).sort((a, b) => a.v - b.v);
  let i = 0, rankSumPos = 0, n1 = 0;
  while (i < s.length) {
    let j = i; while (j + 1 < s.length && s[j + 1].v === s[i].v) j++;
    const avg = (i + j + 2) / 2; // ranks are 1-based
    for (let k = i; k <= j; k++) if (s[k].p) { rankSumPos += avg; n1++; }
    i = j + 1;
  }
  const n0 = s.length - n1;
  if (!n1 || !n0) return NaN;
  return (rankSumPos - (n1 * (n1 + 1)) / 2) / (n1 * n0);
}

function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

for (const t0 of [...new Set(rows.map((r) => r.t0))].sort().reverse()) {
  // a fixed row order, so the seeded bootstrap gives the same interval on every run
  const xs = rows.filter((r) => r.t0 === t0).sort((a, b) => a.feat - b.feat || a.featAll - b.featAll || (a.paid - b.paid));
  const rnd = mulberry32(20261023);
  const boots = [];
  for (let b = 0; b < 1000; b++) {
    const sample = new Array(xs.length);
    for (let k = 0; k < xs.length; k++) sample[k] = xs[Math.floor(rnd() * xs.length)];
    const a = auc(sample, "feat");
    if (!Number.isNaN(a)) boots.push(a);
  }
  boots.sort((a, b) => a - b);
  const lo = boots[Math.floor(0.025 * boots.length)], hi = boots[Math.ceil(0.975 * boots.length) - 1];
  const main = auc(xs, "feat");
  const verdict = lo > 0.5 ? "better than chance" : hi < 0.5 ? "worse than chance" : "no better than chance";
  console.log(JSON.stringify({
    t0, agents: xs.length, paid: xs.filter((r) => r.paid).length,
    auc_top10_aside: +main.toFixed(4), ci95: [+lo.toFixed(4), +hi.toFixed(4)], resamples_used: boots.length,
    auc_top10_included: +auc(xs, "featAll").toFixed(4), verdict
  }));
}
