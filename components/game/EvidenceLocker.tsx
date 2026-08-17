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

import { audioFx } from "@/lib/game/audio";

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
      audioFx.playUnlock();
      return;
    }
    const result = dispatch({
      type: "INSPECT_EVIDENCE",
      meta: stubMeta(session.id),
      evidenceId: item.id,
    });
    if (result.ok) {
      setSelectedId(item.id);
      audioFx.playUnlock();
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
        <ul className="space-y-2.5">
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
                  className="lift group w-full rounded-xl border border-rule/80 bg-paper p-3 text-left transition-all duration-150 hover:border-accent/60 hover:bg-paper-3/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-rule disabled:hover:bg-paper shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-paper-3 text-accent group-hover:bg-accent/15 group-hover:text-accent" aria-hidden>
                      {CATEGORY_ICON[item.category] ?? <FileText size={14} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-bold tracking-tight text-ink group-hover:text-accent">
                      {item.title}
                    </span>
                    {card.isNew && !card.isInspected && (
                      <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent border border-accent/30 animate-pulse-slow">
                        new
                      </span>
                    )}
                    {card.isInspected ? (
                      <CheckCircle2 size={15} className="shrink-0 text-ok" aria-label="Inspected" />
                    ) : card.isUnlocked || card.cost === 0 ? (
                      <Eye size={15} className="shrink-0 text-accent" aria-label="Free to view" />
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-paper-3 px-2 py-0.5 text-[10px] font-bold text-ink-2">
                        <Lock size={10} aria-hidden /> {card.cost} pt
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-xs text-ink-3 font-medium">{item.preview}</p>
                  {card.isRedHerring && card.isInspected && (
                    <p className="mt-1 text-[11px] italic font-semibold text-warn">red herring</p>
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
