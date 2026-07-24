/**
 * Graph-level validation: referential integrity checks that Zod's structural
 * schema can't express (cross-references between edges and nodes, reveal
 * targets, action target rules, prerequisite cycles).
 *
 * Spec reference: §9.2 (Validation).
 */

import type {
  ArchitectureGraph,
  DesignActionDefinition,
  EvidenceItem,
  GameCaseDefinition,
} from "../types";
import type { CaseValidationIssue } from "../errors";

/** Edge endpoints must reference existing nodes. */
export function validateGraphReferences(
  graph: ArchitectureGraph,
  path: string
): CaseValidationIssue[] {
  const issues: CaseValidationIssue[] = [];
  const ids = new Set(graph.nodes.map((n) => n.id));

  graph.edges.forEach((edge, i) => {
    if (!ids.has(edge.source)) {
      issues.push({
        path: `${path}.edges[${i}].source`,
        message: `references unknown node "${edge.source}"`,
      });
    }
    if (!ids.has(edge.target)) {
      issues.push({
        path: `${path}.edges[${i}].target`,
        message: `references unknown node "${edge.target}"`,
      });
    }
    if (edge.source === edge.target) {
      issues.push({
        path: `${path}.edges[${i}]`,
        message: `self-loop on node "${edge.source}"`,
      });
    }
  });
  return issues;
}

/** Evidence reveal targets must point at real nodes/edges/hypotheses/actions. */
export function validateEvidenceReveals(
  caseDef: GameCaseDefinition
): CaseValidationIssue[] {
  const issues: CaseValidationIssue[] = [];
  const nodeIds = new Set(caseDef.baselineArchitecture.nodes.map((n) => n.id));
  const edgeIds = new Set(caseDef.baselineArchitecture.edges.map((e) => e.id));
  const hypIds = new Set(caseDef.hypotheses.map((h) => h.id));
  const actionIds = new Set(caseDef.availableActions.map((a) => a.id));

  caseDef.evidence.forEach((ev, i) => {
    ev.reveals.forEach((r, j) => {
      switch (r.type) {
        case "reveal-node":
          if (!nodeIds.has(r.nodeId))
            issues.push({
              path: `evidence[${i}].reveals[${j}]`,
              message: `reveal-node references unknown node "${r.nodeId}"`,
            });
          break;
        case "reveal-edge":
          if (!edgeIds.has(r.edgeId))
            issues.push({
              path: `evidence[${i}].reveals[${j}]`,
              message: `reveal-edge references unknown edge "${r.edgeId}"`,
            });
          break;
        case "reveal-config":
          if (!nodeIds.has(r.nodeId))
            issues.push({
              path: `evidence[${i}].reveals[${j}]`,
              message: `reveal-config references unknown node "${r.nodeId}"`,
            });
          break;
        case "unlock-hypothesis":
          if (!hypIds.has(r.hypothesisId))
            issues.push({
              path: `evidence[${i}].reveals[${j}]`,
              message: `unlock-hypothesis references unknown hypothesis "${r.hypothesisId}"`,
            });
          break;
        case "unlock-action":
          if (!actionIds.has(r.actionId))
            issues.push({
              path: `evidence[${i}].reveals[${j}]`,
              message: `unlock-action references unknown action "${r.actionId}"`,
            });
          break;
      }
    });
  });
  return issues;
}

/** Action target rules + effects must reference real nodes/edges. */
export function validateActionReferences(
  caseDef: GameCaseDefinition
): CaseValidationIssue[] {
  const issues: CaseValidationIssue[] = [];
  const nodeIds = new Set(caseDef.baselineArchitecture.nodes.map((n) => n.id));
  const edgeIds = new Set(caseDef.baselineArchitecture.edges.map((e) => e.id));
  const actionIds = new Set(caseDef.availableActions.map((a) => a.id));
  const evidenceIds = new Set(caseDef.evidence.map((e) => e.id));

  caseDef.availableActions.forEach((action, i) => {
    // by-id target rules
    action.targetRules.forEach((rule, j) => {
      if (rule.type === "by-id") {
        rule.nodeIds.forEach((id) => {
          if (!nodeIds.has(id))
            issues.push({
              path: `availableActions[${i}].targetRules[${j}]`,
              message: `target rule references unknown node "${id}"`,
            });
        });
      }
    });

    // prerequisites reference real actions or evidence
    action.prerequisites.forEach((pre, j) => {
      if (pre.kind === "action" && !actionIds.has(pre.id))
        issues.push({
          path: `availableActions[${i}].prerequisites[${j}]`,
          message: `prerequisite references unknown action "${pre.id}"`,
        });
      if (pre.kind === "evidence" && !evidenceIds.has(pre.id))
        issues.push({
          path: `availableActions[${i}].prerequisites[${j}]`,
          message: `prerequisite references unknown evidence "${pre.id}"`,
        });
    });

    // effects reference real nodes/edges
    action.effects.forEach((eff, j) => {
      const effPath = `availableActions[${i}].effects[${j}]`;
      switch (eff.type) {
        case "set-config":
        case "remove-node":
        case "add-unique-constraint":
        case "enable-unique-constraint":
          if (!nodeIds.has(eff.nodeId))
            issues.push({
              path: effPath,
              message: `effect references unknown node "${eff.nodeId}"`,
            });
          break;
        case "remove-edge":
          if (!edgeIds.has(eff.edgeId))
            issues.push({
              path: effPath,
              message: `effect references unknown edge "${eff.edgeId}"`,
            });
          break;
        // add-node / add-edge introduce new ids; nothing to check here.
      }
    });
  });
  return issues;
}

