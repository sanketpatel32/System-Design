/**
 * Corpus hygiene: normalize CRLF → LF and strip trailing whitespace outside
 * fenced diagram blocks (diagram alignment is preserved untouched).
 * Usage: node scripts/hygiene.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const dir = path.join(ROOT, "topics");
const files = fs.readdirSync(dir).filter((f) => /^\d{3}_.*\.md$/.test(f)).sort();

let touched = 0;
for (const f of files) {
  const raw = fs.readFileSync(path.join(dir, f), "utf8");
  const lf = raw.replace(/\r\n/g, "\n");
  const cleaned = lf
    .split(/(```[\s\S]*?```)/g)
    .map((seg) => (seg.startsWith("```") ? seg : seg.replace(/[ \t]+$/gm, "")))
    .join("");
  const out = cleaned.endsWith("\n") ? cleaned : cleaned + "\n";
  if (out !== raw) {
    fs.writeFileSync(path.join(dir, f), out, "utf8");
    touched++;
  }
}
console.log(`hygiene applied to ${touched}/${files.length} files`);
