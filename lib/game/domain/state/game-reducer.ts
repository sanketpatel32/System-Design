/**
 * Game command reducer. The single entry point that mutates session state.
 *
 * Properties (spec §12.2):
 *  - Pure: same inputs → same outputs, no side effects.
 *  - Validates before applying; invalid commands return a typed Result.error.
 *  - Resource deductions happen atomically with the successful command.
 *  - Every accepted command is appended to the command log.
 *  - Accepted-solution state is frozen until explicit replay.
 *
 * The simulation itself is NOT computed here — `RUN_SIMULATION` stores the
 * run the caller provides (computed by the simulation service). The reducer
 * only owns state shape, not simulation math.
 */

import type {
  GameCaseDefinition,
  GameCommand,
  GameSession,
  Result,
} from "../types";
import type { GameRuleError } from "../errors";
import { validateCommand } from "./command-validation";
import { canTransition, withUpdatedTimestamp } from "./game-state";
import { applyMutations } from "../actions/apply-mutation";

export function applyGameCommand(
  session: GameSession,
  command: GameCommand,
  caseDef: GameCaseDefinition
): Result<GameSession, GameRuleError> {
  const error = validateCommand(session, command, caseDef);
  if (error) return { ok: false, error };

  const now = command.meta.issuedAt;
  const next = reduceValidatedCommand(session, command, caseDef, now);
  return { ok: true, value: withUpdatedTimestamp(next, now) };
}

function reduceValidatedCommand(
  session: GameSession,
  command: GameCommand,
  caseDef: GameCaseDefinition,
  now: string
): GameSession {
  switch (command.type) {
    case "INSPECT_EVIDENCE":
      return reduceInspectEvidence(session, command, caseDef);

    case "SUBMIT_HYPOTHESIS":
      return reduceSubmitHypothesis(session, command, caseDef);

    case "APPLY_DESIGN_ACTION":
      return reduceApplyAction(session, command, caseDef, now);

    case "REVERT_DESIGN_ACTION":
      return reduceRevertAction(session, command, caseDef);

    case "ROLLBACK_TO_BASELINE":
      return reduceRollback(session, command, caseDef);

    case "RUN_SIMULATION":
      return reduceRunSimulation(session, command, caseDef);

    case "ACCEPT_SOLUTION":
      return reduceAcceptSolution(session, command, caseDef);
  }
}

// ---------------------------------------------------------------------------
// INSPECT_EVIDENCE
// ---------------------------------------------------------------------------

function reduceInspectEvidence(
  session: GameSession,
  command: Extract<GameCommand, { type: "INSPECT_EVIDENCE" }>,
  caseDef: GameCaseDefinition
): GameSession {
  const evidence = caseDef.evidence.find((e) => e.id === command.evidenceId)!;
  const alreadyInspected = session.inspectedEvidenceIds.includes(evidence.id);
  const alreadyUnlocked = session.unlockedEvidenceIds.includes(evidence.id);

  // Idempotent: re-inspecting already-seen evidence is free and a no-op on
  // points/state (spec §22.3: "Evidence can be revisited for free").
  if (alreadyInspected && alreadyUnlocked) {
    return appendCommand(session, command);
  }

  let points = session.investigationPointsRemaining;
  let unlocked = session.unlockedEvidenceIds;
  // Pay the cost the first time only.
  if (!alreadyUnlocked && evidence.cost > 0) {
    points -= evidence.cost;
    unlocked = [...unlocked, evidence.id];
  }

  // Apply reveal effects (reveal nodes/edges/config, unlock hypotheses/actions).
  let revealedNodes = session.revealedNodeIds;
  let revealedEdges = session.revealedEdgeIds;
  let unlockedHypotheses = session.unlockedHypothesisIds;
  let unlockedActions = session.unlockedActionIds;
  let revealedConfigs = session.revealedConfigKeys;
  for (const reveal of evidence.reveals) {
    switch (reveal.type) {
      case "reveal-node":
        if (!revealedNodes.includes(reveal.nodeId))
          revealedNodes = [...revealedNodes, reveal.nodeId];
        break;
      case "reveal-edge":
        if (!revealedEdges.includes(reveal.edgeId))
          revealedEdges = [...revealedEdges, reveal.edgeId];
        break;
      case "reveal-config": {
        const key = `${reveal.nodeId}.${reveal.configKey}`;
        if (!revealedConfigs.includes(key))
          revealedConfigs = [...revealedConfigs, key];
        break;
      }
      case "unlock-hypothesis":
        if (!unlockedHypotheses.includes(reveal.hypothesisId))
          unlockedHypotheses = [...unlockedHypotheses, reveal.hypothesisId];
        break;
      case "unlock-action":
        if (!unlockedActions.includes(reveal.actionId))
          unlockedActions = [...unlockedActions, reveal.actionId];
        break;
      case "add-metric":
        // Metrics are derived from evidence at read time; no session field needed.
        break;
    }
  }

  return appendCommand(
    {
      ...session,
      investigationPointsRemaining: points,
      unlockedEvidenceIds: unlocked,
      inspectedEvidenceIds: alreadyInspected
        ? session.inspectedEvidenceIds
        : [...session.inspectedEvidenceIds, evidence.id],
      revealedNodeIds: revealedNodes,
      revealedEdgeIds: revealedEdges,
      unlockedHypothesisIds: unlockedHypotheses,
      unlockedActionIds: unlockedActions,
      revealedConfigKeys: revealedConfigs,
    },
    command
  );
}

