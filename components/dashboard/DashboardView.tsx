"use client";

import Link from "next/link";
import { Bookmark, CheckCircle2, CircleDashed, Trash2 } from "lucide-react";
import type { Category } from "@/lib/content";
import { useProgress } from "@/lib/progress";
import { ProgressRing } from "@/components/ProgressRing";

interface LightTopic {
  id: number;
  slug: string;
  title: string;
  category: string;
  takeaway: string | null;
}

export function DashboardView({
  totalTopics,
  totalCategories,
  categories,
  topics,
}: {
  totalTopics: number;
  totalCategories: number;
  categories: Category[];
  topics: LightTopic[];
}) {
  const { state, hydrated, reset } = useProgress();

  const doneCount = hydrated
    ? Object.values(state.status).filter((s) => s === "done").length
    : 0;
  const doingCount = hydrated
    ? Object.values(state.status).filter((s) => s === "doing").length
    : 0;
  const favCount = hydrated ? state.favorites.length : 0;
  const knownCount = hydrated
    ? Object.values(state.flashcardKnown).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-12">
      {/* Top-line stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-rule bg-paper-2/60 p-6 elev-sm">
          <ProgressRing done={doneCount} total={totalTopics} size={140} />
          <p className="text-sm text-ink-3">
            <span className="font-semibold text-ink">{doneCount}</span> of{" "}
            {totalTopics} topics complete
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:col-span-2">
          <StatBox
            icon={<CheckCircle2 size={18} />}
            value={doneCount}
            label="completed"
            tone="ok"
          />
          <StatBox
            icon={<CircleDashed size={18} />}
            value={doingCount}
            label="in progress"
            tone="warn"
          />
          <StatBox
            icon={<Bookmark size={18} />}
            value={favCount}
            label="saved"
            tone="accent"
          />
          <StatBox
            icon={<CheckCircle2 size={18} />}
            value={knownCount}
            label="flashcards known"
            tone="ok"
          />
        </div>
      </section>

      {/* Per-category progress bars */}
      <section>
        <h2 className="mb-5 text-2xl font-bold tracking-tight">By category</h2>
        <ul className="space-y-2">
          {categories.map((cat) => {
            const done = hydrated
              ? cat.topicIds.filter((id) => state.status[id] === "done").length
              : 0;
            const doing = hydrated
              ? cat.topicIds.filter((id) => state.status[id] === "doing").length
              : 0;
            const pct = cat.count > 0 ? (done / cat.count) * 100 : 0;
            const doingPct = cat.count > 0 ? (doing / cat.count) * 100 : 0;
            return (
              <li key={cat.slug}>
                <Link
                  href={`/library?cat=${cat.slug}`}
                  className="lift group block rounded-xl border border-rule bg-paper-2/40 p-4 elev-xs hover:border-accent/40"
                >
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-ink group-hover:text-accent">
                      {cat.name}
                    </span>
                    <span className="text-sm text-ink-3">
                      {done}/{cat.count}
                      {doing > 0 && (
                        <span className="text-warn"> · {doing} active</span>
                      )}
                    </span>
                  </div>
                  <div
                    className="relative h-1.5 overflow-hidden rounded-full bg-paper-3"
                    role="progressbar"
                    aria-valuenow={Math.round(pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${cat.name} progress`}
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-warn/50"
                      style={{ width: `${doingPct}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] var(--dur-slow) var(--ease-out)"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Recently viewed */}
      {hydrated && state.recent.length > 0 && (
        <section>
          <h2 className="mb-5 text-2xl font-bold tracking-tight">
            Recently viewed
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {state.recent
              .map((id) => topics.find((t) => t.id === id))
              .filter(Boolean)
              .slice(0, 6)
              .map((t) => (
                <li key={t!.id}>
                  <Link
                    href={`/topics/${t!.slug}`}
                    className="lift group flex items-center justify-between gap-2 rounded-lg border border-rule bg-paper-2/40 px-4 py-2.5 elev-xs hover:border-accent/40"
                  >
                    <span className="truncate text-sm font-medium text-ink group-hover:text-accent">
                      {t!.title}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-ink-3">
                      #{String(t!.id).padStart(3, "0")}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* Danger zone */}
      <section className="rounded-xl border border-rule bg-paper-2/30 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">
              Reset all progress
            </h2>
            <p className="text-sm text-ink-3">
              Clears status, favorites, flashcards, and recent history. Cannot
              be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Reset ALL progress? This clears everything saved in your browser."
                )
              ) {
                reset();
              }
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-warn/50 px-3 py-2 text-sm font-semibold text-warn transition-colors hover:bg-warn/10"
          >
            <Trash2 size={15} /> Reset everything
          </button>
        </div>
      </section>

      <p className="text-center text-xs text-ink-3">
        {totalCategories} categories · {totalTopics} topics · all data stays in
        your browser
      </p>
    </div>
  );
}

function StatBox({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone: "ok" | "warn" | "accent";
}) {
  const toneCls =
    tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "text-accent";
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-rule bg-paper-2/60 p-5 elev-xs">
      <span className={toneCls} aria-hidden>
        {icon}
      </span>
      <span className="text-3xl font-bold tracking-tight text-ink">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wider text-ink-3">
        {label}
      </span>
    </div>
  );
}
