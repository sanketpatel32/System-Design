"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useProgress } from "@/lib/progress";
import type { Topic } from "@/lib/content";

export function HomeContinue({ topics }: { topics: Topic[] }) {
  const { state, hydrated } = useProgress();

  const byId = new Map(topics.map((t) => [t.id, t]));
  const recent = hydrated
    ? state.recent.map((id) => byId.get(id)).filter(Boolean)
    : [];

  // Continue target: most recent viewed, else first not-done, else first.
  const target: Topic | undefined =
    recent.length > 0
      ? recent[0]
      : topics.find((t) => hydrated && state.status[t.id] !== "done") ??
        topics[0];

  if (!target) {
    return null;
  }

  return (
    <Link
      href={`/topics/${target.slug}`}
      className="lift group flex flex-col justify-between gap-4 rounded-xl border border-rule bg-paper-2/60 p-6 elev-sm hover:border-accent/50 hover:bg-paper-3/50"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {recent.length > 0 ? "Continue where you left off" : "Start here"}
        </span>
        <ArrowUpRight
          size={18}
          className="text-ink-3 transition-all group-hover:translate-x-0.5 group-hover:text-accent"
        />
      </div>

      <div>
        <p className="text-sm text-ink-3">
          #{String(target.id).padStart(3, "0")} · {target.category}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink group-hover:text-accent">
          {target.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-base text-ink-2">
          {target.takeaway ?? target.intro.slice(0, 160)}
        </p>
      </div>

      <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-rule bg-paper px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink-2 transition-colors group-hover:border-accent/50 group-hover:text-accent">
        Keep reading
      </span>
    </Link>
  );
}
