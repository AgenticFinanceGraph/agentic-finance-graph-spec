#!/usr/bin/env node
// Check that every relative link in the repository's markdown files points to a
// file or folder that exists. External links (http, https, mailto) and in-page
// anchors are skipped. No dependencies; Node 18 or later.
//
//   node scripts/check-links.mjs [file.md ...]   (default: README.md SPEC.md CHANGELOG.md CONTRIBUTING.md)

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const files = process.argv.slice(2);
if (files.length === 0) files.push("README.md", "SPEC.md", "CHANGELOG.md", "CONTRIBUTING.md");

let broken = 0;
for (const file of files) {
  if (!existsSync(file)) {
    console.error(`${file}: file not found`);
    broken++;
    continue;
  }
  const text = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, ""); // ignore code blocks
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const path = decodeURIComponent(target.split("#")[0]);
    if (!existsSync(join(dirname(file), path))) {
      console.error(`${file}: broken link to ${target}`);
      broken++;
    }
  }
}

if (broken) {
  console.error(`\n${broken} broken link(s)`);
  process.exit(1);
}
console.log(`links ok in ${files.join(", ")}`);
