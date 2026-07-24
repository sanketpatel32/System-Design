import { describe, it, expect } from "vitest";
import { validateCase } from "./case-validator";
import { CaseValidationError } from "./errors";
import { ghostOrdersCase } from "../content/cases/ghost-orders-at-midnight/case";
import type { GameCaseDefinition } from "./types";

/** Deep clone the valid case so we can mutate copies in failure tests. */
function cloneCase(): GameCaseDefinition {
  return structuredClone(ghostOrdersCase);
}

describe("validateCase — valid tutorial case", () => {
  it("passes validation and returns the typed case", () => {
    const result = validateCase(cloneCase());
    expect(result.id).toBe("case_ghost_orders_v1");
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.availableActions.length).toBe(10);
  });
});

describe("validateCase — structural failures", () => {
  it("fails on a duplicate evidence id with a readable path", () => {
    const bad = cloneCase();
    bad.evidence[1].id = bad.evidence[0].id; // duplicate
    expect(() => validateCase(bad)).toThrow(CaseValidationError);
    try {
      validateCase(bad);
    } catch (e) {
      const err = e as CaseValidationError;
      expect(err.issues.some((i) => i.path.startsWith("evidence"))).toBe(true);
    }
  });

  it("fails on a duplicate action id", () => {
    const bad = cloneCase();
    bad.availableActions[1].id = bad.availableActions[0].id;
    expect(() => validateCase(bad)).toThrow(CaseValidationError);
  });

  it("fails when an edge references an unknown node", () => {
    const bad = cloneCase();
    bad.baselineArchitecture.edges[0].target = "does-not-exist";
    expect(() => validateCase(bad)).toThrow(CaseValidationError);
    try {
      validateCase(bad);
    } catch (e) {
      const err = e as CaseValidationError;
      expect(
        err.issues.some((i) =>
          i.message.includes("references unknown node")
        )
      ).toBe(true);
    }
  });

  it("fails when an evidence reveal points at a missing node", () => {
    const bad = cloneCase();
    bad.evidence[3].reveals = [{ type: "reveal-node", nodeId: "ghost-node" }];
    expect(() => validateCase(bad)).toThrow(CaseValidationError);
  });
});

describe("validateCase — semantic failures", () => {
  it("fails when no solution family fits the budget (unwinnable)", () => {
    const bad = cloneCase();
    // Make every solution family too expensive.
    bad.resources.changeBudget = 1;
    expect(() => validateCase(bad)).toThrow(CaseValidationError);
    try {
      validateCase(bad);
    } catch (e) {
      const err = e as CaseValidationError;
      expect(
        err.issues.some((i) => i.path === "scoring.solutionFamilies")
      ).toBe(true);
    }
  });

  it("fails on a traffic timeline gap", () => {
    const bad = cloneCase();
    // Push the second phase start past the first phase end -> gap.
    bad.trafficScenario.phases[1].startSecond = 15;
    expect(() => validateCase(bad)).toThrow(CaseValidationError);
  });

  it("fails when the first phase does not start at 0", () => {
    const bad = cloneCase();
    bad.trafficScenario.phases[0].startSecond = 1;
    expect(() => validateCase(bad)).toThrow(CaseValidationError);
  });

  it("fails on a self-loop edge", () => {
    const bad = cloneCase();
    bad.baselineArchitecture.edges[0].source = bad.baselineArchitecture.edges[0].target;
    expect(() => validateCase(bad)).toThrow(CaseValidationError);
  });

  it("fails on a prerequisite cycle", () => {
    const bad = cloneCase();
    // action A requires B, B requires A.
    const a = bad.availableActions.find((x) => x.id === "action_idempotency_support")!;
    const b = bad.availableActions.find((x) => x.id === "action_client_checkout_id")!;
    a.prerequisites = [{ kind: "action", id: "action_client_checkout_id" }];
    b.prerequisites = [{ kind: "action", id: "action_idempotency_support" }];
    expect(() => validateCase(bad)).toThrow(CaseValidationError);
    try {
      validateCase(bad);
    } catch (e) {
      const err = e as CaseValidationError;
      expect(
        err.issues.some((i) => i.message.includes("prerequisite cycle"))
      ).toBe(true);
    }
  });
});

describe("validateCase — objective validation", () => {
  it("fails on an unsupported metric key", () => {
    const bad = cloneCase();
    // @ts-expect-error intentionally invalid metric for the test
    bad.objectives[0].metric = "not_a_real_metric";
    expect(() => validateCase(bad)).toThrow(CaseValidationError);
  });
});

describe("validateCase — error reporting", () => {
  it("CaseValidationError carries every issue at once, not just the first", () => {
    const bad = cloneCase();
    // Inject two independent faults.
    bad.evidence[0].id = bad.evidence[1].id; // duplicate
    bad.baselineArchitecture.edges[0].target = "missing"; // dangling
    try {
      validateCase(bad);
      expect.fail("should have thrown");
    } catch (e) {
      const err = e as CaseValidationError;
      expect(err.issues.length).toBeGreaterThanOrEqual(2);
      // Every issue has a path and a message.
      for (const issue of err.issues) {
        expect(typeof issue.path).toBe("string");
        expect(issue.message.length).toBeGreaterThan(0);
      }
    }
  });
});
