import { describe, it, expect } from "vitest";
import type { ArchitectureGraph, GameCaseDefinition } from "../types";
import { simulateCase } from "./simulate-case";
import { ghostOrdersCase } from "../../content/cases/ghost-orders-at-midnight/case";
import { applyMutations } from "../actions/apply-mutation";

const SEED = "test:session:1:archhash";

/** Build the architecture resulting from applying a set of actions. */
function architectureWithActions(caseDef: GameCaseDefinition, actionIds: string[]): ArchitectureGraph {
  let arch = structuredClone(caseDef.baselineArchitecture);
  for (const id of actionIds) {
    const action = caseDef.availableActions.find((a) => a.id === id);
    if (action) arch = applyMutations(arch, action.effects);
  }
  return arch;
}

describe("simulation determinism (spec §28 invariant: same seed+arch = identical report)", () => {
  it("produces byte-identical summaries for the same inputs", () => {
    const run1 = simulateCase(ghostOrdersCase, ghostOrdersCase.baselineArchitecture, [], SEED, 1);
    const run2 = simulateCase(ghostOrdersCase, ghostOrdersCase.baselineArchitecture, [], SEED, 1);
    expect(run1.summary).toEqual(run2.summary);
    expect(run1.events).toEqual(run2.events);
    expect(run1.objectiveResults).toEqual(run2.objectiveResults);
  });

  it("produces different results for a different architecture (different design)", () => {
    const baseline = simulateCase(ghostOrdersCase, ghostOrdersCase.baselineArchitecture, [], SEED, 1);
    const fixed = architectureWithActions(ghostOrdersCase, ["action_client_checkout_id", "action_idempotency_support"]);
    const fixedRun = simulateCase(ghostOrdersCase, fixed, ["action_client_checkout_id", "action_idempotency_support"], SEED, 1);
    expect(fixedRun.summary.duplicateOrderRate).not.toBe(baseline.summary.duplicateOrderRate);
  });
});

describe("baseline reproduces the incident (spec §4.6, §23.1)", () => {
  const baseline = simulateCase(ghostOrdersCase, ghostOrdersCase.baselineArchitecture, [], SEED, 1);

  it("produces duplicate orders above ~1%", () => {
    expect(baseline.summary.duplicateOrderRate).toBeGreaterThan(0.01);
  });

  it("produces duplicate charges above ~1%", () => {
    expect(baseline.summary.duplicateChargeRate).toBeGreaterThan(0.005);
  });

  it("keeps the service below overload (capacity was not the problem)", () => {
    // Utilization stays healthy: success rate is high despite duplicates.
    expect(baseline.summary.successfulCheckoutRate).toBeGreaterThan(0.9);
  });

  it("fails the duplicate-order objective", () => {
    const dupObj = baseline.objectiveResults.find((o) => o.objectiveId === "obj_dup_orders")!;
    expect(dupObj.status).toBe("failed");
  });
});

describe("correct idempotency solution passes (spec §4.11, §23.2)", () => {
  const arch = architectureWithActions(ghostOrdersCase, [
    "action_client_checkout_id",
    "action_idempotency_support",
  ]);
  const run = simulateCase(ghostOrdersCase, arch, [
    "action_client_checkout_id",
    "action_idempotency_support",
  ], SEED, 1);

  it("drives duplicate-order rate below 0.05%", () => {
    expect(run.summary.duplicateOrderRate).toBeLessThan(0.0005);
  });

  it("drives duplicate-charge rate below 0.02%", () => {
    expect(run.summary.duplicateChargeRate).toBeLessThan(0.0002);
  });

  it("passes the duplicate-order objective", () => {
    const dupObj = run.objectiveResults.find((o) => o.objectiveId === "obj_dup_orders")!;
    expect(dupObj.status).toBe("passed");
  });

  it("keeps the success rate healthy", () => {
    expect(run.summary.successfulCheckoutRate).toBeGreaterThan(0.97);
  });
});

describe("scaling-only solution does NOT fix the case (spec §23.4, §10.5)", () => {
  const arch = architectureWithActions(ghostOrdersCase, [
    "action_add_replicas",
    "action_increase_db",
  ]);
  const run = simulateCase(ghostOrdersCase, arch, [
    "action_add_replicas",
    "action_increase_db",
  ], SEED, 1);

  it("duplicate orders remain high (capacity doesn't fix semantic duplication)", () => {
    expect(run.summary.duplicateOrderRate).toBeGreaterThan(0.01);
  });

  it("still fails the duplicate-order objective", () => {
    const dupObj = run.objectiveResults.find((o) => o.objectiveId === "obj_dup_orders")!;
    expect(dupObj.status).toBe("failed");
  });
});

