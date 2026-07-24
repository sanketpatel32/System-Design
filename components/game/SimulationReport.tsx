"use client";

/**
 * SimulationReport — the "Run Simulation" trigger + outcome review (spec §5.9,
 * §5.10).
 *
 * Runs the deterministic engine (computed by the application service, carried
 * on the RUN_SIMULATION command so the reducer stays pure), then shows the
 * objective pass/fail, before-vs-after metrics, and accept/revise actions.
 *
 * The engine itself lives in the domain layer; this component only calls it and
 * renders the result.
 */

import { useState } from "react";
import { Play, RotateCcw, Check, AlertTriangle } from "lucide-react";
import type {
  GameCaseDefinition,
  GameSession,
  GameCommand,
  Result,
  GameRuleError,
  SimulationRun,
  ObjectiveResult,
} from "@/lib/game/domain/types";
import { simulateCase } from "@/lib/game/domain/simulation/simulate-case";
import { hashArchitecture } from "@/lib/game/domain/graph/graph-utils";
import { selectLatestRun } from "@/lib/game/domain/state/game-selectors";
import { selectCanRunSimulation } from "@/lib/game/domain/state/game-selectors";

type Dispatch = (command: GameCommand) => Result<GameSession, GameRuleError>;

interface Props {
  caseDef: GameCaseDefinition;
  session: GameSession;
  dispatch: Dispatch;
}

export function SimulationReport({ caseDef, session, dispatch }: Props) {
  const latest = selectLatestRun(session);
  const canRun = selectCanRunSimulation(session, caseDef);
  const [simulating, setSimulating] = useState(false);

  const runNumber = session.simulationRuns.length + 1;
  const archHash = hashArchitecture(session.currentArchitecture);
  const seed = `${caseDef.id}:${session.id}:${runNumber}:${archHash}`;

  const handleRun = () => {
    setSimulating(true);
    // The engine is synchronous and fast (<100ms target, spec §20.6).
    const run: SimulationRun = simulateCase(
      caseDef,
      session.currentArchitecture,
      session.appliedActions.map((a) => a.actionId),
      seed,
      runNumber
    );
    dispatch({
      type: "RUN_SIMULATION",
      meta: stubMeta(session.id),
      seed,
      run,
    });
    setSimulating(false);
  };

  const handleAccept = () => {
    if (!latest) return;
    dispatch({
      type: "ACCEPT_SOLUTION",
      meta: stubMeta(session.id),
      runId: latest.id,
    });
  };

  const handleRevise = () => {
    dispatch({
      type: "ROLLBACK_TO_BASELINE",
      meta: stubMeta(session.id),
    });
  };

  if (!latest) {
    return (
      <div className="rounded-lg border border-dashed border-rule bg-paper/40 p-4 text-center">
        <p className="mb-3 text-xs text-ink-2">
          Run a simulation to see how your design performs under the flash-sale
          traffic.
        </p>
        <button
          type="button"
          onClick={handleRun}
          disabled={!canRun || simulating}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-[rgb(var(--accent-ink-rgb))] disabled:opacity-40"
        >
          <Play size={13} /> {simulating ? "Simulating…" : "Run simulation"}
        </button>
        {!canRun && (
          <p className="mt-2 text-[11px] text-warn">
            Submit a hypothesis first.
          </p>
        )}
      </div>
    );
  }

  const allPassed = latest.objectiveResults.every((o) => o.status !== "failed");
  const somePartial = latest.objectiveResults.some((o) => o.status === "partial");

  return (
    <div className="space-y-3">
      {/* Run controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleRun}
          disabled={simulating}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-2 hover:border-accent hover:text-accent"
        >
          <Play size={12} /> Re-run ({runNumber + 1})
        </button>
        <span className="text-[11px] text-ink-3">
          seed: <code className="font-mono">{seed.slice(0, 24)}…</code>
        </span>
      </div>

      {/* Verdict banner */}
      <div
        className={`rounded-lg border p-3 ${
          allPassed
            ? "border-ok/40 bg-ok/10"
            : somePartial
            ? "border-warn/40 bg-warn/10"
            : "border-rule bg-paper-3/40"
        }`}
      >
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          {allPassed ? (
            <Check size={15} className="text-ok" />
          ) : (
            <AlertTriangle size={15} className={somePartial ? "text-warn" : "text-ink-3"} />
          )}
          <span className={allPassed ? "text-ok" : somePartial ? "text-warn" : "text-ink"}>
            {allPassed
              ? "All objectives passed"
              : somePartial
              ? "Partial success — residual risk remains"
              : "Objectives not met"}
          </span>
        </p>
      </div>

      {/* Objective results */}
      <ul className="space-y-1.5">
        {latest.objectiveResults.map((o) => (
          <ObjectiveRow key={o.objectiveId} result={o} caseDef={caseDef} />
        ))}
      </ul>

      {/* Summary metrics */}
      <div className="rounded-lg border border-rule bg-paper p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
          Summary
        </p>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <SummaryItem label="Total requests" value={String(latest.summary.totalRequests)} />
          <SummaryItem label="Successful" value={String(latest.summary.successfulRequests)} />
          <SummaryItem
            label="p95 latency"
            value={`${latest.summary.p95LatencyMs.toFixed(0)}ms`}
          />
          <SummaryItem
            label="Success rate"
            value={`${(latest.summary.successfulCheckoutRate * 100).toFixed(1)}%`}
          />
          <SummaryItem
            label="Dup orders"
            value={`${(latest.summary.duplicateOrderRate * 100).toFixed(2)}%`}
          />
          <SummaryItem
            label="Dup charges"
            value={`${(latest.summary.duplicateChargeRate * 100).toFixed(2)}%`}
          />
        </dl>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {allPassed && (
          <button
            type="button"
            onClick={handleAccept}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ok px-3 py-2 text-sm font-semibold text-[rgb(var(--accent-ink-rgb))]"
          >
            <Check size={14} /> Accept solution
          </button>
        )}
        <button
          type="button"
          onClick={handleRevise}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rule bg-paper px-3 py-2 text-sm font-medium text-ink-2 hover:border-accent"
        >
          <RotateCcw size={14} /> Revise
        </button>
      </div>
    </div>
  );
}

