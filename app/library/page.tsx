import { getAllCategories, getAllTopics } from "@/lib/content";
import { LibraryBrowser } from "@/components/library/LibraryBrowser";

export const metadata = {
  title: "Library — Atlas",
};

export default function LibraryPage() {
  const topics = getAllTopics().map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    category: t.category,
    takeaway: t.takeaway,
  }));
  const categories = getAllCategories();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <header className="mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-accent">
          Library
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          All {topics.length} topics
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-2">
          Search by title, filter by category, and track your progress. Changes
          save to your browser automatically.
        </p>
      </header>

      <LibraryBrowser topics={topics} categories={categories} />
    </div>
  );
}
