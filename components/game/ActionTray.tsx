"use client";

/**
 * ActionTray — the design-action catalogue (spec §5.8).
 *
 * Groups actions by category, shows cost + risk, disables invalid ones with a
 * reason, and lets the player apply or revert. Applies to the auto-selected
 * best target node when a node isn't explicitly chosen.
 */

import { useState } from "react";
import { Plus, Undo2, AlertTriangle } from "lucide-react";
import type {
  DesignActionCategory,
  GameCaseDefinition,
  GameSession,
  GameCommand,
  Result,
  GameRuleError,
} from "@/lib/game/domain/types";
import { selectAvailableActions } from "@/lib/game/domain/state/game-selectors";

type Dispatch = (command: GameCommand) => Result<GameSession, GameRuleError>;

interface Props {
  caseDef: GameCaseDefinition;
  session: GameSession;
  dispatch: Dispatch;
  selectedNodeId: string | null;
}

const CATEGORY_LABELS: Record<DesignActionCategory, string> = {
  reliability: "Reliability",
  capacity: "Capacity",
  integrity: "Data integrity",
  traffic: "Traffic policy",
  messaging: "Messaging",
  observability: "Observability",
};

import { audioFx } from "@/lib/game/audio";

export function ActionTray({ caseDef, session, dispatch, selectedNodeId }: Props) {
  const [open, setOpen] = useState<DesignActionCategory | null>("reliability");
  const availability = selectAvailableActions(session, caseDef);

  const categories = [...new Set(caseDef.availableActions.map((a) => a.category))];

  const handleApply = (actionId: string, validTargets: string[]) => {
    const target =
      selectedNodeId && validTargets.includes(selectedNodeId)
        ? selectedNodeId
        : validTargets[0];
    const res = dispatch({
      type: "APPLY_DESIGN_ACTION",
      meta: stubMeta(session.id),
      actionId,
      targetNodeId: target,
    });
    if (res.ok) {
      audioFx.playApply();
    }
  };

  const handleRevert = (actionId: string) => {
    const res = dispatch({
      type: "REVERT_DESIGN_ACTION",
      meta: stubMeta(session.id),
      actionId,
    });
    if (res.ok) {
      audioFx.playApply();
    }
  };

  return (
    <div className="mt-4 border-t border-rule/80 pt-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
          Architectural Interventions
        </p>
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: "ROLLBACK_TO_BASELINE",
              meta: stubMeta(session.id),
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-paper px-2.5 py-1 text-xs font-medium text-ink-2 transition-colors hover:border-warn/50 hover:text-warn"
        >
          <Undo2 size={12} /> Reset to baseline
        </button>
      </div>

      <div className="space-y-2">
        {categories.map((cat) => {
          const actions = availability.filter((a) => {
            const def = caseDef.availableActions.find((d) => d.id === a.actionId)!;
            return def.category === cat;
          });
          if (actions.length === 0) return null;
          const isOpen = open === cat;
          return (
            <div key={cat} className="rounded-xl border border-rule/80 bg-paper-2/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : cat)}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-paper-3/40"
                aria-expanded={isOpen}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                <span className="rounded-full bg-paper-3 px-2 py-0.5 text-[10px] font-semibold text-ink-3">
                  {actions.length}
                </span>
              </button>
              {isOpen && (
                <ul className="space-y-2 border-t border-rule/60 p-2 bg-paper/50">
                  {actions.map((a) => {
                    const def = caseDef.availableActions.find(
                      (d) => d.id === a.actionId
                    )!;
                    return (
                      <li key={a.actionId}>
                        {a.isApplied ? (
                          <div className="rounded-lg border border-ok/40 bg-ok/10 p-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-ink">
                                {a.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRevert(a.actionId)}
                                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-bold text-ink-3 hover:text-warn hover:bg-warn/10"
                              >
                                <Undo2 size={11} /> Revert (+{def.cost})
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApply(a.actionId, a.validTargetNodeIds)}
                            disabled={!!a.disabledReason}
                            title={a.disabledReason ?? def.explanation}
                            className="lift group w-full rounded-lg border border-rule bg-paper p-2.5 text-left transition-colors hover:border-accent/50 hover:bg-paper-3/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-rule"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-ink group-hover:text-accent">
                                {a.title}
                              </span>
                              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent">
                                <Plus size={10} /> {def.cost}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-ink-3 line-clamp-1">{def.explanation}</p>
                            {def.operationalRisk !== "low" && (
                              <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-warn">
                                <AlertTriangle size={10} /> {def.operationalRisk} risk
                              </span>
                            )}
                            {a.disabledReason && (
                              <p className="mt-1 text-[10px] italic text-ink-3">
                                {a.disabledReason}
                              </p>
                            )}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
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