function ObjectiveRow({
  result,
  caseDef,
}: {
  result: ObjectiveResult;
  caseDef: GameCaseDefinition;
}) {
  const def = caseDef.objectives.find((o) => o.id === result.objectiveId);
  const tone =
    result.status === "passed" ? "ok" : result.status === "partial" ? "warn" : "ink-3";
  const color =
    result.status === "passed"
      ? "text-ok"
      : result.status === "partial"
      ? "text-warn"
      : "text-ink-3";
  return (
    <li className="flex items-center justify-between rounded-lg border border-rule bg-paper px-2.5 py-1.5">
      <span className="text-xs text-ink-2">{def?.label ?? result.objectiveId}</span>
      <span className={`font-mono text-xs font-semibold ${color}`} data-tone={tone}>
        {formatMetric(result.actual, def?.metric)}
        <span className="text-ink-3"> / {formatMetric(result.target, def?.metric)}</span>
      </span>
    </li>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-3">{label}</dt>
      <dd className="font-mono font-semibold text-ink">{value}</dd>
    </div>
  );
}

function formatMetric(value: number, metric?: string): string {
  if (metric === "p95LatencyMs") return `${value.toFixed(0)}ms`;
  if (
    metric === "duplicateOrderRate" ||
    metric === "duplicateChargeRate" ||
    metric === "successfulCheckoutRate"
  ) {
    return `${(value * 100).toFixed(2)}%`;
  }
  return String(value);
}

function stubMeta(sessionId: string) {
  return {
    id: `cmd_${Date.now()}`,
    sessionId,
    issuedAt: new Date().toISOString(),
    sequence: 0,
  };
}
