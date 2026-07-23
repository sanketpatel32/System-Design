import { getAllTopics } from "@/lib/content";
import { FlashcardDeck } from "@/components/flashcards/FlashcardDeck";

export const metadata = { title: "Flashcards — Atlas" };

export default function FlashcardsPage() {
  const cards = getAllTopics()
    .filter((t) => t.takeaway)
    .map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      takeaway: t.takeaway!,
      slug: t.slug,
    }));

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <header className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Flashcards
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Test your recall</h1>
        <p className="mt-3 text-lg text-ink-2">
          {cards.length} key takeaways across all topics. Flip a card, then mark
          whether you knew it. Cards you miss resurface sooner.
        </p>
      </header>

      <FlashcardDeck cards={cards} />
    </div>
  );
}
