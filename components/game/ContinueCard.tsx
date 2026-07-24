"use client";

/**
 * ContinueCard — surfaces an in-progress session from localStorage so the
 * player can resume. Client component because localStorage is browser-only.
 *
 * Spec reference: §22.1 ("The user can leave and return without losing progress").
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { loadAllSessions } from "@/lib/game/infrastructure/local-session-repository";
import { getCaseById } from "@/lib/game/infrastructure/static-case-repository";
import type { GameSession } from "@/lib/game/domain/types";

export function ContinueCard() {
  const [sessions, setSessions] = useState<GameSession[]>([]);

  useEffect(() => {
    // Only in-progress (not resolved) sessions are worth resuming.
    setSessions(
      loadAllSessions().filter((s) => s.status !== "CASE_RESOLVED" && s.status !== "DEBRIEF")
    );
  }, []);

  if (sessions.length === 0) return null;

  const latest = sessions[0];
  const caseDef = getCaseById(latest.caseId);
  if (!caseDef) return null;

  const completionPct = Math.round(
    (latest.inspectedEvidenceIds.length / Math.max(1, caseDef.evidence.length)) * 100
  );

  return (
    <Link
      href={`/game/${caseDef.slug}`}
      className="lift mt-8 flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent/5 p-4 elev-xs hover:bg-accent/10"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-[rgb(var(--accent-ink-rgb))]">
        <Play size={16} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Continue
        </p>
        <p className="truncate font-semibold text-ink">{caseDef.title}</p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-paper-3">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
