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

export function ActionTray({ caseDef, session, dispatch, selectedNodeId }: Props) {
  const [open, setOpen] = useState<DesignActionCategory | null>("reliability");
  const availability = selectAvailableActions(session, caseDef);

  const categories = [...new Set(caseDef.availableActions.map((a) => a.category))];

  const handleApply = (actionId: string, validTargets: string[]) => {
    // Prefer the explicitly selected node if it's valid; else the first valid target.
    const target =
      selectedNodeId && validTargets.includes(selectedNodeId)
        ? selectedNodeId
        : validTargets[0];
    dispatch({
      type: "APPLY_DESIGN_ACTION",
      meta: stubMeta(session.id),
      actionId,
      targetNodeId: target,
    });
  };

  const handleRevert = (actionId: string) => {
    dispatch({
      type: "REVERT_DESIGN_ACTION",
      meta: stubMeta(session.id),
      actionId,
    });
  };

  return (
    <div className="mt-4 border-t border-rule pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
        Design actions
      </p>

      <button
        type="button"
        onClick={() =>
          dispatch({
            type: "ROLLBACK_TO_BASELINE",
            meta: stubMeta(session.id),
          })
        }
        className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-rule bg-paper px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-warn/50 hover:text-warn"
      >
        <Undo2 size={13} /> Reset to baseline
      </button>

      <div className="space-y-2">
        {categories.map((cat) => {
          const actions = availability.filter((a) => {
            const def = caseDef.availableActions.find((d) => d.id === a.actionId)!;
            return def.category === cat;
          });
          if (actions.length === 0) return null;
          const isOpen = open === cat;
          return (
            <div key={cat} className="rounded-lg border border-rule">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : cat)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-ink-2"
                aria-expanded={isOpen}
              >
                {CATEGORY_LABELS[cat]}
                <span className="text-ink-3">{actions.length}</span>
              </button>
              {isOpen && (
                <ul className="space-y-1.5 border-t border-rule p-2">
                  {actions.map((a) => {
                    const def = caseDef.availableActions.find(
                      (d) => d.id === a.actionId
                    )!;
                    return (
                      <li key={a.actionId}>
                        {a.isApplied ? (
                          <div className="rounded-lg border border-ok/30 bg-ok/5 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-ink">
                                {a.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRevert(a.actionId)}
                                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-ink-3 hover:text-warn"
                              >
                                <Undo2 size={11} /> revert (+{def.cost})
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApply(a.actionId, a.validTargetNodeIds)}
                            disabled={!!a.disabledReason}
                            title={a.disabledReason ?? def.explanation}
                            className="group w-full rounded-lg border border-rule bg-paper px-2.5 py-2 text-left transition-colors hover:border-accent/50 hover:bg-paper-3/40 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-ink">
                                {a.title}
                              </span>
                              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[11px] font-semibold text-accent">
                                <Plus size={9} /> {def.cost}
                              </span>
                            </div>
                            {def.operationalRisk !== "low" && (
                              <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-medium text-warn">
                                <AlertTriangle size={9} /> {def.operationalRisk} risk
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
