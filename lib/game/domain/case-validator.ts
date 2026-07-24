/**
 * Case validator — the gate every case definition passes through before it can
 * be played. Combines Zod structural validation with cross-reference, cycle,
 * and solution-path checks Zod can't express.
 *
 * Spec reference: §9.2 (Validation), §0.1 rule 6.
 *
 * On failure this THROWS a `CaseValidationError` carrying every issue at once,
 * with dotted paths for fast developer diagnosis (spec §19.2 example).
 */

import type { GameCaseDefinition } from "./types";
import { CaseValidationError, type CaseValidationIssue } from "./errors";
import { gameCaseDefinitionSchema } from "./case-schema";
import {
  validateGraphReferences,
  validateEvidenceReveals,
  validateActionReferences,
  detectPrerequisiteCycle,
  validateUniqueIds,
  validateObjectives,
  validateReversibleActions,
} from "./graph/graph-validation";

export function validateCase(input: unknown): GameCaseDefinition {
  // 1. Structural / shape validation via Zod.
  const parsed = gameCaseDefinitionSchema.safeParse(input);
  const issues: CaseValidationIssue[] = [];

  if (!parsed.success) {
    for (const err of parsed.error.issues) {
      issues.push({
        // zod gives a dot-path like "baselineArchitecture.edges[0].source"
        path: err.path.join(".") || "(root)",
        message: err.message,
      });
    }
    // Zod failure is fatal — the shape is wrong, so semantic checks can't run.
    throw new CaseValidationError(issues);
  }

  const caseDef = parsed.data as GameCaseDefinition;

  // 2. Referential integrity: edges ↔ nodes.
  issues.push(
    ...validateGraphReferences(
      caseDef.baselineArchitecture,
      "baselineArchitecture"
    )
  );

  // 3. Unique ids across every collection.
  issues.push(...validateUniqueIds(caseDef));

  // 4. Evidence reveal targets exist.
  issues.push(...validateEvidenceReveals(caseDef));

  // 5. Action target rules + effect targets exist.
  issues.push(...validateActionReferences(caseDef));

  // 6. No prerequisite cycles.
  issues.push(...detectPrerequisiteCycle(caseDef.availableActions));

  // 7. Objectives use supported metrics and positive points.
  issues.push(...validateObjectives(caseDef));

  // 8. Reversible actions have a reversible effect shape.
  issues.push(...validateReversibleActions(caseDef.availableActions));

  // 9. At least one solution path exists (a family of actions whose total
  //    cost is within budget). Without this, the case is unwinnable.
  issues.push(...validateSolutionPath(caseDef));

  // 10. Traffic phases cover the full timeline with no gaps/overlaps.
  issues.push(...validateTrafficTimeline(caseDef));

  if (issues.length) throw new CaseValidationError(issues);

  return caseDef;
}

/**
 * A case is winnable if at least one scoring solution-family fits inside the
 * change budget. This is a coarse check (it doesn't simulate), but it catches
 * the common mistake of pricing the only solution above the budget.
 */
function validateSolutionPath(
  caseDef: GameCaseDefinition
): CaseValidationIssue[] {
  const issues: CaseValidationIssue[] = [];
  const actionCost = new Map(
    caseDef.availableActions.map((a) => [a.id, a.cost])
  );

  const anyFamilyFits = caseDef.scoring.solutionFamilies.some((family) => {
    const total = family.reduce(
      (sum, id) => sum + (actionCost.get(id) ?? 0),
      0
    );
    return total <= caseDef.resources.changeBudget;
  });

  if (!anyFamilyFits) {
    issues.push({
      path: "scoring.solutionFamilies",
      message:
        "no solution family fits within the change budget — the case may be unwinnable",
    });
  }
  return issues;
}

/** Phases must tile [0, durationSeconds) without gaps or overlaps. */
function validateTrafficTimeline(
  caseDef: GameCaseDefinition
): CaseValidationIssue[] {
  const issues: CaseValidationIssue[] = [];
  const phases = [...caseDef.trafficScenario.phases].sort(
    (a, b) => a.startSecond - b.startSecond
  );
  const duration = caseDef.trafficScenario.durationSeconds;

  if (phases.length === 0) {
    issues.push({
      path: "trafficScenario.phases",
      message: "at least one traffic phase is required",
    });
    return issues;
  }
  if (phases[0].startSecond !== 0) {
    issues.push({
      path: "trafficScenario.phases[0].startSecond",
      message: "first phase must start at second 0",
    });
  }
  for (let i = 1; i < phases.length; i++) {
    if (phases[i].startSecond !== phases[i - 1].endSecond) {
      issues.push({
        path: `trafficScenario.phases[${i}].startSecond`,
        message: `gap or overlap: phase starts at ${phases[i].startSecond} but previous ends at ${phases[i - 1].endSecond}`,
      });
    }
  }
  const last = phases[phases.length - 1];
  if (last.endSecond !== duration) {
    issues.push({
      path: "trafficScenario",
      message: `phases end at ${last.endSecond} but durationSeconds is ${duration}`,
    });
  }
  return issues;
}
