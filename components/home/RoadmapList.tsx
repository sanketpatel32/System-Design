"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/content";
import { useProgress } from "@/lib/progress";

/**
 * RoadmapList — the 24-category learning order, with each card showing the
 * reader's live completion as a thin progress bar. Client component because
 * progress lives in localStorage.
 */
export function RoadmapList({ categories }: { categories: Category[] }) {
  const { state, hydrated } = useProgress();

  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {categories.map((cat, i) => {
        const done = hydrated
          ? cat.topicIds.filter((id) => state.status[id] === "done").length
          : 0;
        const pct = cat.count > 0 ? (done / cat.count) * 100 : 0;
        return (
          <li key={cat.slug}>
            <Link
              href={`/library?cat=${cat.slug}`}
              className="lift group relative flex items-center gap-4 overflow-hidden rounded-xl border border-rule bg-paper-2/60 p-4 elev-xs hover:border-accent/50 hover:bg-paper-3/50 data-[done=true]:border-ok/40"
              data-done={done === cat.count && cat.count > 0}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-3 font-mono text-sm font-semibold text-ink-2 transition-colors group-hover:bg-accent group-hover:text-[rgb(var(--accent-ink-rgb))]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-ink group-hover:text-accent">
                  {cat.name}
                </span>
                <span className="mt-1 flex items-center gap-2 text-sm text-ink-3">
                  {cat.count} {cat.count === 1 ? "topic" : "topics"}
                  {done > 0 && (
                    <span className="font-medium text-ok">
                      {done === cat.count ? "✓ complete" : `${done} done`}
                    </span>
                  )}
                </span>
                {/* Live per-category progress */}
                <span className="mt-2 block h-1 overflow-hidden rounded-full bg-rule/50">
                  <span
                    className="block h-full rounded-full bg-accent transition-[width]"
                    style={{
                      width: `${pct}%`,
                      transitionDuration: "var(--dur-slow)",
                      transitionTimingFunction: "var(--ease-out)",
                    }}
                  />
                </span>
              </span>
              <ArrowRight
                size={16}
                className="shrink-0 text-ink-3 transition-all group-hover:translate-x-1 group-hover:text-accent"
              />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
