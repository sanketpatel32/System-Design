/** Round 2: trailing whitespace, repeated words, comma spacing, line endings, final newline. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const dir = path.join(ROOT, "topics");
const files = fs.readdirSync(dir).filter((f) => /^\d{3}_.*\.md$/.test(f)).sort();

let issues = 0;
for (const f of files) {
  const raw = fs.readFileSync(path.join(dir, f), "utf8");
  const lf = raw.replace(/\r\n/g, "\n");
  const outsideFences = lf
    .split(/(```[\s\S]*?```)/g)
    .map((s) => (s.startsWith("```") ? "" : s))
    .join("");

  const trailing = (outsideFences.match(/[^ \n][ \t]+$/gm) || []).length;
  const repeated = [
    ...outsideFences.matchAll(/\b(the|is|a|to|of|and|in|for|that|with|be|are|it|as|on|or|an|not|can|will|from|by|data|cache|request|server|system)\b \1\b/gi),
  ].length;
  const comma = (outsideFences.match(/,[A-Za-z]/g) || []).length;
  const crlf = raw.includes("\r\n");
  const finalNl = raw.endsWith("\n");

  if (trailing || repeated || comma || !finalNl) {
    console.log(`${f}: trailing=${trailing} repeated=${repeated} comma=${comma} finalNewline=${finalNl}`);
    issues++;
  }
  if (crlf) console.log(`${f}: CRLF`);
}
console.log(`\n${issues} files with issues; CRLF files: ${files.filter((f) => fs.readFileSync(path.join(dir, f), "utf8").includes("\r\n")).length}`);
