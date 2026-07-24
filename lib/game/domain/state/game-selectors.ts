/**
 * View-model selectors. Transform domain state into shapes the UI renders
 * directly, keeping components free of business logic (spec §15.5).
 *
 * All selectors are pure functions of (session, caseDef).
 */

import type {
  EvidenceItem,
  EvidenceReliability,
  GameCaseDefinition,
  GameSession,
  NodeId,
} from "../types";
import { diffGraphs } from "../graph/graph-utils";
import { actionAcceptsTarget, actionPrerequisitesMet } from "./command-validation";

export interface EvidenceCardViewModel {
  id: string;
  title: string;
  cost: number;
  reliability: EvidenceReliability;
  preview: string;
  isUnlocked: boolean;
  isInspected: boolean;
  isNew: boolean;
  isRedHerring: boolean;
  affordable: boolean;
}

export function selectEvidenceCards(
  session: GameSession,
  caseDef: GameCaseDefinition
): EvidenceCardViewModel[] {
  const inspected = new Set(session.inspectedEvidenceIds);
  const unlocked = new Set(session.unlockedEvidenceIds);
  return caseDef.evidence.map((ev) => ({
    id: ev.id,
    title: ev.title,
    cost: ev.cost,
    reliability: ev.reliability,
    preview: ev.preview,
    isUnlocked: unlocked.has(ev.id),
    isInspected: inspected.has(ev.id),
    isNew: !inspected.has(ev.id),
    isRedHerring: ev.isRedHerring === true,
    affordable: session.investigationPointsRemaining >= ev.cost,
  }));
}

/** Is a node currently visible to the player (revealed, not hidden)? */
export function isNodeVisible(
  session: GameSession,
  nodeId: NodeId
): boolean {
  return session.revealedNodeIds.includes(nodeId);
}

export interface ActionAvailability {
  actionId: string;
  title: string;
  cost: number;
  affordable: boolean;
  prerequisitesMet: boolean;
  /** Best target node for this action, if any (for auto-targeting). */
  validTargetNodeIds: string[];
  isApplied: boolean;
  disabledReason: string | null;
}

export function selectAvailableActions(
  session: GameSession,
  caseDef: GameCaseDefinition
): ActionAvailability[] {
  const applied = new Set(session.appliedActions.map((a) => a.actionId));
  return caseDef.availableActions.map((action) => {
    const affordable = session.changeBudgetRemaining >= action.cost;
    const prereqsMet = actionPrerequisitesMet(action, session);
    const validTargets = caseDef.baselineArchitecture.nodes
      .filter((n) => actionAcceptsTarget(action, n.id, caseDef))
      .map((n) => n.id);
    const isApplied = applied.has(action.id);

    let disabledReason: string | null = null;
    if (isApplied) disabledReason = "Already applied.";
    else if (!prereqsMet) disabledReason = "Requires a prerequisite action.";
    else if (!affordable) disabledReason = "Not enough change budget.";
    else if (action.effects.length > 0 && validTargets.length === 0)
      disabledReason = "No valid target node.";

    return {
      actionId: action.id,
      title: action.title,
      cost: action.cost,
      affordable,
      prerequisitesMet: prereqsMet,
      validTargetNodeIds: validTargets,
      isApplied,
      disabledReason,
    };
  });
}

export interface NodeViewModel {
  id: NodeId;
  label: string;
  type: string;
  x: number;
  y: number;
  visibility: "hidden" | "silhouette" | "revealed";
  isPlayerAdded: boolean;
  isChanged: boolean;
}

export function selectArchitectureView(
  session: GameSession,
  caseDef: GameCaseDefinition
): { nodes: NodeViewModel[]; changedNodeIds: string[] } {
  const diff = diffGraphs(caseDef.baselineArchitecture, session.currentArchitecture);
  const changed = new Set([...diff.addedNodeIds, ...diff.changedNodeIds]);
  const nodes: NodeViewModel[] = session.currentArchitecture.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    type: n.type,
    x: n.position.x,
    y: n.position.y,
    visibility: session.revealedNodeIds.includes(n.id)
      ? "revealed"
      : n.visibility,
    isPlayerAdded: n.ownership === "player-added",
    isChanged: changed.has(n.id),
  }));
  return { nodes, changedNodeIds: [...changed] };
}

/** Can the player run a simulation right now? */
export function selectCanRunSimulation(
  session: GameSession,
  caseDef: GameCaseDefinition
): boolean {
  const requiresHypothesis = caseDef.hypotheses.some(
    (h) => h.role === "primary"
  );
  return !requiresHypothesis || !!session.hypothesis;
}

/** Find the latest simulation run, if any. */
export function selectLatestRun(
  session: GameSession
): GameSession["simulationRuns"][number] | undefined {
  if (session.simulationRuns.length === 0) return undefined;
  return session.simulationRuns[session.simulationRuns.length - 1];
}

/** Convenience: look up an evidence item. */
export function findEvidence(
  caseDef: GameCaseDefinition,
  evidenceId: string
): EvidenceItem | undefined {
  return caseDef.evidence.find((e) => e.id === evidenceId);
}
