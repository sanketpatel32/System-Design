import Link from "next/link";
import { getAllCategories, getAllTopics, getStats } from "@/lib/content";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata = { title: "Dashboard — Atlas" };

export default function DashboardPage() {
  const stats = getStats();
  const categories = getAllCategories();
  const topics = getAllTopics().map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    category: t.category,
    takeaway: t.takeaway,
  }));

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <header className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Dashboard
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Your progress</h1>
        <p className="mt-3 text-lg text-ink-2">
          Everything is saved locally in your browser. Start marking topics in
          the{" "}
          <Link href="/library" className="underline underline-offset-2">
            library
          </Link>{" "}
          to fill this in.
        </p>
      </header>

      <DashboardView
        totalTopics={stats.total}
        totalCategories={stats.categories}
        categories={categories}
        topics={topics}
      />
    </div>
  );
}
