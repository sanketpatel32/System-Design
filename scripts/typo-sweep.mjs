/**
 * Report typographic defect candidates in topics/*.md (outside code fences
 * and inline code): missing spaces, double spaces, space-before-punctuation.
 * Review-only: prints candidates with context; applies nothing.
 * Usage: node scripts/typo-sweep.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const files = fs
  .readdirSync(path.join(ROOT, "topics"))
  .filter((f) => /^\d{3}_.*\.md$/.test(f))
  .sort();

const CAMEL_OK = /(?:[A-Z][a-z]+){2,}/; // assume PascalCase identifiers are intentional

const rules = [
  {
    name: "space before punctuation",
    re: /\S +[,.;:!?](?=\s|$)/g,
    ok: (m) => m[0].startsWith("e.g") || m[0].startsWith("i.e") || /etc\.$/.test(m[0]) || /\.\.\.$/.test(m[0]),
  },
  {
    name: "double space",
    re: /(?<=[a-zA-Z0-9),.]) {2,}(?=[a-zA-Z0-9(])/g,
    ok: () => false,
  },
  {
    name: "missing space after period",
    re: /(?<=[a-z]{3})\.(?=[A-Z][a-z])/g,
    ok: (m) => /e\.g|i\.e|etc|vs|Dr|Mr|Jr|St|No/.test(m[0]) || /\.(com|net|io|org|md|py|ts|js|go)\b/.test(m[0]),
  },
  {
    name: "lowerWord-UpperWord collision",
    re: /(?<=[a-z]{3})(?=[A-Z][a-z]{3})/g,
    ok: (m, line) => CAMEL_OK.test(m.input.slice(Math.max(0, m.index - 20), m.index + 24)),
  },
];

let total = 0;
for (const f of files) {
  const raw = fs.readFileSync(path.join(ROOT, "topics", f), "utf8").replace(/\r\n/g, "\n");
  // strip fenced blocks and inline code
  const cleaned = raw
    .split(/(```[\s\S]*?```)/g)
    .map((seg) => (seg.startsWith("```") ? "" : seg))
    .join("")
    .replace(/`[^`\n]*`/g, "CODE");
  for (const rule of rules) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(cleaned))) {
      if (m.index === rule.re.lastIndex) rule.re.lastIndex++; // zero-width guard
      if (rule.ok(m, cleaned)) continue;
      const ctx = cleaned.slice(Math.max(0, m.index - 45), m.index + 45).replace(/\n/g, "\\n");
      console.log(`${f} [${rule.name}] …${ctx}…`);
      total++;
    }
  }
}
console.log(`\n${total} candidates`);
