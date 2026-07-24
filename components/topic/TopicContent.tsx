"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Lightbulb, Hash, ChevronDown, List } from "lucide-react";
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
  table: ({ children }: React.ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-rule bg-paper-2/50 shadow-xs">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: React.ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-paper-3/70 border-b border-rule">{children}</thead>
  ),
  tbody: ({ children }: React.ComponentPropsWithoutRef<"tbody">) => (
    <tbody className="divide-y divide-rule/60">{children}</tbody>
  ),
  tr: ({ children }: React.ComponentPropsWithoutRef<"tr">) => (
    <tr className="hover:bg-paper-3/40 transition-colors">{children}</tr>
  ),
  th: ({ children }: React.ComponentPropsWithoutRef<"th">) => (
    <th className="px-4 py-3 font-semibold text-ink text-xs uppercase tracking-wider">{children}</th>
  ),
  td: ({ children }: React.ComponentPropsWithoutRef<"td">) => (
    <td className="px-4 py-3 text-ink-2 align-top leading-relaxed">{children}</td>
  ),
  blockquote: ({ children }: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="my-6 border-l-4 border-accent bg-accent/5 p-4 rounded-r-xl text-ink-2 italic font-normal">
      {children}
    </blockquote>
  ),
};

/** Turn a heading string into a URL-safe fragment id. */
function headingId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const takeawaySection = topic.sections.find((s) =>
    /key\s*takeaway/i.test(s.heading)
  );
  const otherSections = topic.sections.filter(
    (s) => !/key\s*takeaway/i.test(s.heading)
  );

  const tocItems = otherSections
    .map((s) => ({ id: headingId(s.heading), label: s.heading }))
    .filter(
      (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx
    );

  return (
    <div className="space-y-10">
      {/* Intro overview */}
      {topic.intro && (
        <div className="prose-atlas border-b border-rule/60 pb-8 text-xl leading-relaxed text-ink-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={customComponents}>
            {topic.intro}
          </ReactMarkdown>
        </div>
      )}

      {/* Mobile outline / TOC dropdown */}
      {tocItems.length >= 3 && (
        <div className="rounded-xl border border-rule bg-paper-2/60 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTocOpen((o) => !o)}
            className="flex w-full items-center justify-between p-4 text-left font-medium text-ink"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <List size={16} className="text-accent" />
              On this page ({tocItems.length} sections)
            </span>
            <ChevronDown
              size={18}
              className={`text-ink-3 transition-transform ${
                mobileTocOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {mobileTocOpen && (
            <div className="border-t border-rule px-4 py-3">
              <ul className="space-y-2">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={() => setMobileTocOpen(false)}
                      className="block text-sm text-ink-2 hover:text-accent"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-12">
        {/* Main column */}
        <div className="min-w-0 flex-1 space-y-12">
          {otherSections.map((section) => {
            const id = headingId(section.heading);
            return (
              <section key={section.heading} id={id} className="scroll-mt-24">
                <h2 className="group mb-4 flex items-center justify-between border-b border-rule pb-2.5 text-2xl font-bold tracking-tight text-ink">
                  <span>{section.heading}</span>
                  <a
                    href={`#${id}`}
                    className="opacity-0 group-hover:opacity-100 text-ink-3 hover:text-accent transition-opacity"
                    aria-label={`Link to section ${section.heading}`}
                  >
                    <Hash size={18} />
                  </a>
                </h2>
                <div className="space-y-4">{renderBody(section.body)}</div>
              </section>
            );
          })}

          {takeawaySection && (topic.takeaway || takeawaySection.body) && (
            <aside
              aria-labelledby="takeaway-heading"
              className="mt-12 rounded-2xl border border-accent/30 bg-accent/5 p-7 shadow-sm elev-sm"
            >
              <h2
                id="takeaway-heading"
                className="mb-3 flex items-center gap-2.5 text-xl font-bold text-accent"
              >
                <Lightbulb size={20} className="text-accent" aria-hidden />
                Key Takeaway
              </h2>
              <div className="prose-atlas text-lg leading-relaxed text-ink">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={customComponents}>
                  {topic.takeaway ?? takeawaySection.body}
                </ReactMarkdown>
              </div>
            </aside>
          )}
        </div>

        {/* Sticky TOC rail */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <TableOfContents items={tocItems} />
        </aside>
      </div>
    </div>
  );
}
