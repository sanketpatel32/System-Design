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
      className="lift mt-6 flex items-center gap-4 rounded-2xl border border-accent/40 bg-accent/10 p-4 elev-sm hover:bg-accent/15 shadow-sm"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-[rgb(var(--accent-ink-rgb))] shadow-xs">
        <Play size={18} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse-slow" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
            Resume Active Incident Session
          </p>
        </div>
        <p className="truncate text-base font-bold text-ink mt-0.5">{caseDef.title}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-3">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-accent">{completionPct}% revealed</span>
        </div>
      </div>
    </Link>
  );
}
