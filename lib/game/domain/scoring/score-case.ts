/**
 * Scoring — turns a completed session into a 1,000-point report (spec §11).
 *
 * Rewards correct diagnosis, objective achievement, efficient investigation,
 * low-cost design, complexity discipline, reliability margin, tradeoff
 * recognition, and a first-run bonus. Never rewards "add the most components".
 *
 * Pure function of (session, caseDef, acceptedRun).
 */

import type {
  GameCaseDefinition,
  GameSession,
  RankLabel,
  ScoreBreakdown,
  ScoreReport,
  SimulationRun,
} from "../types";

export function scoreCase(
  session: GameSession,
  caseDef: GameCaseDefinition,
  acceptedRun: SimulationRun
): ScoreReport {
  const cfg = caseDef.scoring;
  const hypothesis = session.hypothesis;

  // --- Root-cause accuracy (spec §11.3) ---
  const primary = hypothesis
    ? caseDef.hypotheses.find((h) => h.id === hypothesis.primaryHypothesisId)
    : undefined;
  const primaryCorrect = primary?.isCorrect === true ? 160 : 0;

  const contributingCorrect = (hypothesis?.contributingFactorIds ?? [])
    .filter((id) => {
      const h = caseDef.hypotheses.find((x) => x.id === id);
      return h?.isCorrect === true;
    }).length;
  const contributingScore = Math.min(40, contributingCorrect * 15);

  const citedValid = (hypothesis?.citedEvidenceIds ?? []).filter((id) => {
    const ev = caseDef.evidence.find((e) => e.id === id);
    return primary?.supportingEvidenceIds.includes(id) || ev?.isRedHerring !== true;
  }).length;
  const evidenceScore = hypothesis && citedValid > 0 ? Math.min(20, citedValid * 7) : 0;

  const rootCauseAccuracy = primaryCorrect + contributingScore + evidenceScore;

  // --- Objective achievement (weighted by credit) ---
  const objCredit = acceptedRun.objectiveResults.reduce(
    (sum, o) => {
      const def = caseDef.objectives.find((x) => x.id === o.objectiveId);
      return sum + (def ? def.points * o.credit : 0);
    },
    0
  );
  const totalObjPoints = caseDef.objectives.reduce((s, o) => s + o.points, 0);
  const objectiveAchievement = totalObjPoints > 0
    ? (objCredit / totalObjPoints) * cfg.objectiveAchievementMax
    : 0;

  // --- Investigation efficiency (spec §11.5): base 40% + 60% on unused points ---
  const totalPoints = caseDef.resources.investigationPoints;
  const unused = session.investigationPointsRemaining;
  const invBase = cfg.investigationEfficiencyMax * 0.4;
  const invVariable = cfg.investigationEfficiencyMax * 0.6 * (unused / totalPoints);
  const investigationEfficiency = invBase + invVariable;

  // --- Change-budget efficiency (spec §11.6): reward smallest effective set ---
  const spent = caseDef.resources.changeBudget - session.changeBudgetRemaining;
  const appliedSet = session.appliedActions.map((a) => a.actionId);
  const matchesFamily = cfg.solutionFamilies.some((family) =>
    family.every((id) => appliedSet.includes(id))
  );
  // Efficiency = how little of the budget was spent, boosted if it matches a curated family.
  const budgetRatio = spent / caseDef.resources.changeBudget;
  const changeBudgetEfficiency = Math.round(
    cfg.changeBudgetEfficiencyMax * (1 - budgetRatio * 0.7) * (matchesFamily ? 1 : 0.6)
  );

  // --- Complexity discipline (spec §11.1, §10.14) ---
  const complexityScore = acceptedRun.summary.complexityUnits;
  const complexityDiscipline = Math.max(
    0,
    cfg.complexityDisciplineMax - complexityScore * 8
  );

  // --- Reliability margin: how far below the target the dup rates landed ---
  const dupOrderMargin = objectiveMargin(
    acceptedRun.summary.duplicateOrderRate,
    caseDef.objectives.find((o) => o.metric === "duplicateOrderRate")?.target ?? 0.0005
  );
  const reliabilityMargin = Math.round(cfg.reliabilityMarginMax * dupOrderMargin);

  // --- Tradeoff recognition: did the player cite a contributing factor? ---
  const tradeoffRecognition = contributingCorrect > 0
    ? cfg.tradeoffRecognitionMax
    : 0;

  // --- First-run bonus: accepted the first simulation run ---
  const firstRunBonus = session.simulationRuns.length === 1 ? cfg.firstRunBonus : 0;

  const breakdown: ScoreBreakdown = {
    rootCauseAccuracy: Math.round(rootCauseAccuracy),
    objectiveAchievement: Math.round(objectiveAchievement),
    investigationEfficiency: Math.round(investigationEfficiency),
    changeBudgetEfficiency,
    complexityDiscipline: Math.round(complexityDiscipline),
    reliabilityMargin,
    tradeoffRecognition,
    firstRunBonus,
  };

  const total = Object.values(breakdown).reduce((s, v) => s + v, 0);
  const clamped = Math.max(0, Math.min(cfg.maxScore, total));

  return {
    total: clamped,
    maxTotal: cfg.maxScore,
    breakdown,
    rank: rankFor(clamped),
    acceptedRunId: acceptedRun.id,
    calculatedAt: new Date().toISOString(),
  };
}

/** How much of the way from "barely met" to "zero" a rate achieved (0..1). */
function objectiveMargin(actual: number, target: number): number {
  if (target <= 0) return actual <= 0 ? 1 : 0;
  if (actual <= 0) return 1;
  if (actual >= target) return 0;
  return 1 - actual / target;
}

function rankFor(score: number): RankLabel {
  if (score >= 900) return "Principal Archaeologist";
  if (score >= 760) return "Incident Detective";
  if (score >= 600) return "Systems Investigator";
  if (score >= 400) return "Apprentice Maintainer";
  return "Case Reopened";
}
