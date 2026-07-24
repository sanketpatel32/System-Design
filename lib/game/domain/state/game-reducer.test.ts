import { describe, it, expect, beforeEach } from "vitest";
import type {
  GameCaseDefinition,
  GameCommand,
  GameSession,
  SimulationRun,
} from "../types";
import { createSession } from "./game-state";
import { applyGameCommand } from "./game-reducer";
import { ghostOrdersCase } from "../../content/cases/ghost-orders-at-midnight/case";

let caseDef: GameCaseDefinition;
let session: GameSession;
const FIXED_NOW = "2025-07-24T00:00:00.000Z";

function meta(seq: number) {
  return {
    id: `cmd_${seq}`,
    sessionId: session.id,
    issuedAt: FIXED_NOW,
    sequence: seq,
  };
}

beforeEach(() => {
  caseDef = structuredClone(ghostOrdersCase);
  session = createSession(caseDef, {
    id: "test-session",
    now: () => FIXED_NOW,
  });
  // Move to INVESTIGATION phase for most tests.
  session = applyGameCommand(
    session,
    { type: "SUBMIT_HYPOTHESIS", meta: meta(1), hypothesis: stubHypothesis() },
    caseDef
  ).ok ? session : session;
  // The submit above transitions BRIEFING? No — BRIEFING -> START_CASE first.
});

function stubHypothesis() {
  return {
    primaryHypothesisId: "hyp_gateway_retry",
    contributingFactorIds: ["contrib_missing_idem"],
    citedEvidenceIds: [],
    submittedAt: FIXED_NOW,
  };
}

/** Helper: run START_CASE then return INVESTIGATION-phase session. */
function startCase(): GameSession {
  // START_CASE is a phase transition the UI triggers; model it directly here
  // by setting status, since BRIEFING->START_CASE->INVESTIGATION is UI-driven.
  let s: GameSession = { ...session, status: "INVESTIGATION" };
  return s;
}

describe("createSession", () => {
  it("initializes with the case's resource budgets", () => {
    expect(session.investigationPointsRemaining).toBe(7);
    expect(session.changeBudgetRemaining).toBe(6);
    expect(session.incidentToleranceRemaining).toBe(3);
  });

  it("starts in BRIEFING phase", () => {
    expect(session.status).toBe("BRIEFING");
  });

  it("unlocks free evidence and reveals initial visibility", () => {
    expect(session.unlockedEvidenceIds).toContain("ev_incident_summary");
    expect(session.unlockedEvidenceIds).not.toContain("ev_gateway_retry_config");
    expect(session.revealedNodeIds).toContain("browser");
    expect(session.revealedNodeIds).not.toContain("payment-provider");
  });

  it("records a stable baseline hash", () => {
    expect(session.baselineArchitectureHash.length).toBeGreaterThan(0);
  });
});

describe("INSPECT_EVIDENCE", () => {
  beforeEach(() => {
    session = startCase();
  });

  it("deducts investigation points exactly once for paid evidence", () => {
    const before = session.investigationPointsRemaining;
    const cmd: GameCommand = {
      type: "INSPECT_EVIDENCE",
      meta: meta(1),
      evidenceId: "ev_gateway_retry_config",
    };
    const r1 = applyGameCommand(session, cmd, caseDef);
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    expect(r1.value.investigationPointsRemaining).toBe(before - 1);

    // Inspect again — must not double-charge.
    const cmd2 = { ...cmd, meta: meta(2) };
    const r2 = applyGameCommand(r1.value, cmd2, caseDef);
    expect(r2.ok).toBe(true);
    if (!r2.ok) return;
    expect(r2.value.investigationPointsRemaining).toBe(before - 1);
  });

  it("rejects inspection when points are insufficient", () => {
    session = { ...session, investigationPointsRemaining: 0 };
    const cmd: GameCommand = {
      type: "INSPECT_EVIDENCE",
      meta: meta(1),
      evidenceId: "ev_dup_order_trace", // cost 2
    };
    const r = applyGameCommand(session, cmd, caseDef);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.reason).toBe("INSUFFICIENT_INVESTIGATION_POINTS");
  });

  it("applies reveal effects immediately (spec §22.3)", () => {
    const cmd: GameCommand = {
      type: "INSPECT_EVIDENCE",
      meta: meta(1),
      evidenceId: "ev_dup_order_trace", // reveals payment-provider node + edge
    };
    const r = applyGameCommand(session, cmd, caseDef);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.revealedNodeIds).toContain("payment-provider");
    expect(r.value.revealedEdgeIds).toContain("e-order-payment");
  });

  it("free evidence is always inspectable at no cost", () => {
    const before = session.investigationPointsRemaining;
    const cmd: GameCommand = {
      type: "INSPECT_EVIDENCE",
      meta: meta(1),
      evidenceId: "ev_incident_summary", // cost 0
    };
    const r = applyGameCommand(session, cmd, caseDef);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.investigationPointsRemaining).toBe(before);
  });
});

