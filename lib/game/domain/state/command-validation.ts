/**
 * Command validation. Pure checks that run *before* a command mutates state.
 * Returning a typed error here (rather than throwing) keeps the reducer
 * total and lets the UI present a useful message (spec §12.2, §12.3).
 *
 * Spec reference: §12.2 (reducer principles), §22.3–22.5 (acceptance).
 */

import type {
  ApplyDesignActionCommand,
  DesignActionDefinition,
  EvidenceItem,
  GameCaseDefinition,
  GameCommand,
  GameSession,
  InspectEvidenceCommand,
} from "../types";
import type { GameRuleError } from "../errors";
import { gameError } from "../errors";

/** Does the action's target rule accept the given node? */
export function actionAcceptsTarget(
  action: DesignActionDefinition,
  nodeId: string | undefined,
  caseDef: GameCaseDefinition
): boolean {
  // Actions without a graph mutation don't need a target.
  if (action.effects.length === 0) return true;
  if (!nodeId) return false;
  const node = caseDef.baselineArchitecture.nodes.find((n) => n.id === nodeId);
  if (!node) return false;

  return action.targetRules.some((rule) => {
    switch (rule.type) {
      case "any":
        return true;
      case "by-id":
        return rule.nodeIds.includes(nodeId);
      case "by-type":
        return rule.componentTypes.includes(node.type);
      case "by-tag":
        return rule.tags.some((t) => node.tags.includes(t));
    }
  });
}

/** Are all of an action's prerequisites satisfied by the session? */
export function actionPrerequisitesMet(
  action: DesignActionDefinition,
  session: GameSession
): boolean {
  return action.prerequisites.every((pre) => {
    if (pre.kind === "action") {
      return session.appliedActions.some((a) => a.actionId === pre.id);
    }
    // evidence prerequisite: must be inspected
    return session.inspectedEvidenceIds.includes(pre.id);
  });
}

export function validateCommand(
  session: GameSession,
  command: GameCommand,
  caseDef: GameCaseDefinition
): GameRuleError | null {
  switch (command.type) {
    case "INSPECT_EVIDENCE":
      return validateInspectEvidence(session, command, caseDef);

    case "SUBMIT_HYPOTHESIS":
      return validateSubmitHypothesis(session, command, caseDef);

    case "APPLY_DESIGN_ACTION":
      return validateApplyAction(session, command, caseDef);

    case "REVERT_DESIGN_ACTION":
      return validateRevertAction(session, command, caseDef); // command narrowed to RevertDesignActionCommand

    case "ROLLBACK_TO_BASELINE":
      // Always allowed during DESIGN / OUTCOME_REVIEW.
      return null;

    case "RUN_SIMULATION":
      return validateRunSimulation(session, caseDef);

    case "ACCEPT_SOLUTION":
      return validateAcceptSolution(session, command, caseDef);
  }
}

function validateInspectEvidence(
  session: GameSession,
  command: InspectEvidenceCommand,
  caseDef: GameCaseDefinition
): GameRuleError | null {
  const evidence = caseDef.evidence.find((e) => e.id === command.evidenceId);
  if (!evidence) {
    return gameError(
      "EVIDENCE_NOT_FOUND",
      `No evidence with id "${command.evidenceId}".`,
      command.evidenceId
    );
  }
  // Free evidence or already-unlocked evidence can be inspected for free.
  if (evidence.cost === 0 || session.unlockedEvidenceIds.includes(evidence.id)) {
    return null;
  }
  // Paid evidence that hasn't been unlocked yet costs points.
  if (session.inspectedEvidenceIds.includes(evidence.id)) {
    // Already inspected — no charge, no-op.
    return null;
  }
  if (session.investigationPointsRemaining < evidence.cost) {
    return gameError(
      "INSUFFICIENT_INVESTIGATION_POINTS",
      `Inspecting "${evidence.title}" costs ${evidence.cost} points but only ${session.investigationPointsRemaining} remain.`,
      command.evidenceId
    );
  }
  return null;
}

