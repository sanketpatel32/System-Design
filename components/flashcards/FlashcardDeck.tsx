"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RotateCw, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useProgress } from "@/lib/progress";

interface Card {
  id: number;
  title: string;
  category: string;
  takeaway: string;
  slug: string;
}

export function FlashcardDeck({ cards }: { cards: Card[] }) {
  const { state, hydrated, setFlashcardKnown } = useProgress();
  const [order, setOrder] = useState<number[]>(() => cards.map((c) => c.id));
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const queue = useMemo(() => {
    // Unknown cards first, then unseen, then known last.
    const ranked = [...order].sort((a, b) => {
      const ka = hydrated ? state.flashcardKnown[a] : undefined;
      const kb = hydrated ? state.flashcardKnown[b] : undefined;
      const score = (k: boolean | undefined) =>
        k === undefined ? 1 : k === false ? 0 : 2;
      return score(ka) - score(kb);
    });
    return ranked.map((id) => cards.find((c) => c.id === id)!).filter(Boolean);
  }, [order, cards, hydrated, state.flashcardKnown]);

  const current = queue[0];

  const advance = useCallback(
    (known: boolean) => {
      if (!current) return;
      setFlashcardKnown(current.id, known);
      setFlipped(false);
      setReviewed((r) => r + 1);
      // Move the current card to the back of the order so the next surfaces.
      setOrder((o) => [...o.filter((x) => x !== current.id), current.id]);
    },
    [current, setFlashcardKnown]
  );

  const skip = useCallback(() => {
    if (!current) return;
    setFlipped(false);
    setOrder((o) => [...o.filter((x) => x !== current.id), current.id]);
  }, [current]);

  // Keyboard shortcuts: Space/Enter flips, ← didn't know, → knew it, S skips.
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't hijack typing into form fields.
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowLeft" && flipped) {
        e.preventDefault();
        advance(false);
      } else if (e.key === "ArrowRight" && flipped) {
        e.preventDefault();
        advance(true);
      } else if ((e.key === "s" || e.key === "S") && !flipped) {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, flipped, advance, skip]);

  if (!current) {
    return <p className="text-base text-ink-3">No flashcards available.</p>;
  }

  const knownCount = hydrated
    ? Object.values(state.flashcardKnown).filter(Boolean).length
    : 0;
  const unknownCount = hydrated
    ? Object.values(state.flashcardKnown).filter((v) => v === false).length
    : 0;

  return (
    <div>
      {/* Session toolbar — progress through the deck on the left, mastery
          counts on the right, with a slim bar underneath. */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 text-sm text-ink-3">
          <span>
            reviewed this session:{" "}
            <span className="font-semibold text-ink">{reviewed}</span>
          </span>
          {hydrated && (
            <span className="flex items-center gap-3">
              <span>
                known:{" "}
                <span className="font-semibold text-ok">{knownCount}</span>
              </span>
              <span aria-hidden>·</span>
              <span>
                unknown:{" "}
                <span className="font-semibold text-warn">{unknownCount}</span>
              </span>
            </span>
          )}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-3">
          <div
            className="h-full rounded-full bg-accent transition-[width]"
            style={{
              width: `${Math.min(100, (reviewed / cards.length) * 100)}%`,
              transitionDuration: "var(--dur-slow)",
              transitionTimingFunction: "var(--ease-out)",
            }}
          />
        </div>
      </div>

      {/* Card — outer element is a div with role=button (NOT a <button>) so the
          inner Link is valid HTML. Click anywhere except the link flips it. */}
      <div className="[perspective:1600px]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
          aria-label={flipped ? "Show question" : "Show answer"}
          className="relative block min-h-[18rem] w-full cursor-pointer select-none text-left [transform-style:preserve-3d]"
          style={{
            transition: "transform var(--dur-slow) var(--ease-out)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front — question */}
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-rule bg-paper-2 p-7 elev-lg [backface-visibility:hidden]"
            style={{ transform: "rotateY(0deg)" }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {current.category}
            </span>
            <h2 className="text-2xl font-bold leading-snug tracking-tight text-ink">
              {current.title}
            </h2>
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-3">
              <RotateCw size={14} /> tap to reveal
            </span>
          </div>

          {/* Back — answer */}
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-accent/40 bg-paper-3 p-7 elev-lg [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Key takeaway
            </span>
            <div className="prose-atlas text-lg leading-relaxed text-ink">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {current.takeaway}
              </ReactMarkdown>
            </div>
            <Link
              href={`/topics/${current.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              read full topic →
            </Link>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-center gap-3">
        {!flipped ? (
          <>
            <button
              type="button"
              onClick={skip}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-paper-2 px-4 py-3 text-sm font-medium text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
            >
              <X size={16} /> Skip
            </button>
            <button
              type="button"
              onClick={() => setFlipped(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-accent bg-accent px-5 py-3 text-sm font-semibold text-[rgb(var(--accent-ink-rgb))] transition-colors hover:bg-accent-2"
            >
              <RotateCw size={16} /> Reveal
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => advance(false)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-warn/50 bg-paper px-4 py-3.5 text-sm font-semibold text-warn transition-colors hover:bg-warn/10 sm:py-3"
            >
              <ThumbsDown size={16} /> Didn&apos;t know it
            </button>
            <button
              type="button"
              onClick={() => advance(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-ok/50 bg-paper px-4 py-3.5 text-sm font-semibold text-ok transition-colors hover:bg-ok/10 sm:py-3"
            >
              <ThumbsUp size={16} /> Knew it
            </button>
          </>
        )}
      </div>

      {/* Keyboard hints */}
      <p className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-center text-xs text-ink-3">
        <span>Cards you miss resurface sooner ·</span>
        <span className="flex items-center gap-1">
          <kbd className="kbd">Space</kbd> flip
        </span>
        <span aria-hidden>·</span>
        <span className="flex items-center gap-1">
          <kbd className="kbd">←</kbd>
          <kbd className="kbd">→</kbd> rate
        </span>
      </p>
    </div>
  );
}
