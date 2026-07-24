/**
 * Integration tests — the full game loop driven through commands, no browser.
 *
 * Spec §20.2 (integration), §20.3 (E2E happy path), §20.4 (wrong-solution path).
 * Since Playwright isn't installed, this walks the loop at the command layer,
 * which is where all business logic lives anyway. It exercises the same
 * reducer + simulation + scoring pipeline the UI uses.
 */

import { describe, it, expect } from "vitest";
import type {
  GameCaseDefinition,
  GameCommand,
  GameSession,
} from "@/lib/game/domain/types";
import { createSession } from "@/lib/game/domain/state/game-state";
import { applyGameCommand } from "@/lib/game/domain/state/game-reducer";
import { simulateCase } from "@/lib/game/domain/simulation/simulate-case";
import { scoreCase } from "@/lib/game/domain/scoring/score-case";
import { hashArchitecture } from "@/lib/game/domain/graph/graph-utils";
import { ghostOrdersCase } from "@/lib/game/content/cases/ghost-orders-at-midnight/case";

const FIXED_NOW = "2025-07-24T00:00:00.000Z";

let seq = 0;
function meta(sessionId: string) {
  seq += 1;
  return { id: `cmd_${seq}`, sessionId, issuedAt: FIXED_NOW, sequence: seq };
}

function freshSession(caseDef: GameCaseDefinition): GameSession {
  seq = 0;
  const s = createSession(caseDef, { id: "integration-session", now: () => FIXED_NOW });
  return { ...s, status: "INVESTIGATION" };
}

/** Apply a command, asserting it succeeded, returning the new session. */
function ok(session: GameSession, command: GameCommand, caseDef: GameCaseDefinition): GameSession {
  const r = applyGameCommand(session, command, caseDef);
  if (!r.ok) throw new Error(`command ${command.type} failed: ${r.error.message}`);
  return r.value;
}

describe("integration: happy path (spec §20.3)", () => {
  const caseDef = ghostOrdersCase;

  it("completes the tutorial end-to-end with the correct solution", () => {
    let session = freshSession(caseDef);

    // 1-3. Inspect the key evidence (gateway config, trace, schema).
    session = ok(session, { type: "INSPECT_EVIDENCE", meta: meta(session.id), evidenceId: "ev_gateway_retry_config" }, caseDef);
    session = ok(session, { type: "INSPECT_EVIDENCE", meta: meta(session.id), evidenceId: "ev_dup_order_trace" }, caseDef);
    session = ok(session, { type: "INSPECT_EVIDENCE", meta: meta(session.id), evidenceId: "ev_orders_schema" }, caseDef);

    // Evidence revealed the payment provider.
    expect(session.revealedNodeIds).toContain("payment-provider");

    // 4. Submit the correct hypothesis.
    session = ok(session, {
      type: "SUBMIT_HYPOTHESIS",
      meta: meta(session.id),
      hypothesis: {
        primaryHypothesisId: "hyp_gateway_retry",
        contributingFactorIds: ["contrib_missing_idem", "contrib_missing_uc"],
        citedEvidenceIds: ["ev_gateway_retry_config", "ev_dup_order_trace"],
        submittedAt: FIXED_NOW,
      },
    }, caseDef);
    expect(session.status).toBe("DESIGN");

    // 5-6. Apply the correct solution.
    session = ok(session, { type: "APPLY_DESIGN_ACTION", meta: meta(session.id), actionId: "action_client_checkout_id", targetNodeId: "browser" }, caseDef);
    session = ok(session, { type: "APPLY_DESIGN_ACTION", meta: meta(session.id), actionId: "action_idempotency_support", targetNodeId: "order-service" }, caseDef);
    session = ok(session, { type: "APPLY_DESIGN_ACTION", meta: meta(session.id), actionId: "action_safe_method_retries", targetNodeId: "gateway" }, caseDef);

    // 7. Run the simulation.
    const archHash = hashArchitecture(session.currentArchitecture);
    const seed = `${caseDef.id}:${session.id}:1:${archHash}`;
    const run = simulateCase(caseDef, session.currentArchitecture, session.appliedActions.map((a) => a.actionId), seed, 1);
    session = ok(session, { type: "RUN_SIMULATION", meta: meta(session.id), seed, run }, caseDef);
    expect(session.status).toBe("OUTCOME_REVIEW");

    // 8. The duplicate-order objective passed.
    const dupObj = run.objectiveResults.find((o) => o.objectiveId === "obj_dup_orders")!;
    expect(dupObj.status).toBe("passed");

    // 9. Accept the solution.
    session = ok(session, { type: "ACCEPT_SOLUTION", meta: meta(session.id), runId: run.id }, caseDef);
    expect(session.status).toBe("CASE_RESOLVED");
    expect(session.acceptedRunId).toBe(run.id);

    // 10. Score the result.
    const score = scoreCase(session, caseDef, run);
    expect(score.total).toBeGreaterThan(0);
    expect(score.total).toBeLessThanOrEqual(1000);
    expect(score.rank).toBeTruthy();
  });

  it("persists the command history for replay (spec §3.3)", () => {
    let session = freshSession(caseDef);
    session = ok(session, { type: "INSPECT_EVIDENCE", meta: meta(session.id), evidenceId: "ev_gateway_retry_config" }, caseDef);
    session = ok(session, { type: "INSPECT_EVIDENCE", meta: meta(session.id), evidenceId: "ev_orders_schema" }, caseDef);
    expect(session.commandLog.length).toBeGreaterThanOrEqual(2);
    expect(session.commandLog.map((c) => c.type)).toContain("INSPECT_EVIDENCE");
  });
});

