/**
 * Session state machine + creation.
 *
 * The phase machine (spec §3.4) is explicit: a table of (current, event)
 * pairs. The reducer consults `canTransition` before applying any command that
 * moves between phases, so flow bugs surface as typed errors rather than
 * weird UI states.
 *
 * Spec reference: §3.4 (case state machine), §12.2 (reducer principles).
 */

import type {
  GameCaseDefinition,
  GamePhase,
  GameSession,
  SessionId,
} from "../types";
import { hashArchitecture } from "../graph/graph-utils";

/** Events that drive phase transitions (spec §3.4 table). */
export type PhaseEvent =
  | "CASE_LOADED"
  | "START_CASE"
  | "CAN_FORM_HYPOTHESIS"
  | "SUBMIT_HYPOTHESIS"
  | "RUN_SIMULATION"
  | "SIMULATION_COMPLETE"
  | "REVISE"
  | "INVESTIGATE_MORE"
  | "ACCEPT_SOLUTION"
  | "SHOW_DEBRIEF";

const TRANSITIONS: Record<GamePhase, Partial<Record<PhaseEvent, GamePhase>>> = {
  LOADING: { CASE_LOADED: "BRIEFING" },
  BRIEFING: { START_CASE: "INVESTIGATION" },
  // The player can submit a hypothesis directly from investigation (the
  // HYPOTHESIS_READY intermediate is optional — spec §3.4 note: "UI may still
  // allow more investigation"). Both paths lead to DESIGN.
  INVESTIGATION: { CAN_FORM_HYPOTHESIS: "HYPOTHESIS_READY", SUBMIT_HYPOTHESIS: "DESIGN" },
  HYPOTHESIS_READY: { SUBMIT_HYPOTHESIS: "DESIGN" },
  DESIGN: { RUN_SIMULATION: "SIMULATING" },
  SIMULATING: { SIMULATION_COMPLETE: "OUTCOME_REVIEW" },
  OUTCOME_REVIEW: {
    REVISE: "DESIGN",
    INVESTIGATE_MORE: "INVESTIGATION",
    ACCEPT_SOLUTION: "CASE_RESOLVED",
  },
  CASE_RESOLVED: { SHOW_DEBRIEF: "DEBRIEF" },
  DEBRIEF: {},
};

export function canTransition(
  from: GamePhase,
  event: PhaseEvent
): boolean {
  return TRANSITIONS[from]?.[event] !== undefined;
}

export function transition(
  from: GamePhase,
  event: PhaseEvent
): GamePhase | undefined {
  return TRANSITIONS[from]?.[event];
}

/**
 * Create a fresh session for a case. The current architecture starts as a copy
 * of the baseline, and only the initially-visible nodes/edges are "revealed".
 *
 * Id generation uses crypto.randomUUID when available (spec §26) with a
 * timestamp fallback for non-crypto environments (tests).
 */
export function createSession(
  caseDef: GameCaseDefinition,
  options?: { id?: SessionId; now?: () => string }
): GameSession {
  const now = options?.now ?? defaultNow;
  const id = options?.id ?? generateId();
  const baselineHash = hashArchitecture(caseDef.baselineArchitecture);

  return {
    schemaVersion: 1,
    id,
    caseId: caseDef.id,
    status: "BRIEFING",
    createdAt: now(),
    updatedAt: now(),
    investigationPointsRemaining: caseDef.resources.investigationPoints,
    changeBudgetRemaining: caseDef.resources.changeBudget,
    incidentToleranceRemaining: caseDef.resources.incidentTolerance,
    // Free evidence is unlocked at creation (spec §4.7).
    unlockedEvidenceIds: caseDef.evidence
      .filter((e) => e.initiallyUnlocked)
      .map((e) => e.id),
    inspectedEvidenceIds: [],
    revealedNodeIds: [...caseDef.initialVisibility.revealedNodeIds],
    revealedEdgeIds: [...caseDef.initialVisibility.revealedEdgeIds],
    currentArchitecture: structuredClone(caseDef.baselineArchitecture),
    baselineArchitectureHash: baselineHash,
    appliedActions: [],
    commandLog: [],
    simulationRuns: [],
  };
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `s_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

function defaultNow(): string {
  return new Date().toISOString();
}

/** Mark a session updated; the reducer calls this on every successful command. */
export function withUpdatedTimestamp(
  session: GameSession,
  now: string
): GameSession {
  return { ...session, updatedAt: now };
}
