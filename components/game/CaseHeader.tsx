"use client";

import { useEffect, useState } from "react";
import { Search, Coins, FlaskConical, RotateCcw, AlertCircle, X, Volume2, VolumeX } from "lucide-react";
import type { GameCaseDefinition, GameSession } from "@/lib/game/domain/types";
import type { GameRuleError } from "@/lib/game/domain/errors";
import { audioFx } from "@/lib/game/audio";

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
    <div className="sticky top-16 z-40 border-b border-rule/80 bg-paper/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        {/* Title & Live Indicator */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="status-dot-pulse shrink-0" title="Incident Command Active" />
          <h1 className="truncate text-sm font-bold tracking-tight text-ink sm:text-base">
            {caseDef.title}
          </h1>
        </div>

        {/* Phase Pill */}
        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent border border-accent/20">
          {PHASE_LABELS[session.status]}
        </span>

        {/* Resource Telemetry */}
        <div className="flex items-center gap-3 rounded-lg border border-rule/60 bg-paper-2/50 px-3 py-1">
          <ResourceCounter
            icon={<Search size={13} aria-hidden />}
            label="Investigation Points"
            value={session.investigationPointsRemaining}
            max={caseDef.resources.investigationPoints}
          />
          <span className="h-3 w-px bg-rule/80" aria-hidden />
          <ResourceCounter
            icon={<Coins size={13} aria-hidden />}
            label="Budget"
            value={session.changeBudgetRemaining}
            max={caseDef.resources.changeBudget}
          />
          <span className="h-3 w-px bg-rule/80" aria-hidden />
          <ResourceCounter
            icon={<FlaskConical size={13} aria-hidden />}
            label="Runs"
            value={session.simulationRuns.length}
            max={caseDef.resources.incidentTolerance}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className="lift inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[rgb(var(--accent-ink-rgb))] transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {primaryAction.label}
            </button>
          )}
          <SoundToggle />
          <button
            type="button"
            onClick={onReset}
            aria-label="Restart case"
            title="Restart case"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-paper-3 hover:text-ink border border-transparent hover:border-rule"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {lastError && (
        <div
          role="alert"
          className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-warn/50 bg-warn/15 px-3 py-2 text-xs font-medium text-warn sm:mx-6 shadow-xs"
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
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs"
      title={`${label}: ${value} / ${max}`}
    >
      <span className={low ? "text-warn" : "text-ink-3"} aria-hidden>
        {icon}
      </span>
      <span className="font-mono font-bold text-ink">{value}</span>
      <span className="hidden text-ink-3 sm:inline text-[11px]">/{max}</span>
      {/* Mini depletion bar */}
      <span className="hidden h-1.5 w-7 overflow-hidden rounded-full bg-paper-3 md:inline-block" aria-hidden>
        <span
          className={`block h-full rounded-full transition-all duration-300 ${low ? "bg-warn animate-pulse-slow" : "bg-accent"}`}
          style={{ width: `${pct * 100}%` }}
        />
      </span>
      <span className="sr-only">{label}: {value} of {max}</span>
    </span>
  );
}

function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(audioFx.isEnabled());
  }, []);

  const handleToggle = () => {
    const next = audioFx.toggle();
    setEnabled(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={enabled ? "Mute audio feedback" : "Enable audio feedback"}
      title={enabled ? "Audio feedback enabled" : "Audio feedback muted"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-paper-3 hover:text-ink border border-transparent hover:border-rule"
    >
      {enabled ? <Volume2 size={14} className="text-accent" /> : <VolumeX size={14} />}
    </button>
  );
}
