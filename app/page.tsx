import Link from "next/link";
import {
  ArrowRight,
  Layers,
  FileCode,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";
import { getAllCategories, getAllTopics, getStats } from "@/lib/content";
import { HomeProgress } from "@/components/home/HomeProgress";
import { HomeContinue } from "@/components/home/HomeContinue";
import { RoadmapList } from "@/components/home/RoadmapList";
import { SurpriseButton } from "@/components/home/SurpriseButton";

export default function HomePage() {
  const stats = getStats();
  const categories = getAllCategories();
  const topics = getAllTopics();

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      {/* Hero — two-column: title left, lede right, over a faint dot-grid. */}
      <section className="hero-texture grid grid-cols-1 gap-8 py-16 sm:py-24 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            Interactive study companion
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[1.04] tracking-tight text-ink">
            System design,
            <br />
            finally organized.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2 lg:hidden">
            {stats.total} topics — from <span className="font-medium text-ink">CAP</span> and{" "}
            <span className="font-medium text-ink">scalability</span> to designing{" "}
            <span className="font-medium text-ink">Twitter</span>,{" "}
            <span className="font-medium text-ink">Uber</span>, and{" "}
            <span className="font-medium text-ink">Kafka</span>.
          </p>
        </div>
        <div className="flex flex-col justify-end lg:col-span-5">
          <p className="hidden text-lg leading-relaxed text-ink-2 lg:block">
            {stats.total} topics — from{" "}
            <span className="font-medium text-ink">CAP</span> and{" "}
            <span className="font-medium text-ink">scalability</span> to
            designing <span className="font-medium text-ink">Twitter</span>,{" "}
            <span className="font-medium text-ink">Uber</span>, and{" "}
            <span className="font-medium text-ink">Kafka</span>. Search, track
            progress, and drill yourself with flashcards.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/library"
              className="lift inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-[rgb(var(--accent-ink-rgb))] elev-sm hover:elev-md"
            >
              Browse all topics <ArrowRight size={16} />
            </Link>
            <SurpriseButton slugs={topics.map((t) => t.slug)} />
            <Link
              href="/flashcards"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink-3/30 bg-transparent px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Review flashcards
            </Link>
          </div>
        </div>
      </section>

      {/* Stat row — elevated tiles with icon anchors */}
      <section
        aria-label="Overview"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        <HomeProgress total={stats.total} />
        <StatTile
          value={stats.categories}
          label="categories"
          icon={<Layers size={16} />}
        />
        <StatTile
          value={stats.diagrams}
          label="architecture diagrams"
          icon={<FileCode size={16} />}
        />
        <StatTile
          value={stats.takeaways}
          label="key takeaways"
          icon={<Lightbulb size={16} />}
        />
      </section>

      {/* Continue + Incident Lab promo */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HomeContinue topics={topics} />
        <Link
          href="/game"
          className="lift group relative flex flex-col justify-between gap-4 overflow-hidden rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 via-paper-2/60 to-paper-2/60 p-6 elev-sm hover:border-accent/60"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <ShieldAlert size={15} aria-hidden />
              Incident Lab · new
            </span>
            <ArrowRight
              size={18}
              className="text-ink-3 transition-all group-hover:translate-x-1 group-hover:text-accent"
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-ink group-hover:text-accent">
              Ghost Orders at Midnight
            </h3>
            <p className="mt-2 line-clamp-2 text-base text-ink-2">
              Inherit a failing production system. Uncover its hidden
              architecture from evidence, form a hypothesis, fix the design —
              and simulate the outage to see if your fix holds.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--accent-ink-rgb))] transition-colors group-hover:bg-accent-2">
            Launch the incident <ArrowRight size={13} />
          </span>
        </Link>
      </section>

      {/* Roadmap */}
      <section
        className="mt-16 border-t border-rule/60 pt-14"
        aria-labelledby="roadmap-heading"
      >
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Learning order
            </div>
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
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-accent transition-all hover:gap-2 sm:inline-flex"
          >
            all topics <ArrowRight size={14} />
          </Link>
        </div>

        <RoadmapList categories={categories} />
      </section>
    </div>
  );
}

function StatTile({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="lift group flex flex-col gap-2 rounded-xl border border-rule bg-paper p-5 elev-xs hover:border-accent/40">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent" aria-hidden>
        {icon}
      </span>
      <span className="text-3xl font-bold tracking-tight text-ink">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wider text-ink-3">
        {label}
      </span>
    </div>
  );
}
