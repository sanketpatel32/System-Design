import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import {
  getAllTopics,
  getTopicBySlug,
  getTopicNeighbors,
} from "@/lib/content";
import { TopicActions } from "@/components/topic/TopicActions";
import { TopicContent } from "@/components/topic/TopicContent";

export function generateStaticParams() {
  return getAllTopics().map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const topic = getTopicBySlug(params.slug);
  if (!topic) return { title: "Not found — Atlas" };
  return {
    title: `${topic.title} — Atlas`,
    description: topic.takeaway ?? topic.intro.slice(0, 160),
  };
}

export default function TopicPage({ params }: { params: { slug: string } }) {
  const topic = getTopicBySlug(params.slug);
  if (!topic) notFound();
  const { prev, next } = getTopicNeighbors(topic.id);

  return (
    <article className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-1 text-sm text-ink-3"
      >
        <Link href="/library" className="hover:text-accent">
          Library
        </Link>
        <ChevronRight size={14} aria-hidden />
        <span className="text-ink-2">{topic.category}</span>
        <ChevronRight size={14} aria-hidden />
        <span className="text-ink-2">
          #{String(topic.id).padStart(3, "0")}
        </span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {topic.category}
        </p>
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.1] tracking-tight">
          {topic.title}
        </h1>
        <TopicActions id={topic.id} />
      </header>

      {/* Body */}
      <TopicContent topic={topic} />

      {/* Prev / Next in learning order */}
      <nav
        aria-label="Topic navigation"
        className="mt-16 grid grid-cols-1 gap-3 border-t border-rule pt-8 sm:grid-cols-2"
      >
        {prev ? (
          <Link
            href={`/topics/${prev.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-rule bg-paper-2/50 p-4 transition-colors hover:border-accent/50"
          >
            <ArrowLeft
              size={16}
              className="shrink-0 text-ink-3 group-hover:text-accent"
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block text-xs font-medium uppercase tracking-wider text-ink-3">
                Previous
              </span>
              <span className="block truncate text-sm font-semibold text-ink group-hover:text-accent">
                {prev.title}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/topics/${next.slug}`}
            className="group flex items-center justify-end gap-3 rounded-xl border border-rule bg-paper-2/50 p-4 text-right transition-colors hover:border-accent/50 sm:col-start-2"
          >
            <span className="min-w-0">
              <span className="block text-xs font-medium uppercase tracking-wider text-ink-3">
                Next
              </span>
              <span className="block truncate text-sm font-semibold text-ink group-hover:text-accent">
                {next.title}
              </span>
            </span>
            <ArrowRight
              size={16}
              className="shrink-0 text-ink-3 group-hover:text-accent"
              aria-hidden
            />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
