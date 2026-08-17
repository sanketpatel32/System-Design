/**
 * Byte-exact residue fixes for math-corrupted lines the main codemod could
 * not reach (stray LF/CR/FF/TAB from eaten LaTeX escapes inside table rows).
 * Run once: node scripts/fix-residue.mjs
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const FF = "\f";
const TB = "\t";
const LF = "\n";
const CR = "\r";

const fixes = [
  {
    file: "topics/164_exponential_backoff.md",
    from: `| **Equal Jitter** | $T = ${FF}rac{${TB}ext{Base}}{2} + ${TB}ext{random}\\left(0, ${FF}rac{${TB}ext{Base}}{2}${LF}ight)$ | Bounded Spread | High |${LF}| **Decorrelated Jitter** | $T = \\min\\left(${TB}ext{Max}, ${TB}ext{random}\\left(${TB}ext{Initial}, T_{${TB}ext{prev}} ${TB}imes 3${LF}ight)${LF}ight)$ | Dynamic Adaptive Spread | High |`,
    to: "| **Equal Jitter** | T = (Base / 2) + random(0, Base / 2) | Bounded Spread | High |\n| **Decorrelated Jitter** | T = min(Max, random(Initial, T_prev × 3)) | Dynamic Adaptive Spread | High |",
  },
  {
    file: "topics/145_distributed_consensus.md",
    from: "majority of nodes (\u230a N/2 " + CR + "floor + 1) remain operational",
    to: "majority of nodes (\u230aN/2\u230B + 1) remain operational",
  },
];

let failures = 0;
for (const { file, from, to } of fixes) {
  const p = fileURLToPath(new URL(`../${file}`, import.meta.url));
  let s = fs.readFileSync(p, "utf8");
  if (!s.includes(from)) {
    console.error("NOT FOUND in", file);
    failures++;
    continue;
  }
  s = s.replace(from, to);
  fs.writeFileSync(p, s, "utf8");
  console.log("fixed", file);
}
process.exit(failures ? 1 : 0);