describe("APPLY_DESIGN_ACTION", () => {
  beforeEach(() => {
    session = startCase();
  });

  it("applies a valid action, deducts budget, and changes the graph", () => {
    const before = session.changeBudgetRemaining;
    const cmd: GameCommand = {
      type: "APPLY_DESIGN_ACTION",
      meta: meta(1),
      actionId: "action_client_checkout_id",
      targetNodeId: "browser",
    };
    const r = applyGameCommand(session, cmd, caseDef);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.changeBudgetRemaining).toBe(before - 2);
    expect(r.value.appliedActions.map((a) => a.actionId)).toContain(
      "action_client_checkout_id"
    );
  });

  it("rejects when change budget is insufficient", () => {
    session = { ...session, changeBudgetRemaining: 1 };
    const cmd: GameCommand = {
      type: "APPLY_DESIGN_ACTION",
      meta: meta(1),
      actionId: "action_idempotency_support", // cost 3
      targetNodeId: "order-service",
    };
    const r = applyGameCommand(session, cmd, caseDef);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.reason).toBe("INSUFFICIENT_CHANGE_BUDGET");
  });

  it("rejects applying a non-repeatable action twice (spec §27)", () => {
    const cmd: GameCommand = {
      type: "APPLY_DESIGN_ACTION",
      meta: meta(1),
      actionId: "action_client_checkout_id",
      targetNodeId: "browser",
    };
    const r1 = applyGameCommand(session, cmd, caseDef);
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    const cmd2 = { ...cmd, meta: meta(2) };
    const r2 = applyGameCommand(r1.value, cmd2, caseDef);
    expect(r2.ok).toBe(false);
  });

  it("rejects when prerequisites are unmet", () => {
    // idempotency support requires action_client_checkout_id first.
    const cmd: GameCommand = {
      type: "APPLY_DESIGN_ACTION",
      meta: meta(1),
      actionId: "action_idempotency_support",
      targetNodeId: "order-service",
    };
    const r = applyGameCommand(session, cmd, caseDef);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.reason).toBe("ACTION_PREREQUISITES_NOT_MET");
  });

  it("rejects an invalid target node", () => {
    const cmd: GameCommand = {
      type: "APPLY_DESIGN_ACTION",
      meta: meta(1),
      actionId: "action_client_checkout_id", // targets browser only
      targetNodeId: "orders-db",
    };
    const r = applyGameCommand(session, cmd, caseDef);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.reason).toBe("INVALID_ACTION_TARGET");
  });
});

describe("REVERT_DESIGN_ACTION", () => {
  beforeEach(() => {
    session = startCase();
  });

  it("reverses an applied action and refunds the budget", () => {
    const apply: GameCommand = {
      type: "APPLY_DESIGN_ACTION",
      meta: meta(1),
      actionId: "action_client_checkout_id",
      targetNodeId: "browser",
    };
    session = (applyGameCommand(session, apply, caseDef) as { ok: true; value: GameSession }).value;
    const before = session.changeBudgetRemaining;

    const revert: GameCommand = {
      type: "REVERT_DESIGN_ACTION",
      meta: meta(2),
      actionId: "action_client_checkout_id",
    };
    const r = applyGameCommand(session, revert, caseDef);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.changeBudgetRemaining).toBe(before + 2);
    expect(r.value.appliedActions).toHaveLength(0);
  });

  it("rebuilding after revert preserves the effects of remaining actions", () => {
    // Apply two actions, revert the first, second must still be in effect.
    const a1: GameCommand = {
      type: "APPLY_DESIGN_ACTION",
      meta: meta(1),
      actionId: "action_client_checkout_id",
      targetNodeId: "browser",
    };
    const a2: GameCommand = {
      type: "APPLY_DESIGN_ACTION",
      meta: meta(2),
      actionId: "action_safe_method_retries",
      targetNodeId: "gateway",
    };
    session = (applyGameCommand(session, a1, caseDef) as { ok: true; value: GameSession }).value;
    session = (applyGameCommand(session, a2, caseDef) as { ok: true; value: GameSession }).value;

    const revert: GameCommand = {
      type: "REVERT_DESIGN_ACTION",
      meta: meta(3),
      actionId: "action_client_checkout_id",
    };
    const r = applyGameCommand(session, revert, caseDef);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.appliedActions.map((a) => a.actionId)).toEqual([
      "action_safe_method_retries",
    ]);
    // The gateway's retryMethods should still reflect the safe-method change.
    const gw = r.value.currentArchitecture.nodes.find((n) => n.id === "gateway")!;
    expect(gw.config.kind).toBe("api-gateway");
    if (gw.config.kind === "api-gateway") {
      expect(gw.config.retryMethods).toEqual(["GET"]);
    }
  });
});

