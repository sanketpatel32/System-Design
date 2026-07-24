/**
 * Objective evaluation — does a simulation result meet the case's targets?
 *
 * Each objective is scored with partial credit based on distance from target
 * (spec §11.4), so a near-miss still teaches. Used both at simulation time
 * (for the outcome review) and at scoring time.
 */

import type {
  ObjectiveDefinition,
  ObjectiveResult,
  SimulationSummary,
} from "../types";

export function evaluateObjectives(
  objectives: ObjectiveDefinition[],
  summary: SimulationSummary
): ObjectiveResult[] {
  return objectives.map((def) => evaluateOne(def, summary));
}

export function evaluateOne(
  def: ObjectiveDefinition,
  summary: SimulationSummary
): ObjectiveResult {
  const actual = readMetric(summary, def.metric);
  const met = compare(actual, def.comparator, def.target);
  const credit = creditForDistance(def, actual);

  let status: ObjectiveResult["status"];
  if (credit >= 1) status = "passed";
  else if (credit > 0) status = "partial";
  else status = "failed";
  // A comparator that's strictly unmet is always failed regardless of distance.
  if (!met && credit === 0) status = "failed";

  return {
    objectiveId: def.id,
    status,
    actual,
    target: def.target,
    comparator: def.comparator,
    credit,
  };
}

function readMetric(summary: SimulationSummary, key: string): number {
  switch (key) {
    case "duplicateOrderRate": return summary.duplicateOrderRate;
    case "duplicateChargeRate": return summary.duplicateChargeRate;
    case "successfulCheckoutRate": return summary.successfulCheckoutRate;
    case "p95LatencyMs": return summary.p95LatencyMs;
    case "estimatedCostUnits": return summary.estimatedCostUnits;
    case "complexityUnits": return summary.complexityUnits;
    default: return 0;
  }
}

function compare(actual: number, op: string, target: number): boolean {
  switch (op) {
    case "<=": return actual <= target;
    case ">=": return actual >= target;
    case "==": return actual === target;
    default: return false;
  }
}

/**
 * Partial-credit bands (spec §11.4). A rate objective at 75% credit means the
 * player got close but not all the way; this rewards progress and explains
 * residual risk in the debrief.
 */
function creditForDistance(def: ObjectiveDefinition, actual: number): number {
  const { comparator, target, metric } = def;
  // Latency/cost objectives: "lower is better" (<=).
  if (comparator === "<=") {
    if (actual <= target) return 1;
    // Rate objectives use wider tolerance bands.
    if (metric === "duplicateOrderRate" || metric === "duplicateChargeRate") {
      if (actual <= target * 4) return 0.75;
      if (actual <= target * 10) return 0.4;
      return 0;
    }
    if (metric === "p95LatencyMs") {
      if (actual <= target * 1.1) return 0.75;
      if (actual <= target * 1.3) return 0.4;
      return 0;
    }
    return 0;
  }
  // Success-rate objectives: "higher is better" (>=).
  if (comparator === ">=") {
    if (actual >= target) return 1;
    if (actual >= target - 0.02) return 0.75;
    if (actual >= target - 0.05) return 0.4;
    return 0;
  }
  return actual === target ? 1 : 0;
}