// ---------------------------------------------------------------------------
// SUBMIT_HYPOTHESIS
// ---------------------------------------------------------------------------

function reduceSubmitHypothesis(
  session: GameSession,
  command: Extract<GameCommand, { type: "SUBMIT_HYPOTHESIS" }>,
  _caseDef: GameCaseDefinition
): GameSession {
  // Transition INVESTIGATION -> HYPOTHESIS_READY -> DESIGN, or just update if
  // revising from DESIGN/OUTCOME_REVIEW.
  const phase = canTransition(session.status, "SUBMIT_HYPOTHESIS")
    ? "DESIGN"
    : session.status;
  return appendCommand(
    {
      ...session,
      hypothesis: command.hypothesis,
      status: phase as GameSession["status"],
    },
    command
  );
}

// ---------------------------------------------------------------------------
// APPLY_DESIGN_ACTION / REVERT_DESIGN_ACTION
// ---------------------------------------------------------------------------

function reduceApplyAction(
  session: GameSession,
  command: Extract<GameCommand, { type: "APPLY_DESIGN_ACTION" }>,
  caseDef: GameCaseDefinition,
  now: string
): GameSession {
  const action = caseDef.availableActions.find(
    (a) => a.id === command.actionId
  )!;
  const newArchitecture = applyMutations(session.currentArchitecture, action.effects);

  return appendCommand(
    {
      ...session,
      currentArchitecture: newArchitecture,
      changeBudgetRemaining: session.changeBudgetRemaining - action.cost,
      appliedActions: [
        ...session.appliedActions,
        {
          actionId: action.id,
          targetNodeId: command.targetNodeId,
          appliedAt: now,
        },
      ],
    },
    command
  );
}

function reduceRevertAction(
  session: GameSession,
  command: Extract<GameCommand, { type: "REVERT_DESIGN_ACTION" }>,
  caseDef: GameCaseDefinition
): GameSession {
  const action = caseDef.availableActions.find(
    (a) => a.id === command.actionId
  )!;
  // Rebuild the architecture from the baseline by replaying every OTHER
  // applied action. This is O(applied) and keeps revert correct even when
  // actions interact (spec §12.4: "Remove or reverse player-added design
  // actions before simulation").
  const remaining = session.appliedActions.filter(
    (a) => a.actionId !== action.id
  );
  let arch = structuredClone(caseDef.baselineArchitecture);
  for (const record of remaining) {
    const a = caseDef.availableActions.find((x) => x.id === record.actionId);
    if (a) arch = applyMutations(arch, a.effects);
  }
  return appendCommand(
    {
      ...session,
      currentArchitecture: arch,
      changeBudgetRemaining: session.changeBudgetRemaining + action.cost,
      appliedActions: remaining,
    },
    command
  );
}

// ---------------------------------------------------------------------------
// ROLLBACK_TO_BASELINE
// ---------------------------------------------------------------------------

function reduceRollback(
  session: GameSession,
  command: Extract<GameCommand, { type: "ROLLBACK_TO_BASELINE" }>,
  caseDef: GameCaseDefinition
): GameSession {
  // Keep evidence, hypothesis, and simulation history. Reset only the
  // architecture + budget (spec §12.4).
  return appendCommand(
    {
      ...session,
      currentArchitecture: structuredClone(caseDef.baselineArchitecture),
      changeBudgetRemaining: caseDef.resources.changeBudget,
      appliedActions: [],
    },
    command
  );
}

// ---------------------------------------------------------------------------
// RUN_SIMULATION
// ---------------------------------------------------------------------------

function reduceRunSimulation(
  session: GameSession,
  command: Extract<GameCommand, { type: "RUN_SIMULATION" }>,
  _caseDef: GameCaseDefinition
): GameSession {
  // The simulation service computes the run; the reducer only records it.
  // The run travels on the command so the reducer stays pure (spec §12.2, §15.4).
  return appendCommand(
    {
      ...session,
      status: "OUTCOME_REVIEW",
      simulationRuns: [...session.simulationRuns, command.run],
    },
    command
  );
}

// ---------------------------------------------------------------------------
// ACCEPT_SOLUTION
// ---------------------------------------------------------------------------

function reduceAcceptSolution(
  session: GameSession,
  command: Extract<GameCommand, { type: "ACCEPT_SOLUTION" }>,
  _caseDef: GameCaseDefinition
): GameSession {
  return appendCommand(
    {
      ...session,
      status: "CASE_RESOLVED",
      acceptedRunId: command.runId,
    },
    command
  );
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function appendCommand(
  session: GameSession,
  command: GameCommand
): GameSession {
  return {
    ...session,
    commandLog: [...session.commandLog, command],
  };
}
