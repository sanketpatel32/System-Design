"use client";

/**
 * SimulationPlayer — animated playback of a precomputed simulation (spec §5.9).
 *
 * Shows a 60-second virtual incident timeline with:
 *  - Animated request-flow pulses (CSS, respects reduced-motion)
 *  - Live metrics readouts that tick forward
 *  - An event feed that reveals events as the playhead reaches them
 *  - Play / pause / 1× / 2× / skip-to-results controls
 *
 * The player ONLY reads the precomputed report — it never recalculates the
 * simulation during playback (spec §15.4). The animation is pure playback.
 */

import { Play, Pause, FastForward, SkipForward, RotateCcw } from "lucide-react";
import type { SimulationRun, SimulationTimelineSample } from "@/lib/game/domain/types";
import { useSimulationPlayback } from "@/lib/game/hooks/useSimulationPlayback";
import { EventFeed } from "./EventFeed";

interface Props {
  run: SimulationRun;
}

const PHASE_LABEL: Record<string, string> = {
  "warm-up": "Warm-up",
  sale: "Sale begins",
  peak: "Peak",
  recovery: "Recovery",
};

export function SimulationPlayer({ run }: Props) {
  const pb = useSimulationPlayback(run);
  const sample: SimulationTimelineSample | undefined =
    run.timeline[Math.min(pb.currentSecond, run.timeline.length - 1)];

  // Cumulative counters up to the playhead.
  const cumulative = computeCumulative(run, pb.currentSecond);

  const progress = run.virtualDurationSeconds
    ? (pb.currentSecond / run.virtualDurationSeconds) * 100
    : 0;

  return (
    <div className="rounded-xl border border-rule/80 bg-paper-2/60 p-4 shadow-sm">
      {/* Virtual clock + phase */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
            Incident Timeline Playback
          </p>
          <p className="font-mono text-xl font-extrabold text-ink">
            00:{String(pb.currentSecond).padStart(2, "0")}
            <span className="text-xs font-semibold text-ink-3"> / 00:{run.virtualDurationSeconds}s</span>
          </p>
        </div>
        {sample && (
          <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent border border-accent/20">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-slow" />
            {PHASE_LABEL[sample.phase] ?? sample.phase}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div
        className="mb-3.5 h-2 w-full overflow-hidden rounded-full bg-paper-3/80 shadow-inner"
        role="progressbar"
        aria-valuenow={pb.currentSecond}
        aria-valuemin={0}
        aria-valuemax={run.virtualDurationSeconds}
        aria-label="Simulation progress"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-100 ease-linear motion-reduce:transition-none shadow-xs"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Live metrics grid */}
      <div className="mb-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric
          label="Requests / sec"
          value={sample ? String(sample.requests) : "—"}
        />
        <Metric
          label="p95 Latency"
          value={sample ? `${sample.p95LatencyMs.toFixed(0)}ms` : "—"}
          tone={sample && sample.p95LatencyMs > 2500 ? "warn" : undefined}
        />
        <Metric
          label="Dup. Orders"
          value={String(cumulative.duplicates)}
          tone={cumulative.duplicates > 0 ? "warn" : undefined}
        />
        <Metric
          label="Dup. Charges"
          value={String(cumulative.duplicateCharges)}
          tone={cumulative.duplicateCharges > 0 ? "warn" : undefined}
        />
      </div>

      {/* Request-flow pulses */}
      <FlowPulses isPlaying={pb.isPlaying} />

      {/* Playback controls */}
      <div className="mb-3 flex items-center gap-2">
        {pb.isPlaying ? (
          <button
            type="button"
            onClick={pb.pause}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-paper px-3 py-1.5 text-xs font-bold text-ink hover:border-accent hover:text-accent shadow-xs"
          >
            <Pause size={13} /> Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={pb.play}
            disabled={pb.isComplete}
            className="lift inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[rgb(var(--accent-ink-rgb))] disabled:opacity-40 shadow-xs"
          >
            <Play size={13} /> {pb.currentSecond === 0 ? "Play" : "Resume"}
          </button>
        )}
        <button
          type="button"
          onClick={pb.cycleSpeed}
          className="inline-flex items-center gap-1 rounded-lg border border-rule bg-paper px-2.5 py-1.5 text-xs font-bold text-ink-2 hover:border-accent"
          aria-label={`Playback speed ${pb.speed}×`}
        >
          <FastForward size={12} /> {pb.speed}×
        </button>
        <button
          type="button"
          onClick={pb.skipToEnd}
          className="inline-flex items-center gap-1 rounded-lg border border-rule bg-paper px-2.5 py-1.5 text-xs font-bold text-ink-2 hover:border-accent"
        >
          <SkipForward size={12} /> Skip
        </button>
        <button
          type="button"
          onClick={pb.restart}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-rule bg-paper px-2.5 py-1.5 text-xs font-bold text-ink-3 hover:text-ink"
          aria-label="Restart playback"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Event feed up to the playhead */}
      <EventFeed events={run.events} currentSecond={pb.currentSecond} />
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn" | "ok";
}) {
  const color =
    tone === "warn" ? "text-warn" : tone === "ok" ? "text-ok" : "text-ink";
  return (
    <div className="rounded-xl border border-rule/80 bg-paper p-2.5 shadow-xs">
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3">{label}</p>
      <p className={`font-mono text-base font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

/** Sum the timeline up to and including `second`. */
function computeCumulative(run: SimulationRun, second: number) {
  let duplicates = 0;
  let duplicateCharges = 0;
  for (let i = 0; i <= second && i < run.timeline.length; i++) {
    duplicates += run.timeline[i].duplicates;
    duplicateCharges += run.timeline[i].duplicateCharges;
  }
  return { duplicates, duplicateCharges };
}

/**
 * Decorative request-flow pulses travelling left→right. Pure CSS animation,
 * disabled under reduced-motion (the bars simply don't animate).
 */
function FlowPulses({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div
      className="mb-3 flex h-6 items-center gap-1 overflow-hidden rounded-md bg-paper-3/40"
      aria-hidden
    >
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="block h-1 flex-1 rounded-full bg-accent/30 motion-reduce:opacity-30"
          style={
            isPlaying
              ? {
                  animation: `pulse-flow 1.4s ease-in-out ${i * 0.08}s infinite`,
                }
              : undefined
          }
        />
      ))}
      <style jsx>{`
        @keyframes pulse-flow {
          0%, 100% { opacity: 0.2; transform: scaleX(0.6); }
          50% { opacity: 1; transform: scaleX(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes pulse-flow { 0%, 100% { opacity: 0.3; } }
        }
      `}</style>
    </div>
  );
}