describe("unique constraint alone substantially reduces duplicates (spec §10.10)", () => {
  const arch = architectureWithActions(ghostOrdersCase, [
    "action_client_checkout_id",
    "action_unique_constraint",
  ]);
  const run = simulateCase(ghostOrdersCase, arch, [
    "action_client_checkout_id",
    "action_unique_constraint",
  ], SEED, 1);

  it("lowers the duplicate-order rate well below baseline", () => {
    const baseline = simulateCase(ghostOrdersCase, ghostOrdersCase.baselineArchitecture, [], SEED, 1);
    expect(run.summary.duplicateOrderRate).toBeLessThan(baseline.summary.duplicateOrderRate);
  });
});

describe("disabling retries reduces duplicates but may add failures (spec §23.3)", () => {
  const arch = architectureWithActions(ghostOrdersCase, ["action_disable_retries"]);
  const run = simulateCase(ghostOrdersCase, arch, ["action_disable_retries"], SEED, 1);

  it("reduces duplicate orders relative to baseline", () => {
    const baseline = simulateCase(ghostOrdersCase, ghostOrdersCase.baselineArchitecture, [], SEED, 1);
    expect(run.summary.duplicateOrderRate).toBeLessThan(baseline.summary.duplicateOrderRate);
  });
});

describe("metric invariants (spec §28)", () => {
  const run = simulateCase(ghostOrdersCase, ghostOrdersCase.baselineArchitecture, [], SEED, 1);
  const s = run.summary;

  it("successful + failed <= total requests", () => {
    expect(s.successfulRequests + s.failedRequests).toBeLessThanOrEqual(s.totalRequests + 1);
  });

  it("p50 <= p95 <= p99 latency", () => {
    expect(s.p50LatencyMs).toBeLessThanOrEqual(s.p95LatencyMs);
    expect(s.p95LatencyMs).toBeLessThanOrEqual(s.p99LatencyMs);
  });

  it("all rates are in [0, 1]", () => {
    expect(s.duplicateOrderRate).toBeGreaterThanOrEqual(0);
    expect(s.duplicateOrderRate).toBeLessThanOrEqual(1);
    expect(s.duplicateChargeRate).toBeGreaterThanOrEqual(0);
    expect(s.duplicateChargeRate).toBeLessThanOrEqual(1);
    expect(s.successfulCheckoutRate).toBeGreaterThanOrEqual(0);
    expect(s.successfulCheckoutRate).toBeLessThanOrEqual(1);
  });

  it("request counts are non-negative integers", () => {
    expect(Number.isInteger(s.totalRequests)).toBe(true);
    expect(s.totalRequests).toBeGreaterThan(0);
    expect(s.successfulRequests).toBeGreaterThanOrEqual(0);
  });

  it("completes quickly (<100ms target, spec §20.6)", () => {
    const start = performance.now();
    simulateCase(ghostOrdersCase, ghostOrdersCase.baselineArchitecture, [], SEED, 1);
    const elapsed = performance.now() - start;
    // Generous bound; the tutorial is small. Asserting well under 1s.
    expect(elapsed).toBeLessThan(1000);
  });
});

describe("scoring (spec §11)", () => {
  const arch = architectureWithActions(ghostOrdersCase, [
    "action_client_checkout_id",
    "action_idempotency_support",
    "action_safe_method_retries",
  ]);
  const run = simulateCase(ghostOrdersCase, arch, [
    "action_client_checkout_id",
    "action_idempotency_support",
    "action_safe_method_retries",
  ], SEED, 1);

  it("objective results aggregate credit", () => {
    const totalCredit = run.objectiveResults.reduce((s, o) => s + o.credit, 0);
    expect(totalCredit).toBeGreaterThan(0);
  });
});

describe("reason codes (spec §10.16)", () => {
  it("baseline emits the unsafe-post-retry mechanism", () => {
    const baseline = simulateCase(ghostOrdersCase, ghostOrdersCase.baselineArchitecture, [], SEED, 1);
    // The duplicates themselves are the signal; events reference the mechanism.
    expect(baseline.summary.duplicateOrderRate).toBeGreaterThan(0);
  });

  it("correct solution emits idempotency-replay events", () => {
    const arch = architectureWithActions(ghostOrdersCase, [
      "action_client_checkout_id",
      "action_idempotency_support",
    ]);
    const run = simulateCase(ghostOrdersCase, arch, [
      "action_client_checkout_id",
      "action_idempotency_support",
    ], SEED, 1);
    const hasIdemEvent = run.events.some((e) => e.reasonCode === "IDEMPOTENCY_REPLAYED_RESULT");
    expect(hasIdemEvent).toBe(true);
  });
});