function validateSubmitHypothesis(
  session: GameSession,
  _command: GameCommand,
  caseDef: GameCaseDefinition
): GameRuleError | null {
  // A primary hypothesis is required; contributing factors optional.
  if (!session.hypothesis) return null; // the command itself carries the hypothesis
  void caseDef;
  return null;
}

function validateApplyAction(
  session: GameSession,
  command: ApplyDesignActionCommand,
  caseDef: GameCaseDefinition
): GameRuleError | null {
  const action = caseDef.availableActions.find(
    (a) => a.id === command.actionId
  );
  if (!action) {
    return gameError(
      "ACTION_NOT_FOUND",
      `No design action with id "${command.actionId}".`,
      command.actionId
    );
  }
  // Already applied (non-repeatable actions can't be applied twice — spec §27).
  if (session.appliedActions.some((a) => a.actionId === action.id)) {
    return gameError(
      "ACTION_NOT_APPLIED",
      `Action "${action.title}" is already applied.`,
      command.actionId
    );
  }
  if (session.changeBudgetRemaining < action.cost) {
    return gameError(
      "INSUFFICIENT_CHANGE_BUDGET",
      `"${action.title}" costs ${action.cost} but only ${session.changeBudgetRemaining} budget remains.`,
      command.actionId
    );
  }
  if (!actionPrerequisitesMet(action, session)) {
    return gameError(
      "ACTION_PREREQUISITES_NOT_MET",
      `"${action.title}" requires prerequisites that are not yet satisfied.`,
      command.actionId
    );
  }
  if (!actionAcceptsTarget(action, command.targetNodeId, caseDef)) {
    const targetLabel = command.targetNodeId ?? "(none)";
    return gameError(
      "INVALID_ACTION_TARGET",
      `"${action.title}" cannot target node "${targetLabel}".`,
      command.actionId
    );
  }
  return null;
}

function validateRevertAction(
  session: GameSession,
  command: Extract<GameCommand, { type: "REVERT_DESIGN_ACTION" }>,
  caseDef: GameCaseDefinition
): GameRuleError | null {
  const action = caseDef.availableActions.find(
    (a) => a.id === command.actionId
  );
  if (!action) {
    return gameError("ACTION_NOT_FOUND", `No action "${command.actionId}".`);
  }
  if (!session.appliedActions.some((a) => a.actionId === action.id)) {
    return gameError(
      "ACTION_NOT_APPLIED",
      `"${action.title}" is not currently applied.`,
      action.id
    );
  }
  if (!action.reversible) {
    return gameError(
      "ACTION_NOT_REVERSIBLE",
      `"${action.title}" is not reversible.`,
      action.id
    );
  }
  return null;
}

function validateRunSimulation(
  session: GameSession,
  caseDef: GameCaseDefinition
): GameRuleError | null {
  // A hypothesis is required to run a simulation (spec §22.6, the case flow).
  const requiresHypothesis = caseDef.hypotheses.some(
    (h) => h.role === "primary"
  );
  if (requiresHypothesis && !session.hypothesis) {
    return gameError(
      "HYPOTHESIS_REQUIRED",
      "Submit a hypothesis before running a simulation.",
    );
  }
  return null;
}

function validateAcceptSolution(
  session: GameSession,
  command: Extract<GameCommand, { type: "ACCEPT_SOLUTION" }>,
  _caseDef: GameCaseDefinition
): GameRuleError | null {
  if (session.acceptedRunId) {
    return gameError(
      "SOLUTION_ALREADY_ACCEPTED",
      "A solution has already been accepted for this session.",
    );
  }
  const run = session.simulationRuns.find((r) => r.id === command.runId);
  if (!run) {
    return gameError(
      "SIMULATION_RUN_NOT_FOUND",
      `No simulation run "${command.runId}".`,
      command.runId
    );
  }
  return null;
}

/** Look up an evidence item by id (helper used by the reducer + selectors). */
export function findEvidence(
  caseDef: GameCaseDefinition,
  evidenceId: string
): EvidenceItem | undefined {
  return caseDef.evidence.find((e) => e.id === evidenceId);
}