describe("ROLLBACK_TO_BASELINE", () => {
  beforeEach(() => {
    session = startCase();
  });

  it("resets architecture + budget but preserves evidence (spec §12.4)", () => {
    // Spend evidence + apply an action.
    const inspect: GameCommand = {
      type: "INSPECT_EVIDENCE",
      meta: meta(1),
      evidenceId: "ev_gateway_retry_config",
    };
    const apply: GameCommand = {
      type: "APPLY_DESIGN_ACTION",
      meta: meta(2),
      actionId: "action_disable_retries",
      targetNodeId: "gateway",
    };
    session = (applyGameCommand(session, inspect, caseDef) as { ok: true; value: GameSession }).value;
    session = (applyGameCommand(session, apply, caseDef) as { ok: true; value: GameSession }).value;
    const inspectedBefore = session.inspectedEvidenceIds;

    const rollback: GameCommand = {
      type: "ROLLBACK_TO_BASELINE",
      meta: meta(3),
    };
    const r = applyGameCommand(session, rollback, caseDef);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.changeBudgetRemaining).toBe(6); // reset
    expect(r.value.appliedActions).toHaveLength(0); // reset
    expect(r.value.inspectedEvidenceIds).toEqual(inspectedBefore); // preserved
  });
});

describe("RUN_SIMULATION + ACCEPT_SOLUTION", () => {
  beforeEach(() => {
    session = startCase();
    session = {
      ...session,
      status: "DESIGN",
      hypothesis: stubHypothesis(),
    };
  });

  it("requires a hypothesis before running (spec §22.6)", () => {
    session = { ...session, hypothesis: undefined };
    const cmd: GameCommand = {
      type: "RUN_SIMULATION",
      meta: meta(1),
      seed: "test-seed",
      run: stubRun("run-1"),
    };
    const r = applyGameCommand(session, cmd, caseDef);
    expect(r.ok).toBe(false);
  });

  it("records a simulation run and moves to OUTCOME_REVIEW", () => {
    const cmd: GameCommand = {
      type: "RUN_SIMULATION",
      meta: meta(1),
      seed: "test-seed",
      run: stubRun("run-1"),
    };
    const r = applyGameCommand(session, cmd, caseDef);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("OUTCOME_REVIEW");
    expect(r.value.simulationRuns).toHaveLength(1);
  });

  it("accepts a solution and freezes the session", () => {
    const runCmd: GameCommand = {
      type: "RUN_SIMULATION",
      meta: meta(1),
      seed: "s",
      run: stubRun("run-1"),
    };
    session = (applyGameCommand(session, runCmd, caseDef) as { ok: true; value: GameSession }).value;

    const accept: GameCommand = {
      type: "ACCEPT_SOLUTION",
      meta: meta(2),
      runId: "run-1",
    };
    const r = applyGameCommand(session, accept, caseDef);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("CASE_RESOLVED");
    expect(r.value.acceptedRunId).toBe("run-1");
  });

  it("cannot accept a solution twice (spec §20.1)", () => {
    const runCmd: GameCommand = {
      type: "RUN_SIMULATION",
      meta: meta(1),
      seed: "s",
      run: stubRun("run-1"),
    };
    session = (applyGameCommand(session, runCmd, caseDef) as { ok: true; value: GameSession }).value;
    const accept: GameCommand = {
      type: "ACCEPT_SOLUTION",
      meta: meta(2),
      runId: "run-1",
    };
    session = (applyGameCommand(session, accept, caseDef) as { ok: true; value: GameSession }).value;
    const r2 = applyGameCommand(session, accept, caseDef);
    expect(r2.ok).toBe(false);
  });
});

describe("command log", () => {
  beforeEach(() => {
    session = startCase();
  });

  it("appends every accepted command (spec §3.3)", () => {
    const cmd: GameCommand = {
      type: "INSPECT_EVIDENCE",
      meta: meta(1),
      evidenceId: "ev_gateway_retry_config",
    };
    const r = applyGameCommand(session, cmd, caseDef);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.commandLog).toHaveLength(1);
    expect(r.value.commandLog[0].type).toBe("INSPECT_EVIDENCE");
  });
});

function stubRun(id: string): SimulationRun {
  return {
    id,
    seed: "test-seed",
    architectureHash: "hash",
    startedAt: FIXED_NOW,
    virtualDurationSeconds: 60,
    metrics: [],
    events: [],
    objectiveResults: [],
    summary: {
      totalRequests: 1000,
      successfulRequests: 950,
      failedRequests: 50,
      p50LatencyMs: 800,
      p95LatencyMs: 2500,
      p99LatencyMs: 2900,
      duplicateOrderRate: 0.018,
      duplicateChargeRate: 0.015,
      successfulCheckoutRate: 0.95,
      estimatedCostUnits: 5,
      complexityUnits: 3,
      newRisks: [],
      residualRisks: [],
    },
    appliedActionIds: [],
  };
}
