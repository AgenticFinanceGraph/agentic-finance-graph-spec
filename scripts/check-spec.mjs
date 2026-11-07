// Spec repository consistency checks (spec 1.0 gaps 11, 12 and 16), run in CI.
//  1. Every definition id cited in SPEC.md exists in definitions/definitions.json.
//  2. A superseded id is cited only on a line that says so (version history or "superseded").
//  3. definitions.json's "count" equals the number of definitions it holds.
//  4. The check count stated in README.md equals the number of checks in checks/checks.json.
//  5. (warning only) the export count equals the live count at agenticfinancegraph.com/api/def.
import { readFileSync } from "node:fs";
const fail = [];
const defsDoc = JSON.parse(readFileSync("definitions/definitions.json", "utf8"));
const defs = new Map(defsDoc.definitions.map((d) => [d.id, d]));
if (defsDoc.count !== defsDoc.definitions.length) fail.push(`definitions.json count ${defsDoc.count} but ${defsDoc.definitions.length} definitions`);
const spec = readFileSync("SPEC.md", "utf8").split(/\r?\n/);
let cited = 0;
spec.forEach((line, i) => {
  for (const m of line.matchAll(/`([a-z0-9_]+(?:\.[a-z0-9_]+)+\.v\d+)`/g)) {
    cited++;
    const id = m[1], d = defs.get(id);
    if (!d) fail.push(`SPEC.md:${i + 1} cites ${id}, which is not in definitions.json`);
    else if (d.superseded_by && !/supersed|version history/i.test(line)) fail.push(`SPEC.md:${i + 1} cites superseded ${id} (now ${[].concat(d.superseded_by).join(", ")}) outside a history line`);
  }
});
const checksDoc = JSON.parse(readFileSync("checks/checks.json", "utf8"));
const nChecks = (checksDoc.checks || checksDoc).length;
const readme = readFileSync("README.md", "utf8");
for (const m of readme.matchAll(/\*\*(\d+) checks\*\*|(\d+) checks/g)) {
  const n = Number(m[1] || m[2]);
  if (n !== nChecks) fail.push(`README.md states ${n} checks; checks.json holds ${nChecks}`);
}
try {
  const r = await fetch("https://agenticfinancegraph.com/api/def");
  if (r.ok) { const live = (await r.json()).definitions.length; if (live !== defsDoc.definitions.length) console.log(`::warning::export holds ${defsDoc.definitions.length} definitions, the live site ${live}: re-export at the next release`); }
} catch (e) { console.log("::warning::live definition count not reachable: " + e.message); }
console.log(`checked ${cited} citations in SPEC.md, ${defs.size} definitions, ${nChecks} checks`);
if (fail.length) { for (const f of fail) console.error("FAIL " + f); process.exit(1); }
console.log("spec checks ok");
