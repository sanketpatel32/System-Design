"use client";

/**
 * CaseHeader — the sticky workspace toolbar (spec §5.2).
 *
 * Shows the case title, current phase, the three constrained resources, the
 * simulation-run count, and the phase-driven primary action. Also surfaces the
 * last reducer error as a dismissible banner.
 */

import { useEffect } from "react";
import { Search, Coins, FlaskConical, RotateCcw, AlertCircle, X } from "lucide-react";
import type { GameCaseDefinition, GameSession } from "@/lib/game/domain/types";
import type { GameRuleError } from "@/lib/game/domain/errors";

interface Props {
  caseDef: GameCaseDefinition;
  session: GameSession;
  lastError: GameRuleError | null;
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  onReset: () => void;
  onDismissError: () => void;
}

const PHASE_LABELS: Record<GameSession["status"], string> = {
  LOADING: "Loading",
  BRIEFING: "Briefing",
  INVESTIGATION: "Investigation",
  HYPOTHESIS_READY: "Hypothesis",
  DESIGN: "Design",
  SIMULATING: "Simulating",
  OUTCOME_REVIEW: "Outcome",
  CASE_RESOLVED: "Resolved",
  DEBRIEF: "Debrief",
};

export function CaseHeader({
  caseDef,
  session,
  lastError,
  primaryAction,
  onReset,
  onDismissError,
}: Props) {
  // Auto-dismiss errors after a few seconds so they don't linger.
  useEffect(() => {
    if (!lastError) return;
    const t = setTimeout(onDismissError, 5000);
    return () => clearTimeout(t);
  }, [lastError, onDismissError]);

  return (
    <div className="sticky top-16 z-40 border-b border-rule bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold tracking-tight text-ink sm:text-base">
            {caseDef.title}
          </h1>
        </div>

        <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
          {PHASE_LABELS[session.status]}
        </span>

        <ResourceCounter
          icon={<Search size={14} aria-hidden />}
          label="Investigation"
          value={session.investigationPointsRemaining}
          max={caseDef.resources.investigationPoints}
        />
        <ResourceCounter
          icon={<Coins size={14} aria-hidden />}
          label="Budget"
          value={session.changeBudgetRemaining}
          max={caseDef.resources.changeBudget}
        />
        <ResourceCounter
          icon={<FlaskConical size={14} aria-hidden />}
          label="Runs"
          value={session.simulationRuns.length}
          max={caseDef.resources.incidentTolerance}
        />

        <div className="flex items-center gap-2">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-[rgb(var(--accent-ink-rgb))] transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {primaryAction.label}
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            aria-label="Restart case"
            title="Restart case"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-paper-3 hover:text-ink"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {lastError && (
        <div
          role="alert"
          className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn sm:mx-6"
        >
          <AlertCircle size={15} className="shrink-0" aria-hidden />
          <span className="flex-1">{lastError.message}</span>
          <button
            type="button"
            onClick={onDismissError}
            aria-label="Dismiss"
            className="shrink-0 rounded p-0.5 hover:bg-warn/20"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function ResourceCounter({
  icon,
  label,
  value,
  max,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  max: number;
}) {
  const low = value <= Math.ceil(max * 0.25);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm"
      title={`${label}: ${value} / ${max}`}
    >
      <span className={low ? "text-warn" : "text-ink-3"} aria-hidden>
        {icon}
      </span>
      <span className="font-mono font-semibold text-ink">{value}</span>
      <span className="hidden text-ink-3 sm:inline">/{max}</span>
      <span className="sr-only">{label}: {value} of {max}</span>
    </span>
  );
}
