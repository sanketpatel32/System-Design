"use client";

/**
 * DebriefPanel — the post-resolution lesson screen (spec §5.11).
 *
 * Teaches rather than merely grades: score, rank, the correct root cause, why
 * the player's changes worked, why tempting alternatives failed, and the ideal
 * solution. Triggered when the player accepts a passing solution.
 */

import { useMemo } from "react";
import { Award, BookOpen, AlertTriangle, RotateCcw, Lightbulb } from "lucide-react";
import type {
  GameCaseDefinition,
  GameSession,
  SimulationRun,
} from "@/lib/game/domain/types";
import { scoreCase } from "@/lib/game/domain/scoring/score-case";

interface Props {
  caseDef: GameCaseDefinition;
  session: GameSession;
  latestRun?: SimulationRun;
  onReset: () => void;
}

export function DebriefPanel({ caseDef, session, latestRun, onReset }: Props) {
  const score = useMemo(() => {
    if (!latestRun || !session.hypothesis) return null;
    return scoreCase(session, caseDef, latestRun);
  }, [session, caseDef, latestRun]);

  if (!score || !session.hypothesis) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center text-ink-3">
        Accept a passing simulation to see your debrief.
      </div>
    );
  }

  const d = caseDef.debrief;
  const chosenPrimary = caseDef.hypotheses.find(
    (h) => h.id === session.hypothesis!.primaryHypothesisId
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      {/* Score header */}
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 elev-sm">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          <Award size={14} /> Case debrief
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-ink-2">Final score</p>
            <p className="text-5xl font-bold tracking-tight text-ink">
              {score.total}
              <span className="text-2xl text-ink-3">/{score.maxTotal}</span>
            </p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-sm font-bold text-[rgb(var(--accent-ink-rgb))]">
            {score.rank}
          </span>
        </div>
      </div>

      {/* Correct root cause */}
      <section className="mt-6">
        <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-ink">
          <BookOpen size={16} aria-hidden /> The actual root cause
        </h2>
        <p className="text-sm leading-relaxed text-ink-2">
          {d.correctRootCauseExplanation}
        </p>
        {chosenPrimary && (
          <p
            className={`mt-2 rounded-lg border px-3 py-2 text-sm ${
              chosenPrimary.isCorrect
                ? "border-ok/30 bg-ok/5 text-ok"
                : "border-warn/30 bg-warn/5 text-warn"
            }`}
          >
            Your hypothesis: {chosenPrimary.label} —{" "}
            {chosenPrimary.isCorrect ? "correct." : "incorrect."}
          </p>
        )}
      </section>

      {/* Evidence chain */}
      <section className="mt-6">
        <h2 className="mb-2 text-base font-bold text-ink">Evidence chain</h2>
        <ol className="space-y-1.5">
          {d.evidenceChain.map((line, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-2">
              <span className="font-mono font-semibold text-accent">{i + 1}.</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Why changes worked */}
      <section className="mt-6">
        <h2 className="mb-2 text-base font-bold text-ink">
          Why your changes worked
        </h2>
        <ul className="space-y-1.5">
          {d.whyChangesWorked.map((line, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-2">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-ok" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Why alternatives failed */}
      <section className="mt-6">
        <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-ink">
          <AlertTriangle size={16} aria-hidden /> Why tempting alternatives failed
        </h2>
        <ul className="space-y-2">
          {d.whyAlternativesFailed.map((alt, i) => {
            const hyp = caseDef.hypotheses.find((h) => h.id === alt.hypothesisId);
            return (
              <li key={i} className="rounded-lg border border-rule bg-paper-2/40 p-3">
                <p className="text-sm font-medium text-ink">
                  {hyp?.label ?? alt.hypothesisId}
                </p>
                <p className="mt-0.5 text-xs text-ink-2">{alt.explanation}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Ideal solution */}
      <section className="mt-6">
        <h2 className="mb-2 text-base font-bold text-ink">Ideal solution</h2>
        <ol className="space-y-1.5">
          {d.idealSolution.map((step, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-2">
              <span className="font-mono font-semibold text-accent">{i + 1}.</span>
              <span>{step.step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Residual hardening */}
      <section className="mt-6">
        <h2 className="mb-2 text-base font-bold text-ink">
          Remaining production hardening
        </h2>
        <ul className="space-y-1">
          {d.residualHardeningSteps.map((step, i) => (
            <li key={i} className="text-sm text-ink-2">· {step}</li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={onReset}
        className="lift mt-8 inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-[rgb(var(--accent-ink-rgb))] elev-sm hover:elev-md"
      >
        <RotateCcw size={15} /> Play again
      </button>
    </div>
  );
}
