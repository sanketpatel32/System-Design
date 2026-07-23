"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import type { Topic } from "@/lib/content";
import { useProgress } from "@/lib/progress";
import { StatusBadge } from "./StatusBadge";

interface TopicCardProps {
  topic: Topic;
  showCategory?: boolean;
}

export function TopicCard({ topic, showCategory = true }: TopicCardProps) {
  const { state, hydrated, toggleFavorite } = useProgress();
  const status = hydrated ? state.status[topic.id] ?? "none" : "none";
  const fav = hydrated ? state.favorites.includes(topic.id) : false;

  return (
    <div
      data-status={status}
      className="lift group relative flex flex-col gap-3 rounded-xl border border-rule bg-paper-2/60 p-5 elev-xs hover:border-accent/50 hover:bg-paper-3/50 data-[status=done]:border-ok/30 data-[status=done]:bg-ok/5"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-medium text-ink-3">
          {String(topic.id).padStart(3, "0")}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(topic.id);
          }}
          aria-pressed={fav}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          className="-mr-1 -mt-1 rounded-md p-1 text-ink-3 transition-colors hover:text-accent data-[on=true]:text-accent"
          data-on={fav}
        >
          <Bookmark size={15} fill={fav ? "currentColor" : "none"} />
        </button>
      </div>

      <Link href={`/topics/${topic.slug}`} className="flex-1">
        <h3 className="text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {topic.title}
        </h3>
      </Link>

      <div className="flex items-center justify-between gap-2">
        {showCategory ? (
          <span className="truncate text-xs text-ink-3">{topic.category}</span>
        ) : (
          <span />
        )}
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
