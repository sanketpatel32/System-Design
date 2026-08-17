/**
 * One-off migration: convert LaTeX math ($...$ / $$...$$) in topics/*.md to
 * readable Unicode plain text. The site has no KaTeX pipeline, so raw LaTeX
 * was rendering as literal source. Also repairs control-character corruption
 * left by an escape-eating process (\t -> TAB, \f -> FF, \a -> BEL, \b -> BS).
 *
 * Usage: node scripts/normalize-math.mjs
 * Writes scripts/math-report.json with every conversion for review.
 */
import fs from "node:fs";
import path from "node:path";

const TOPICS_DIR = path.join(process.cwd(), "topics");

// Control chars that ate the backslash of their LaTeX command.
const CTRL_REPAIR = {
  "\x07": "\\a", // \approx
  "\x08": "\\b", // \begin
  "\x0c": "\\f", // \frac
  "\x09": "\\t", // \text
};

const SYMBOLS = {
  "\\approx": "≈", "\\times": "×", "\\cdot": "·", "\\ast": "*",
  "\\quad": " ", "\\qquad": "  ", "\\implies": "⇒", "\\Longrightarrow": "⇒",
  "\\longrightarrow": "→", "\\parallel": "∥", "\\perp": "⊥", "\\angle": "∠",
  "\\leq": "≤", "\\le": "≤", "\\geq": "≥", "\\ge": "≥",
  "\\neq": "≠", "\\ne": "≠", "\\pm": "±", "\\mp": "∓",
  "\\infty": "∞", "\\to": "→", "\\rightarrow": "→", "\\Rightarrow": "⇒",
  "\\leftarrow": "←", "\\leftrightarrow": "↔", "\\mapsto": "↦",
  "\\sum": "Σ", "\\prod": "Π", "\\int": "∫", "\\partial": "∂", "\\nabla": "∇",
  "\\cup": "∪", "\\cap": "∩", "\\in": "∈", "\\notin": "∉", "\\subset": "⊂",
  "\\subseteq": "⊆", "\\supset": "⊃", "\\emptyset": "∅", "\\varnothing": "∅",
  "\\equiv": "≡", "\\sim": "~", "\\simeq": "≃", "\\propto": "∝",
  "\\ll": "≪", "\\gg": "≫",
  "\\ldots": "…", "\\dots": "…", "\\cdots": "⋯",
  "\\lfloor": "⌊", "\\rfloor": "⌋", "\\lceil": "⌈", "\\rceil": "⌉",
  "\\langle": "⟨", "\\rangle": "⟩", "\\vert": "|", "\\lvert": "|", "\\rvert": "|",
  "\\oplus": "⊕", "\\otimes": "⊗",
  "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ",
  "\\epsilon": "ε", "\\varepsilon": "ε", "\\zeta": "ζ", "\\eta": "η",
  "\\theta": "θ", "\\iota": "ι", "\\kappa": "κ", "\\lambda": "λ",
  "\\mu": "µ", "\\nu": "ν", "\\xi": "ξ", "\\pi": "π", "\\rho": "ρ",
  "\\sigma": "σ", "\\tau": "τ", "\\upsilon": "υ", "\\phi": "φ", "\\varphi": "φ",
  "\\chi": "χ", "\\psi": "ψ", "\\omega": "ω",
  "\\Gamma": "Γ", "\\Delta": "Δ", "\\Theta": "Θ", "\\Lambda": "Λ",
  "\\Xi": "Ξ", "\\Pi": "Π", "\\Sigma": "Σ", "\\Phi": "Φ", "\\Psi": "Ψ", "\\Omega": "Ω",
  "\\log": "log", "\\ln": "ln", "\\lg": "lg", "\\exp": "exp",
  "\\min": "min", "\\max": "max", "\\lim": "lim", "\\bmod": "mod",
  "\\%": "%", "\\_": "_", "\\&": "&", "\\#": "#", "\\$": "$",
};

const SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻", "-": "⁻", "n": "ⁿ", "m": "ᵐ", "k": "ᵏ", "i": "ⁱ", "j": "ʲ", "o": "º" };
const SUB = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", "+": "₊", "-": "₋", "n": "ₙ", "m": "ₘ", "k": "ₖ", "i": "ᵢ", "j": "ⱼ", "a": "ₐ", "e": "ₑ", "o": "ₒ", "r": "ᵣ", "u": "ᵤ", "v": "ᵥ", "x": "ₓ" };

const leftoverCommands = new Set();
const report = { converted: [], skipped: [], leftovers: [] };

/** Read a brace-balanced {group} starting at str[i] (str[i] === "{"). */
function readGroup(str, i) {
  if (str[i] !== "{") return null;
  let depth = 0;
  for (let j = i; j < str.length; j++) {
    if (str[j] === "{" && str[j - 1] !== "\\") depth++;
    else if (str[j] === "}" && str[j - 1] !== "\\") {
      depth--;
      if (depth === 0) return { content: str.slice(i + 1, j), end: j + 1 };
    }
  }
  return null;
}

/** Wrap in parens when content is a multi-token expression. */
function parenIfComplex(s) {
  return /[\s×·+\-≈]/.test(s.trim()) ? `(${s.trim()})` : s.trim();
}

function toSup(s) {
  return [...s].every((c) => SUP[c]) ? [...s].map((c) => SUP[c]).join("") : `^${s}`;
}
function toSub(s) {
  return [...s].every((c) => SUB[c]) ? [...s].map((c) => SUB[c]).join("") : `_${s}`;
}

/**
 * Convert a LaTeX math string to Unicode plain text.
 * `display` toggles display-math conventions (leading \text{} becomes bold).
 */
