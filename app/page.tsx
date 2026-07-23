import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllCategories, getAllTopics, getStats } from "@/lib/content";
import { HomeProgress } from "@/components/home/HomeProgress";
import { HomeContinue } from "@/components/home/HomeContinue";

export default function HomePage() {
  const stats = getStats();
  const categories = getAllCategories();
  const topics = getAllTopics();

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      {/* Hero — two-column: title left, lede right (modern-minimal canonical). */}
      <section className="grid grid-cols-1 gap-8 py-14 sm:py-20 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            <span className="h-px w-6 bg-accent" aria-hidden />
            Interactive study companion
          </p>
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[1.04] tracking-tight text-ink">
            System design,
            <br />
            finally organized.
          </h1>
        </div>
        <div className="flex flex-col justify-end lg:col-span-5">
          <p className="text-lg leading-relaxed text-ink-2">
            {stats.total} topics — from{" "}
            <span className="font-medium text-ink">CAP</span> and{" "}
            <span className="font-medium text-ink">scalability</span> to
            designing <span className="font-medium text-ink">Twitter</span>,{" "}
            <span className="font-medium text-ink">Uber</span>, and{" "}
            <span className="font-medium text-ink">Kafka</span>. Search, track
            progress, and drill yourself with flashcards.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/library"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-[rgb(var(--accent-ink-rgb))] transition-colors hover:bg-accent-2"
            >
              Browse all topics <ArrowRight size={16} />
            </Link>
            <Link
              href="/flashcards"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink-3/30 bg-transparent px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Review flashcards
            </Link>
          </div>
        </div>
      </section>

      {/* Stat row */}
      <section
        aria-label="Overview"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule lg:grid-cols-4"
      >
        <HomeProgress total={stats.total} />
        <StatTile value={stats.categories} label="categories" />
        <StatTile value={stats.diagrams} label="architecture diagrams" />
        <StatTile value={stats.takeaways} label="key takeaways" />
      </section>

      {/* Continue */}
      <section className="mt-6">
        <HomeContinue topics={topics} />
      </section>

      {/* Roadmap */}
      <section className="py-14" aria-labelledby="roadmap-heading">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Learning order
            </p>
            <h2 id="roadmap-heading" className="text-3xl font-bold tracking-tight">
              The roadmap
            </h2>
            <p className="mt-2 text-ink-2">
              Twenty-four categories, arranged from fundamentals to full design
              problems.
            </p>
          </div>
          <Link
            href="/library"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-accent hover:gap-2 sm:inline-flex"
          >
            all topics <ArrowRight size={14} />
          </Link>
        </div>

        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((cat, i) => (
            <li key={cat.slug}>
              <Link
                href={`/library?cat=${cat.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-rule bg-paper-2/60 p-4 transition-colors hover:border-accent/50 hover:bg-paper-3/50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-3 font-mono text-sm font-semibold text-ink-2 transition-colors group-hover:bg-accent group-hover:text-[rgb(var(--accent-ink-rgb))]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink group-hover:text-accent">
                    {cat.name}
                  </span>
                  <span className="text-sm text-ink-3">
                    {cat.count} {cat.count === 1 ? "topic" : "topics"}
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-ink-3 transition-all group-hover:translate-x-1 group-hover:text-accent"
                />
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1 bg-paper p-5">
      <span className="text-3xl font-bold tracking-tight text-ink">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wider text-ink-3">
        {label}
      </span>
    </div>
  );
}
