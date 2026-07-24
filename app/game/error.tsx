"use client";

/**
 * Feature-scoped error boundary for the /game route (spec §19.3).
 *
 * A crash inside the game must never break the rest of the Atlas app — it
 * should show a recovery card with a path back to safety.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, ArrowLeft } from "lucide-react";

export default function GameError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the console for developer diagnostics; never to the user.
    console.error("[game] route error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <AlertOctagon size={32} className="mx-auto mb-4 text-warn" />
      <h1 className="mb-2 text-xl font-bold text-ink">
        The investigation hit a snag
      </h1>
      <p className="mb-6 text-ink-2">
        Something went wrong loading this case. Your progress is saved locally,
        so you can try again without losing anything.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[rgb(var(--accent-ink-rgb))]"
        >
          <RotateCcw size={15} /> Try again
        </button>
        <Link
          href="/game"
          className="inline-flex items-center gap-1.5 rounded-lg border border-rule px-4 py-2 text-sm font-medium text-ink-2 hover:border-accent hover:text-accent"
        >
          <ArrowLeft size={15} /> All cases
        </Link>
      </div>
    </div>
  );
}
