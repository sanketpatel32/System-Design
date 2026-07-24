"use client";

/**
 * EvidenceLocker — the left panel (spec §5.4).
 *
 * Renders evidence cards from case data (never hardcoded), lets the player
 * spend investigation points to unlock paid items, and opens a structured
 * viewer appropriate to each evidence category. Re-inspection is free.
 */

import { useState } from "react";
import { Lock, Eye, CheckCircle2, FileText, Activity, GitBranch, Settings, Database } from "lucide-react";
import type {
  EvidenceItem,
  GameCaseDefinition,
  GameSession,
} from "@/lib/game/domain/types";
import type { Result, GameRuleError } from "@/lib/game/domain/types";
import { selectEvidenceCards } from "@/lib/game/domain/state/game-selectors";
import { EvidenceViewer } from "./EvidenceViewer";

type Dispatch = (command: import("@/lib/game/domain/types").GameCommand) => Result<GameSession, GameRuleError>;

interface Props {
  caseDef: GameCaseDefinition;
  session: GameSession;
  dispatch: Dispatch;
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  metric: <Activity size={13} aria-hidden />,
  log: <FileText size={13} aria-hidden />,
  trace: <GitBranch size={13} aria-hidden />,
  memo: <FileText size={13} aria-hidden />,
  config: <Settings size={13} aria-hidden />,
  schema: <Database size={13} aria-hidden />,
  diagram: <FileText size={13} aria-hidden />,
};

export function EvidenceLocker({ caseDef, session, dispatch }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cards = selectEvidenceCards(session, caseDef);
  const selected = selectedId
    ? caseDef.evidence.find((e) => e.id === selectedId)
    : undefined;

  const handleInspect = (item: EvidenceItem) => {
    // If already inspected, just open it (free revisit — spec §22.3).
    if (session.inspectedEvidenceIds.includes(item.id)) {
      setSelectedId(item.id);
      return;
    }
    const result = dispatch({
      type: "INSPECT_EVIDENCE",
      meta: stubMeta(session.id),
      evidenceId: item.id,
    });
    if (result.ok) {
      setSelectedId(item.id);
    }
  };

  return (
    <div>
      {/* Live region: announce unlocks to assistive tech (spec §16). */}
      <div aria-live="polite" className="sr-only">
        {selected ? `Opened ${selected.title}` : ""}
      </div>

      {selected ? (
        <EvidenceViewer
          item={selected}
          isRedHerringRevealed={session.inspectedEvidenceIds.includes(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      ) : (
        <ul className="space-y-2">
          {cards.map((card) => {
            const item = caseDef.evidence.find((e) => e.id === card.id)!;
            const disabled =
              !card.isUnlocked &&
              !card.isInspected &&
              !card.affordable;
            return (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => handleInspect(item)}
                  disabled={disabled}
                  aria-label={`${item.title}${card.cost ? `, costs ${card.cost} points` : ""}`}
                  className="group w-full rounded-lg border border-rule bg-paper px-3 py-2.5 text-left transition-colors hover:border-accent/50 hover:bg-paper-3/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-rule disabled:hover:bg-paper"
                >
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-ink-3" aria-hidden>
                      {CATEGORY_ICON[item.category] ?? <FileText size={13} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                      {item.title}
                    </span>
                    {card.isInspected ? (
                      <CheckCircle2 size={14} className="shrink-0 text-ok" aria-label="Inspected" />
                    ) : card.isUnlocked || card.cost === 0 ? (
                      <Eye size={14} className="shrink-0 text-accent" aria-label="Free to view" />
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-paper-3 px-1.5 py-0.5 text-[11px] font-semibold text-ink-2">
                        <Lock size={9} aria-hidden /> {card.cost}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-ink-3">{item.preview}</p>
                  {card.isRedHerring && card.isInspected && (
                    <p className="mt-1 text-[11px] italic text-ink-3">red herring</p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function stubMeta(sessionId: string) {
  return {
    id: `cmd_${Date.now()}`,
    sessionId,
    issuedAt: new Date().toISOString(),
    sequence: 0,
  };
}
