import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, Clock, BookOpen, FileCode, Layers } from "lucide-react";
import {
  getAllTopics,
  getTopicBySlug,
  getTopicNeighbors,
  type Topic,
} from "@/lib/content";
import { TopicActions } from "@/components/topic/TopicActions";
import { TopicContent } from "@/components/topic/TopicContent";
import { ReadingProgress } from "@/components/topic/ReadingProgress";

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

/** Rough reading-time estimate: 220 wpm over the body text. */
function readingMinutes(topic: Topic): number {
  const text = [
    topic.intro,
    ...topic.sections.map((s) => s.body),
    topic.takeaway ?? "",
  ]
    .join(" ")
    .replace(/```[\s\S]*?```/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export default function TopicPage({ params }: { params: { slug: string } }) {
  const topic = getTopicBySlug(params.slug);
  if (!topic) notFound();
  const { prev, next } = getTopicNeighbors(topic.id);

  // Related topics: the neighbors inside the same category (window around
  // the current topic in curriculum order), falling back to the first few.
  const categoryTopics = getAllTopics().filter(
    (t) => t.category === topic.category
  );
  const catIdx = categoryTopics.findIndex((t) => t.id === topic.id);
  const related = [
    ...categoryTopics.slice(Math.max(0, catIdx - 3), catIdx),
    ...categoryTopics.slice(catIdx + 1, catIdx + 4),
  ].slice(0, 6);

  const minutes = readingMinutes(topic);
  const sectionsCount = topic.sections.filter(
    (s) => !/key\s*takeaway/i.test(s.heading)
  ).length;

  return (
    <>
      <ReadingProgress />
      <article className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-ink-3"
        >
          <Link href="/library" className="transition-colors hover:text-accent font-medium">
            Library
          </Link>
          <ChevronRight size={14} aria-hidden />
          <Link
            href={`/library?cat=${encodeURIComponent(topic.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`}
            className="transition-colors hover:text-accent"
          >
            {topic.category}
          </Link>
          <ChevronRight size={14} aria-hidden />
          <span className="font-mono text-xs text-ink-3">
            #{String(topic.id).padStart(3, "0")}
          </span>
        </nav>

        {/* Hero Header */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              {topic.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-rule bg-paper-2/70 px-3 py-1 text-xs font-medium text-ink-3">
              <Clock size={13} /> {minutes} min read
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-rule bg-paper-2/70 px-3 py-1 text-xs font-medium text-ink-3">
              <BookOpen size={13} /> {sectionsCount} {sectionsCount === 1 ? "section" : "sections"}
            </span>
            {topic.diagrams.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-rule bg-paper-2/70 px-3 py-1 text-xs font-medium text-ink-3">
                <FileCode size={13} /> {topic.diagrams.length} {topic.diagrams.length === 1 ? "diagram" : "diagrams"}
              </span>
            )}
          </div>

          <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] font-extrabold leading-[1.1] tracking-tight text-ink">
            {topic.title}
          </h1>

          <TopicActions id={topic.id} />
        </header>

        {/* Main Topic Body */}
        <TopicContent topic={topic} />

        {/* Prev / Next Topic Navigation */}
        <nav
          aria-label="Topic navigation"
          className="mt-16 grid grid-cols-1 gap-4 border-t border-rule pt-8 sm:grid-cols-2"
        >
          {prev ? (
            <Link
              href={`/topics/${prev.slug}`}
              className="lift group flex items-center gap-4 rounded-2xl border border-rule bg-paper-2/50 p-5 elev-xs hover:border-accent/50 hover:bg-paper-3/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rule bg-paper group-hover:border-accent/40 group-hover:text-accent">
                <ArrowLeft size={18} className="text-ink-3 group-hover:text-accent transition-colors" />
              </div>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-ink-3">
                  Previous Topic
                </span>
                <span className="block truncate text-base font-bold text-ink group-hover:text-accent transition-colors">
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
              className="lift group flex items-center justify-end gap-4 rounded-2xl border border-rule bg-paper-2/50 p-5 text-right elev-xs hover:border-accent/50 hover:bg-paper-3/40 sm:col-start-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-ink-3">
                  Next Topic
                </span>
                <span className="block truncate text-base font-bold text-ink group-hover:text-accent transition-colors">
                  {next.title}
                </span>
              </span>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rule bg-paper group-hover:border-accent/40 group-hover:text-accent">
                <ArrowRight size={18} className="text-ink-3 group-hover:text-accent transition-colors" />
              </div>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        {/* Related topics within the same category */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-10">
            <h2
              id="related-heading"
              className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink-3"
            >
              <Layers size={14} className="text-accent" aria-hidden />
              Continue in {topic.category}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className="lift group flex items-center gap-3 rounded-xl border border-rule bg-paper-2/50 p-3.5 elev-xs hover:border-accent/50 hover:bg-paper-3/40"
                >
                  <span className="font-mono text-xs text-ink-3 transition-colors group-hover:text-accent">
                    #{String(t.id).padStart(3, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink transition-colors group-hover:text-accent">
                    {t.title}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