/**
 * Reject prerequisite cycles: action A requires B which requires A. A cycle
 * would make an action permanently un-appliable, so it's a content bug.
 *
 * Spec §9.2: "No circular prerequisite dependency".
 */
export function detectPrerequisiteCycle(
  actions: DesignActionDefinition[]
): CaseValidationIssue[] {
  const issues: CaseValidationIssue[] = [];
  const byId = new Map(actions.map((a) => [a.id, a]));

  const visiting = new Set<string>();
  const visited = new Set<string>();

  const dfs = (id: string, stack: string[]): boolean => {
    if (visiting.has(id)) {
      const cycle = [...stack, id].join(" -> ");
      issues.push({
        path: `availableActions`,
        message: `prerequisite cycle detected: ${cycle}`,
      });
      return true;
    }
    if (visited.has(id)) return false;
    visiting.add(id);
    const action = byId.get(id);
    if (action) {
      for (const pre of action.prerequisites) {
        if (pre.kind === "action") {
          if (dfs(pre.id, [...stack, id])) return true;
        }
      }
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  };

  for (const a of actions) {
    visiting.clear();
    visited.clear();
    dfs(a.id, []);
    if (issues.length) break; // report one cycle at a time
  }
  return issues;
}

/** Evidence ids must be unique, action ids must be unique, etc. */
export function validateUniqueIds(
  caseDef: GameCaseDefinition
): CaseValidationIssue[] {
  const issues: CaseValidationIssue[] = [];
  const check = (
    items: { id: string }[],
    label: string
  ): void => {
    const seen = new Set<string>();
    items.forEach((item, i) => {
      if (seen.has(item.id))
        issues.push({
          path: `${label}[${i}]`,
          message: `duplicate id "${item.id}"`,
        });
      seen.add(item.id);
    });
  };
  check(caseDef.evidence, "evidence");
  check(caseDef.availableActions, "availableActions");
  check(caseDef.hypotheses, "hypotheses");
  check(caseDef.objectives, "objectives");
  check(caseDef.baselineArchitecture.nodes, "baselineArchitecture.nodes");
  check(caseDef.baselineArchitecture.edges, "baselineArchitecture.edges");
  return issues;
}

/** Objectives must use supported metric keys (redundant with Zod, but explicit). */
export function validateObjectives(
  caseDef: GameCaseDefinition
): CaseValidationIssue[] {
  const issues: CaseValidationIssue[] = [];
  const supported = new Set([
    "duplicateOrderRate",
    "duplicateChargeRate",
    "successfulCheckoutRate",
    "p95LatencyMs",
    "estimatedCostUnits",
    "complexityUnits",
  ]);
  caseDef.objectives.forEach((o, i) => {
    if (!supported.has(o.metric))
      issues.push({
        path: `objectives[${i}].metric`,
        message: `unsupported metric key "${o.metric}"`,
      });
    if (o.points <= 0)
      issues.push({
        path: `objectives[${i}].points`,
        message: `points must be positive`,
      });
  });
  return issues;
}

/** Every reversible action must have a defined inverse (revert path). */
export function validateReversibleActions(
  actions: DesignActionDefinition[]
): CaseValidationIssue[] {
  const issues: CaseValidationIssue[] = [];
  actions.forEach((a, i) => {
    if (a.reversible) {
      // These effect shapes are all restorable: set-config is overridable,
      // add-node/add-edge are dropped on revert, and constraint effects are
      // reversible by toggling `enabled` back off.
      const RESTORABLE = new Set([
        "set-config",
        "add-node",
        "add-edge",
        "add-unique-constraint",
        "enable-unique-constraint",
      ]);
      const allRestorable =
        a.effects.length === 0 ||
        a.effects.every((e) => RESTORABLE.has(e.type));
      if (!allRestorable) {
        issues.push({
          path: `availableActions[${i}]`,
          message: `action "${a.id}" is marked reversible but has no restorable effect shape`,
        });
      }
    }
  });
  return issues;
}

export type { EvidenceItem };
