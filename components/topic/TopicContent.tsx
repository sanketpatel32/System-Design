import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Lightbulb, Clock } from "lucide-react";
import type { Topic } from "@/lib/content";
import { DiagramBlock } from "./DiagramBlock";
import { TableOfContents } from "./TableOfContents";

const customComponents = {
  a: ({ href, children, ...props }: React.ComponentPropsWithoutRef<"a">) => {
    if (!href) return <a {...props}>{children}</a>;

    const topicMatch = href.match(/(?:topics\/)?(\d{3})_(.+)\.md(?:#(.*))?$/);
    if (topicMatch) {
      const slug = topicMatch[2];
      const hash = topicMatch[3] ? `#${topicMatch[3]}` : "";
      return (
        <Link href={`/topics/${slug}${hash}`} className="font-medium text-accent hover:underline">
          {children}
        </Link>
      );
    }

    if (href.startsWith("http://") || href.startsWith("https://")) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent hover:underline"
          {...props}
        >
          {children}
        </a>
      );
    }

    if (href.startsWith("/")) {
      return (
        <Link href={href} className="font-medium text-accent hover:underline">
          {children}
        </Link>
      );
    }

    return (
      <a href={href} className="font-medium text-accent hover:underline" {...props}>
        {children}
      </a>
    );
  },
};

/** Turn a heading string into a URL-safe fragment id. */
function headingId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Rough reading-time estimate: 220 wpm over the body text (diagrams excluded). */
function readingMinutes(topic: Topic): number {
  const text = [
    topic.intro,
    ...topic.sections.map((s) => s.body),
    topic.takeaway ?? "",
  ]
    .join(" ")
    // Strip fenced code blocks (diagrams) so ASCII art doesn't inflate the count.
    .replace(/```[\s\S]*?```/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/**
 * Split a section body into alternating prose / diagram chunks.
 * Diagrams (``` fences) are rendered with DiagramBlock; everything else is markdown.
 */
function renderBody(body: string) {
  const parts: { type: "md" | "code"; content: string }[] = [];
  const re = /```[^\n]*\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    if (m.index > last) {
      parts.push({ type: "md", content: body.slice(last, m.index) });
    }
    parts.push({ type: "code", content: m[1].replace(/\n$/, "") });
    last = re.lastIndex;
  }
  if (last < body.length) {
    parts.push({ type: "md", content: body.slice(last) });
  }
  return parts.map((p, i) =>
    p.type === "code" ? (
      <DiagramBlock key={i} code={p.content} />
    ) : (
      <div key={i} className="prose-atlas">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={customComponents}>
          {p.content}
        </ReactMarkdown>
      </div>
    )
  );
}

export function TopicContent({ topic }: { topic: Topic }) {
  const takeawaySection = topic.sections.find((s) =>
    /key\s*takeaway/i.test(s.heading)
  );
  const otherSections = topic.sections.filter(
    (s) => !/key\s*takeaway/i.test(s.heading)
  );

  const minutes = readingMinutes(topic);

  const tocItems = otherSections
    .map((s) => ({ id: headingId(s.heading), label: s.heading }))
    // Deduplicate ids in case two sections share a heading.
    .filter(
      (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx
    );

  return (
    <div className="space-y-10">
      {/* Reading-time meta */}
      <p className="inline-flex items-center gap-1.5 text-sm text-ink-3">
        <Clock size={14} aria-hidden />
        {minutes} min read
      </p>

      {topic.intro && (
        <p className="text-xl leading-relaxed text-ink-2">{topic.intro}</p>
      )}

      <div className="flex gap-10">
        {/* Main column */}
        <div className="min-w-0 flex-1 space-y-10">
          {otherSections.map((section) => {
            const id = headingId(section.heading);
            return (
              <section key={section.heading} id={id} className="scroll-mt-24">
                <h2 className="mb-4 border-b border-rule pb-2 text-2xl font-bold tracking-tight">
                  {section.heading}
                </h2>
                <div className="space-y-4">{renderBody(section.body)}</div>
              </section>
            );
          })}

          {takeawaySection && topic.takeaway && (
            <aside
              aria-labelledby="takeaway-heading"
              className="rounded-xl border border-accent/30 bg-accent/5 p-6"
            >
              <h2
                id="takeaway-heading"
                className="mb-2 flex items-center gap-2 text-lg font-bold text-accent-2"
              >
                <Lightbulb size={18} aria-hidden />
                Key takeaway
              </h2>
              <p className="text-lg leading-relaxed text-ink">{topic.takeaway}</p>
            </aside>
          )}
        </div>

        {/* Sticky TOC rail */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <TableOfContents items={tocItems} />
        </aside>
      </div>
    </div>
  );
}
