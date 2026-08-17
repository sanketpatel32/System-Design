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
      className="lift group relative rounded-xl border border-rule bg-paper-2/60 elev-xs transition-colors hover:border-accent/50 hover:bg-paper-3/50 data-[status=done]:border-ok/30 data-[status=done]:bg-ok/5"
    >
      {/* Whole card is the click target; the favorite button stops the event
          so it never navigates. */}
      <Link
        href={`/topics/${topic.slug}`}
        className="flex h-full flex-col gap-3 p-5 pb-4"
      >
        <span className="font-mono text-xs font-medium text-ink-3">
          {String(topic.id).padStart(3, "0")}
        </span>

        <h3 className="text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {topic.title}
        </h3>

        {topic.takeaway && (
          <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-3">
            {topic.takeaway.replace(/[#*`>]/g, "")}
          </p>
        )}

        {showCategory && (
          <span className="mt-auto flex items-center justify-between gap-2 pt-1">
            <span className="truncate text-xs text-ink-3">
              {topic.category}
            </span>
            <StatusBadge status={status} />
          </span>
        )}
      </Link>

      {/* Favorite — in-flow so touch users can always reach it. The -mr/-mt
          nudges keep it inside the card's visual padding. */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(topic.id);
        }}
        aria-pressed={fav}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        className="absolute right-2.5 top-2.5 rounded-md bg-transparent p-1.5 text-ink-3 backdrop-blur-sm transition-colors hover:bg-paper-3 hover:text-accent data-[on=true]:text-accent"
        data-on={fav}
      >
        <Bookmark size={15} fill={fav ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