describe("integration: wrong-solution path (spec §20.4)", () => {
  const caseDef = ghostOrdersCase;

  it("scaling-only solution fails for the right reason", () => {
    let session = freshSession(caseDef);
    session = ok(session, { type: "INSPECT_EVIDENCE", meta: meta(session.id), evidenceId: "ev_gateway_retry_config" }, caseDef);
    session = ok(session, {
      type: "SUBMIT_HYPOTHESIS",
      meta: meta(session.id),
      hypothesis: {
        primaryHypothesisId: "hyp_overload", // incorrect: blames overload
        contributingFactorIds: [],
        citedEvidenceIds: [],
        submittedAt: FIXED_NOW,
      },
    }, caseDef);

    // Apply only scaling actions.
    session = ok(session, { type: "APPLY_DESIGN_ACTION", meta: meta(session.id), actionId: "action_add_replicas", targetNodeId: "order-service" }, caseDef);
    session = ok(session, { type: "APPLY_DESIGN_ACTION", meta: meta(session.id), actionId: "action_increase_db", targetNodeId: "orders-db" }, caseDef);

    const archHash = hashArchitecture(session.currentArchitecture);
    const seed = `${caseDef.id}:${session.id}:1:${archHash}`;
    const run = simulateCase(caseDef, session.currentArchitecture, session.appliedActions.map((a) => a.actionId), seed, 1);
    session = ok(session, { type: "RUN_SIMULATION", meta: meta(session.id), seed, run }, caseDef);

    // Duplicates remain high — capacity didn't fix the semantic problem.
    const dupObj = run.objectiveResults.find((o) => o.objectiveId === "obj_dup_orders")!;
    expect(dupObj.status).toBe("failed");
    expect(run.summary.duplicateOrderRate).toBeGreaterThan(0.01);

    // Scoring the wrong hypothesis + failed objectives yields a low score.
    session = ok(session, { type: "ACCEPT_SOLUTION", meta: meta(session.id), runId: run.id }, caseDef);
    const score = scoreCase(session, caseDef, run);
    // A failed run should score materially below a correct run.
    expect(score.total).toBeLessThan(700);
  });

  it("can revise after a failed simulation (rollback keeps evidence)", () => {
    let session = freshSession(caseDef);
    session = ok(session, { type: "INSPECT_EVIDENCE", meta: meta(session.id), evidenceId: "ev_gateway_retry_config" }, caseDef);
    session = ok(session, {
      type: "SUBMIT_HYPOTHESIS",
      meta: meta(session.id),
      hypothesis: {
        primaryHypothesisId: "hyp_gateway_retry",
        contributingFactorIds: [],
        citedEvidenceIds: [],
        submittedAt: FIXED_NOW,
      },
    }, caseDef);

    // Apply scaling only, run, fail.
    session = ok(session, { type: "APPLY_DESIGN_ACTION", meta: meta(session.id), actionId: "action_add_replicas", targetNodeId: "order-service" }, caseDef);
    const archHash1 = hashArchitecture(session.currentArchitecture);
    const seed1 = `${caseDef.id}:${session.id}:1:${archHash1}`;
    const run1 = simulateCase(caseDef, session.currentArchitecture, session.appliedActions.map((a) => a.actionId), seed1, 1);
    session = ok(session, { type: "RUN_SIMULATION", meta: meta(session.id), seed: seed1, run: run1 }, caseDef);

    const inspectedBefore = session.inspectedEvidenceIds.length;

    // Roll back to baseline (evidence preserved).
    session = ok(session, { type: "ROLLBACK_TO_BASELINE", meta: meta(session.id) }, caseDef);
    expect(session.appliedActions).toHaveLength(0);
    expect(session.inspectedEvidenceIds.length).toBe(inspectedBefore);

    // Now apply the correct solution and pass.
    session = ok(session, { type: "APPLY_DESIGN_ACTION", meta: meta(session.id), actionId: "action_client_checkout_id", targetNodeId: "browser" }, caseDef);
    session = ok(session, { type: "APPLY_DESIGN_ACTION", meta: meta(session.id), actionId: "action_idempotency_support", targetNodeId: "order-service" }, caseDef);

    const archHash2 = hashArchitecture(session.currentArchitecture);
    const seed2 = `${caseDef.id}:${session.id}:2:${archHash2}`;
    const run2 = simulateCase(caseDef, session.currentArchitecture, session.appliedActions.map((a) => a.actionId), seed2, 2);
    const dupObj = run2.objectiveResults.find((o) => o.objectiveId === "obj_dup_orders")!;
    expect(dupObj.status).toBe("passed");
  });
});

describe("integration: persistence shape", () => {
  it("a session round-trips through JSON without loss (spec §22.8)", () => {
    const caseDef = ghostOrdersCase;
    let session = freshSession(caseDef);
    session = ok(session, { type: "INSPECT_EVIDENCE", meta: meta(session.id), evidenceId: "ev_gateway_retry_config" }, caseDef);

    const serialized = JSON.parse(JSON.stringify(session)) as GameSession;
    expect(serialized.caseId).toBe(session.caseId);
    expect(serialized.inspectedEvidenceIds).toEqual(session.inspectedEvidenceIds);
    expect(serialized.schemaVersion).toBe(1);
  });
});
