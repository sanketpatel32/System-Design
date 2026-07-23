"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";

interface SurpriseButtonProps {
  slugs: string[];
}

/**
 * "Surprise me" — picks a topic at random and navigates to it. Useful for
 * discovery when you don't know what to study next.
 */
export function SurpriseButton({ slugs }: SurpriseButtonProps) {
  const router = useRouter();

  const surprise = useCallback(() => {
    if (slugs.length === 0) return;
    const slug = slugs[Math.floor(Math.random() * slugs.length)];
    router.push(`/topics/${slug}`);
  }, [router, slugs]);

  return (
    <button
      type="button"
      onClick={surprise}
      className="lift inline-flex items-center justify-center gap-2 rounded-lg border border-ink-3/30 bg-paper px-5 py-2.5 text-sm font-semibold text-ink elev-xs hover:border-accent hover:text-accent"
    >
      <Shuffle size={16} /> Surprise me
    </button>
  );
}
