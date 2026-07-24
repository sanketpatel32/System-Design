/**
 * Domain errors. The reducer and validator never throw on bad input — they
 * return a typed `Result` so callers (UI, tests) can present a useful message.
 *
 * Spec reference: §12.2 ("Invalid commands return a typed error"), §19.2.
 */

export type GameRuleErrorReason =
  // Evidence
  | "EVIDENCE_NOT_FOUND"
  | "INSUFFICIENT_INVESTIGATION_POINTS"
  | "EVIDENCE_ALREADY_INSPECTED"
  | "EVIDENCE_LOCKED"
  // Design actions
  | "ACTION_NOT_FOUND"
  | "ACTION_PREREQUISITES_NOT_MET"
  | "INVALID_ACTION_TARGET"
  | "INSUFFICIENT_CHANGE_BUDGET"
  | "ACTION_NOT_APPLIED"
  | "ACTION_NOT_REVERSIBLE"
  // Phase / flow
  | "INVALID_PHASE_TRANSITION"
  | "HYPOTHESIS_REQUIRED"
  | "MISSING_HYPOTHESIS"
  // Simulation
  | "SIMULATION_TARGET_NOT_FOUND"
  | "SIMULATION_RUN_NOT_FOUND"
  | "SOLUTION_ALREADY_ACCEPTED";

export interface GameRuleError {
  reason: GameRuleErrorReason;
  message: string;
  /** Dotted path or identifier for developer diagnostics. */
  path?: string;
}

export function gameError(
  reason: GameRuleErrorReason,
  message: string,
  path?: string
): GameRuleError {
  return { reason, message, path };
}

/**
 * Thrown at load time when a case definition is structurally invalid. This is
 * a developer error (bad content), not a runtime game-rule violation, so it
 * does throw — surfacing it loudly is the point (spec §0.1 rule 6, §19.2).
 */
export class CaseValidationError extends Error {
  readonly issues: readonly CaseValidationIssue[];

  constructor(issues: CaseValidationIssue[]) {
    const summary = issues
      .map((i) => `  • ${i.path}: ${i.message}`)
      .join("\n");
    super(`Case validation failed with ${issues.length} issue(s):\n${summary}`);
    this.name = "CaseValidationError";
    this.issues = issues;
  }
}

export interface CaseValidationIssue {
  path: string;
  message: string;
}
