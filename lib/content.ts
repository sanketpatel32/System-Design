import fs from "node:fs";
import path from "node:path";

export interface TopicSection {
  heading: string;
  body: string;
}

export interface Topic {
  id: number;
  slug: string;
  filename: string;
  title: string;
  category: string;
  intro: string;
  sections: TopicSection[];
  takeaway: string | null;
  diagrams: string[];
  raw: string;
}

export interface Category {
  name: string;
  slug: string;
  count: number;
  startId: number;
  topicIds: number[];
}

const ROOT = path.join(process.cwd());
const TOPICS_DIR = path.join(ROOT, "topics");
const TOPIC_RE = /^(\d{3})_(.+)\.md$/;

/** Slugify a category / display name into a URL-safe key. */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Extract the Category value from a `> **Category:** X` blockquote line. */
function extractCategory(md: string): string {
  const m = md.match(/^>\s*\*\*Category:\*\*\s*(.+?)\s*$/m);
  return m ? m[1].trim() : "Uncategorised";
}

/** Pull out fenced ``` code blocks — these are the ASCII architecture diagrams. */
function extractDiagrams(md: string): string[] {
  const out: string[] = [];
  const re = /```[^\n]*\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) out.push(m[1].replace(/\n$/, ""));
  return out;
}

/**
 * Parse one topic file into structured sections.
 * Sections are `### Heading` + the body that follows until the next heading.
 * The `Key takeaway` section is pulled out into its own field.
 */
function parseSections(md: string): {
  intro: string;
  sections: TopicSection[];
  takeaway: string | null;
} {
  // Drop the H1 title line and the category blockquote so they don't pollute intro.
  const stripped = md
    .replace(/^# .+\n+/, "")
    .replace(/^>\s*\*\*Category:\*\*.+\n+/, "")
    .replace(/^---\n+/, "");

  const lines = stripped.split("\n");
  const intro: string[] = [];
  const sections: TopicSection[] = [];
  let current: TopicSection | null = null;
  let takeaway: string | null = null;

  for (const line of lines) {
    const h = line.match(/^###\s+(.+)$/);
    if (h) {
      const heading = h[1].trim();
      current = { heading, body: "" };
      if (/key\s*takeaway/i.test(heading)) {
        // collected separately but also kept in sections for rendering
      }
      sections.push(current);
      continue;
    }
    if (current) {
      current.body += line + "\n";
    } else {
      intro.push(line);
    }
  }

  const takeawaySection = sections.find((s) =>
    /key\s*takeaway/i.test(s.heading)
  );
  if (takeawaySection) {
    takeaway = takeawaySection.body.trim();
  }

  return {
    intro: intro.join("\n").trim(),
    sections: sections.map((s) => ({
      ...s,
      body: s.body.trim(),
    })),
    takeaway,
  };
}

let _topics: Topic[] | null = null;
let _categories: Category[] | null = null;

function loadAll(): void {
  if (_topics) return;
  const files = fs.existsSync(TOPICS_DIR)
    ? fs
        .readdirSync(TOPICS_DIR)
        .filter((f) => TOPIC_RE.test(f))
        .sort()
    : [];

  const topics: Topic[] = files.map((filename) => {
    const match = filename.match(TOPIC_RE)!;
    const id = parseInt(match[1], 10);
    const slug = match[2];
    const raw = fs.readFileSync(path.join(TOPICS_DIR, filename), "utf8");
    const title = (raw.match(/^# (.+)$/m)?.[1] ?? slug).trim();
    const category = extractCategory(raw);
    const diagrams = extractDiagrams(raw);
    const { intro, sections, takeaway } = parseSections(raw);
    return {
      id,
      slug,
      filename,
      title,
      category,
      intro,
      sections,
      takeaway,
      diagrams,
      raw,
    };
  });

  // Preserve the learning order from 000_list.md where possible; fall back to id order.
  _topics = topics;
  _categories = buildCategories(topics);
}

/**
 * Build the category list in learning order by scanning 000_list.md for
 * `## <Category>` headers, then mapping each topic to its category via the
 * `> **Category:** X` line in the file.
 */
function buildCategories(topics: Topic[]): Category[] {
  const listPath = path.join(ROOT, "000_list.md");
  const listRaw = fs.existsSync(listPath)
    ? fs.readFileSync(listPath, "utf8")
    : "";
  const orderedNames: string[] = [];
  for (const line of listRaw.split("\n")) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) orderedNames.push(m[1].trim());
  }

  const byCategory = new Map<string, Topic[]>();
  for (const t of topics) {
    const arr = byCategory.get(t.category) ?? [];
    arr.push(t);
    byCategory.set(t.category, arr);
  }

  // Categories present in files but not in the list go last, sorted.
  const extras = [...byCategory.keys()]
    .filter((c) => !orderedNames.includes(c))
    .sort();

  const ordered = [...orderedNames.filter((c) => byCategory.has(c)), ...extras];

  return ordered.map((name, idx) => {
    const items = (byCategory.get(name) ?? []).sort((a, b) => a.id - b.id);
    return {
      name,
      slug: slugify(name),
      count: items.length,
      startId: items[0]?.id ?? 0,
      topicIds: items.map((t) => t.id),
      order: idx,
    } as Category & { order: number };
  }).map(({ order, ...c }) => c);
}

export function getAllTopics(): Topic[] {
  loadAll();
  return _topics!;
}

export function getAllCategories(): Category[] {
  loadAll();
  return _categories!;
}

export function getTopicById(id: number): Topic | undefined {
  loadAll();
  return _topics!.find((t) => t.id === id);
}

export function getTopicBySlug(slug: string): Topic | undefined {
  loadAll();
  return _topics!.find((t) => t.slug === slug);
}

export function getTopicNeighbors(id: number): {
  prev: Topic | null;
  next: Topic | null;
} {
  loadAll();
  const list = _topics!;
  const idx = list.findIndex((t) => t.id === id);
  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null,
  };
}

export function getCategoryBySlug(slug: string): Category | undefined {
  loadAll();
  return _categories!.find((c) => c.slug === slug);
}

export function getStats(): {
  total: number;
  categories: number;
  diagrams: number;
  takeaways: number;
} {
  loadAll();
  const topics = _topics!;
  return {
    total: topics.length,
    categories: _categories!.length,
    diagrams: topics.reduce((n, t) => n + t.diagrams.length, 0),
    takeaways: topics.filter((t) => t.takeaway).length,
  };
}
