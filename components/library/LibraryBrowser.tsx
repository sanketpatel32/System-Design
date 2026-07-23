"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Search, X, Bookmark } from "lucide-react";
import type { Category } from "@/lib/content";
import { useProgress } from "@/lib/progress";
import { TopicCard } from "@/components/TopicCard";

interface LightTopic {
  id: number;
  slug: string;
  title: string;
  category: string;
  takeaway: string | null;
}

type StatusFilter = "all" | "new" | "doing" | "done" | "saved";

export function LibraryBrowser({
  topics,
  categories,
}: {
  topics: LightTopic[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const { state, hydrated } = useProgress();
  const searchRef = useRef<HTMLInputElement>(null);

  // Read the ?cat= deep-link (from the home roadmap).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("cat");
    if (c) setCat(c);
  }, []);

  // Keyboard: "/" focuses search (unless already typing), "Esc" clears it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Escape" && typing) {
        setQuery("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const resetFilters = () => {
    setQuery("");
    setCat("all");
    setStatus("all");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return topics.filter((t) => {
      if (cat !== "all") {
        const matched = categories.find((c) => c.slug === cat);
        if (matched && !matched.topicIds.includes(t.id)) return false;
      }
      if (status !== "all") {
        const s = hydrated ? state.status[t.id] : undefined;
        if (status === "new" && s !== undefined) return false;
        if (status === "saved") {
          if (!hydrated || !state.favorites.includes(t.id)) return false;
        } else if (status !== "new" && s !== status) {
          return false;
        }
      }
      if (q) {
        const hay = `${t.title} ${t.category} ${t.takeaway ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [topics, categories, cat, status, query, hydrated, state.status, state.favorites]);

  const activeCat = categories.find((c) => c.slug === cat);

  return (
    <div>
      {/* Controls */}
      <div className="sticky top-16 z-30 -mx-5 mb-8 border-b border-rule bg-paper/90 px-5 py-4 backdrop-blur-md elev-sm sm:mx-0 sm:rounded-xl sm:border sm:px-5">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
              aria-hidden
            />
            <label htmlFor="library-search" className="sr-only">
              Search topics
            </label>
            <input
              ref={searchRef}
              id="library-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 300 topics — try 'cache', 'uber', 'CAP'…"
              className="w-full rounded-lg border border-rule bg-paper-2 py-2.5 pl-10 pr-16 text-base text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            {!query && (
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-rule bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink-3 sm:inline-flex">
                /
              </kbd>
            )}
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-ink-3 hover:text-ink"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Categories — horizontal scroll on mobile to avoid a 24-chip wall;
              wraps naturally on larger screens. */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
            <FilterChip
              active={cat === "all"}
              onClick={() => setCat("all")}
              label="All categories"
            />
            {categories.map((c) => (
              <FilterChip
                key={c.slug}
                active={cat === c.slug}
                onClick={() => setCat(c.slug)}
                label={c.name}
                count={c.count}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-3">
              status
            </span>
            {(["all", "new", "doing", "done", "saved"] as StatusFilter[]).map(
              (s) => (
                <FilterChip
                  key={s}
                  active={status === s}
                  onClick={() => setStatus(s)}
                  label={
                    s === "all"
                      ? "any"
                      : s === "doing"
                        ? "in progress"
                        : s === "saved"
                          ? "saved"
                          : s
                  }
                  icon={s === "saved" ? <Bookmark size={13} /> : undefined}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Result count */}
      <p className="mb-5 text-sm text-ink-3">
        <span className="font-semibold text-ink">{filtered.length}</span> of{" "}
        {topics.length}
        {activeCat ? ` · ${activeCat.name}` : null}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TopicCard key={t.id} topic={t as never} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-rule p-12 text-center">
          <p className="text-base text-ink-2">No topics match those filters.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 text-sm font-medium text-accent hover:underline"
          >
            reset filters
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rule bg-paper px-3.5 py-1.5 text-sm text-ink-2 transition-colors hover:border-accent/50 hover:text-ink data-[active=true]:border-accent data-[active=true]:bg-accent data-[active=true]:text-[rgb(var(--accent-ink-rgb))]"
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className="opacity-60 data-[active=true]:opacity-90">
          {count}
        </span>
      )}
    </button>
  );
}