function convertMath(src, display) {
  let s = src;
  for (const [ctrl, latex] of Object.entries(CTRL_REPAIR)) {
    s = s.split(ctrl).join(latex);
  }

  // \text{..} / \mathrm{..} -> content; leading one in display math -> bold
  s = s.replace(/\\(?:text|mathrm|textbf)\s*(\{)/g, (_m, brace, off) => {
    return _m; // placeholder, handled below with positions
  });
  // simpler: iterative brace-matched replacement
  for (;;) {
    const m = s.match(/\\(?:text|mathrm)\s*\{/);
    if (!m) break;
    const g = readGroup(s, m.index + m[0].length - 1);
    if (!g) break;
    s = s.slice(0, m.index) + g.content + s.slice(g.end);
  }
  // \mathbf{..} -> **bold**
  for (;;) {
    const m = s.match(/\\mathbf\s*\{/);
    if (!m) break;
    const g = readGroup(s, m.index + m[0].length - 1);
    if (!g) break;
    s = s.slice(0, m.index) + `**${g.content}**` + s.slice(g.end);
  }
  // \frac{A}{B} -> A / B (parens when complex)
  for (;;) {
    const m = s.match(/\\(?:d)?frac\s*\{/);
    if (!m) break;
    const a = readGroup(s, m.index + m[0].length - 1);
    if (!a) break;
    const bm = s.slice(a.end).match(/^\s*{/);
    if (!bm) { s = s.slice(0, m.index) + "/ " + s.slice(m.index + m[0].length); continue; }
    const b = readGroup(s, a.end);
    if (!b) break;
    s = s.slice(0, m.index) + `${parenIfComplex(a.content)} / ${parenIfComplex(b.content)}` + s.slice(b.end);
  }
  // \sqrt{A} -> √(A)
  for (;;) {
    const m = s.match(/\\sqrt\s*\{/);
    if (!m) break;
    const g = readGroup(s, m.index + m[0].length - 1);
    if (!g) break;
    s = s.slice(0, m.index) + `√(${g.content})` + s.slice(g.end);
  }
  // \overline{A} -> A (overline doesn't survive plain text; drop)
  s = s.replace(/\\overline\s*\{([^{}]*)\}/g, "$1");

  // \begin{cases} A & cond \\ B & cond \end{cases} -> "A (cond), B (cond)"
  // (tolerates a missing backslash on \end — one file lost it in the corruption)
  s = s.replace(
    /\\begin\{cases\}([\s\S]*?)(?:\\end\{cases\}|end\{cases\})/g,
    (_m, inner) =>
      inner
        .replace(/\\\{2}|\\\n|\n/g, "\u0000")
        .split("\u0000")
        .map((row) => row.trim())
        .filter(Boolean)
        .map((row) => row.replace(/\s*&\s*/, " (").trim() + ")")
        .join(", "),
  );

  // delimiters / spacing
  s = s.replace(/\\left|\\right|\\big|\\Big|\\bigg|\\Bigg/g, "");
  s = s.replace(/\\[,;:!]/g, " ").replace(/\\ /g, " ");
  s = s.replace(/\\\\/g, ";  ");

  // superscripts / subscripts
  s = s.replace(/\^\{([^{}]*)\}/g, (_m, inner) => toSup(inner));
  s = s.replace(/\^([A-Za-z0-9+\-])/g, (_m, c) => (SUP[c] ? SUP[c] : `^${c}`));
  s = s.replace(/_\{([^{}]*)\}/g, (_m, inner) => toSub(inner));
  s = s.replace(/_([A-Za-z0-9+\-])/g, (_m, c) => (SUB[c] ? SUB[c] : `_${c}`));

  // named symbols (longest first so \leq wins over \le)
  const names = Object.keys(SYMBOLS).sort((a, b) => b.length - a.length);
  for (const n of names) s = s.split(n).join(SYMBOLS[n]);

  // bare {,} left from loose grouping
  s = s.replace(/([A-Za-z0-9])\{([A-Za-z0-9])/, "$1 $2").replace(/[{}]/g, "");

  // report unconverted commands for manual follow-up
  for (const m of s.matchAll(/\\[A-Za-z]+/g)) leftoverCommands.add(m[0]);

  s = s.replace(/[ \t]{2,}/g, " ").trim();

  // bold a leading label in display math: "Daily Storage = ..." -> "**Daily Storage** = ..."
  if (display) {
    s = s.replace(/^([A-Za-z0-9][A-Za-z0-9 '%\-]{2,60}?)(\s*=\s*)/, "**$1**$2");
  }
  return s;
}

/** Prose words that signal a false-positive $ pair (currency, not math). */
function looksLikeProse(content) {
  // Only skip when it reads as prose AND carries no LaTeX commands —
  // real math often contains unit words ("bytes per tweet") inside \text{}.
  if (/\\[A-Za-z]+/.test(content)) return false;
  return /\b(per|hour|month|year|and|the|for|with|from|of|vs)\b/i.test(content);
}

function transformSegment(seg) {
  // display math first
  seg = seg.replace(/\$\$([\s\S]+?)\$\$/g, (_m, inner) => {
    const out = convertMath(inner, true);
    report.converted.push({ from: `$$${inner}$$`, to: out });
    return out;
  });
  // inline math — content may contain escaped chars like \$ (currency in math)
  seg = seg.replace(/(^|[^\\])\$((?:\\.|[^$\n])+?)\$/g, (whole, pre, inner) => {
    if (looksLikeProse(inner)) {
      report.skipped.push({ file: currentFile, span: whole });
      return whole;
    }
    const out = convertMath(inner, false);
    report.converted.push({ from: `$${inner}$`, to: out });
    return pre + out;
  });
  return seg;
}

let currentFile = "";
const files = fs.readdirSync(TOPICS_DIR).filter((f) => /^\d{3}_.*\.md$/.test(f)).sort();
let touched = 0;

for (const f of files) {
  currentFile = f;
  const p = path.join(TOPICS_DIR, f);
  const src = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  // split into fence / non-fence segments; only transform outside fences
  const parts = src.split(/(```[\s\S]*?```)/g);
  const out = parts.map((part) => (part.startsWith("```") ? part : transformSegment(part))).join("");
  if (out !== src) {
    fs.writeFileSync(p, out, "utf8");
    touched++;
  }
}

report.leftovers = [...leftoverCommands];
fs.writeFileSync(
  path.join(process.cwd(), "scripts", "math-report.json"),
  JSON.stringify(report, null, 2),
  "utf8",
);
console.log(`files touched: ${touched}/${files.length}`);
console.log(`conversions: ${report.converted.length}, skipped (currency?): ${report.skipped.length}`);
console.log(`leftover commands: ${report.leftovers.join(" ") || "(none)"}`);
