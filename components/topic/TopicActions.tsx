"use client";

import { useEffect } from "react";
import { Bookmark, Check, Circle, CircleDot } from "lucide-react";
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
      { value: "new", label: "New", icon: <Circle size={15} /> },
      { value: "doing", label: "In progress", icon: <CircleDot size={15} /> },
      { value: "done", label: "Done", icon: <Check size={15} /> },
    ];

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label="Mark topic status"
        className="inline-flex items-center gap-1 rounded-lg border border-rule bg-paper-2/60 p-1"
      >
        {options.map((opt) => {
          const active = status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(id, opt.value)}
              aria-pressed={active}
              data-active={active}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-paper-3 data-[active=true]:bg-accent data-[active=true]:text-[rgb(var(--accent-ink-rgb))]"
            >
              {opt.icon}
              {opt.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => toggleFavorite(id)}
        aria-pressed={fav}
        data-active={fav}
        className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-paper-2/60 px-2.5 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:border-accent/50 hover:text-ink data-[active=true]:border-accent data-[active=true]:text-accent"
      >
        <Bookmark size={15} fill={fav ? "currentColor" : "none"} />
        {fav ? "Saved" : "Save"}
      </button>
    </div>
  );
}
