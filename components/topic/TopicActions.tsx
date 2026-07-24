"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bookmark, Check, Circle, CircleDot, Layers } from "lucide-react";
import { useProgress, type TopicStatus } from "@/lib/progress";

export function TopicActions({ id }: { id: number }) {
  const { state, hydrated, setStatus, toggleFavorite, markRecent } =
    useProgress();

  // Record this topic as recently viewed (once, on mount).
  useEffect(() => {
    if (hydrated) markRecent(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, id]);

  const status: TopicStatus | "none" = hydrated
    ? state.status[id] ?? "none"
    : "none";
  const fav = hydrated ? state.favorites.includes(id) : false;

  const options: { value: TopicStatus; label: string; icon: React.ReactNode }[] =
    [
      { value: "new", label: "New", icon: <Circle size={14} /> },
      { value: "doing", label: "In progress", icon: <CircleDot size={14} /> },
      { value: "done", label: "Done", icon: <Check size={14} /> },
    ];

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-rule/60 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
          Status:
        </span>
        <div
          role="group"
          aria-label="Mark topic status"
          className="inline-flex items-center gap-1 rounded-xl border border-rule bg-paper-2/70 p-1"
        >
          {options.map((opt) => {
            const active = status === opt.value;
            let activeStyles = "data-[active=true]:bg-accent data-[active=true]:text-[rgb(var(--accent-ink-rgb))]";
            if (opt.value === "done") {
              activeStyles = "data-[active=true]:bg-ok data-[active=true]:text-white";
            } else if (opt.value === "doing") {
              activeStyles = "data-[active=true]:bg-warn data-[active=true]:text-white";
            }
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(id, opt.value)}
                aria-pressed={active}
                data-active={active}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:bg-paper-3 ${activeStyles}`}
              >
                {opt.icon}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleFavorite(id)}
          aria-pressed={fav}
          data-active={fav}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-paper-2/70 px-3.5 py-2 text-xs font-semibold text-ink-2 transition-all hover:border-accent/50 hover:text-ink data-[active=true]:border-accent data-[active=true]:bg-accent/10 data-[active=true]:text-accent"
        >
          <Bookmark size={14} fill={fav ? "currentColor" : "none"} />
          {fav ? "Saved" : "Save topic"}
        </button>

        <Link
          href="/flashcards"
          className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-paper-2/70 px-3.5 py-2 text-xs font-semibold text-ink-2 transition-all hover:border-accent/50 hover:text-accent"
        >
          <Layers size={14} />
          Flashcards
        </Link>
      </div>
    </div>
  );
}
