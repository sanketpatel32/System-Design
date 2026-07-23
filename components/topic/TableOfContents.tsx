"use client";

import { useEffect, useState } from "react";

interface TocItem {
  /** DOM id of the heading to scroll to. */
  id: string;
  label: string;
}

/**
 * Sticky on-page table of contents with scrollspy. Headings must already be
 * rendered in the document with matching `id` attributes. Hidden on small
 * screens and when there are fewer than 3 sections (not worth the chrome).
 */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length < 3) return;

    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost entry that is intersecting; fall back to nearest.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Trigger when a heading is near the top third of the viewport.
        rootMargin: "-80px 0px -65% 0px",
        threshold: 0,
      }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 3) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto pl-4 lg:block"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-rule">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="-ml-px block border-l-2 py-0.5 pl-3 text-sm leading-snug transition-colors"
                style={{
                  borderColor: active
                    ? "rgb(var(--accent-rgb))"
                    : "transparent",
                  color: active
                    ? "rgb(var(--accent-rgb))"
                    : "rgb(var(--ink-2-rgb))",
                }}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
