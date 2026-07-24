"use client";

/**
 * EventFeed — timestamped, reason-coded events (spec §5.9, §10.15).
 *
 * During playback, events appear as the playhead reaches their virtual second.
 * Each event carries a tone (info/warn/critical/positive) conveyed by icon +
 * label, never color alone.
 */

import { Info, AlertTriangle, AlertOctagon, CheckCircle2 } from "lucide-react";
import type { SimulationEvent } from "@/lib/game/domain/types";

interface Props {
  events: SimulationEvent[];
  /** Only show events at or before this virtual second (during playback). */
  currentSecond?: number;
}

const TONE_STYLE: Record<
  SimulationEvent["tone"],
  { icon: React.ReactNode; color: string }
> = {
  info: { icon: <Info size={12} />, color: "text-ink-3" },
  warn: { icon: <AlertTriangle size={12} />, color: "text-warn" },
  critical: { icon: <AlertOctagon size={12} />, color: "text-accent" },
  positive: { icon: <CheckCircle2 size={12} />, color: "text-ok" },
};

export function EventFeed({ events, currentSecond }: Props) {
  const visible =
    currentSecond === undefined
      ? events
      : events.filter((e) => e.second <= currentSecond);
  // Newest first.
  const ordered = [...visible].sort((a, b) => b.second - a.second);

  if (ordered.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-rule bg-paper/40 px-3 py-2 text-[11px] text-ink-3">
        No events yet — play the timeline to see what happens.
      </p>
    );
  }

  return (
    <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
      {ordered.map((ev, i) => {
        const tone = TONE_STYLE[ev.tone];
        return (
          <li
            key={`${ev.second}-${i}`}
            className="flex items-start gap-2 rounded-md border border-rule bg-paper px-2.5 py-1.5 text-xs"
          >
            <span className={`mt-0.5 shrink-0 ${tone.color}`} aria-hidden>
              {tone.icon}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-ink-3">
              00:{String(ev.second).padStart(2, "0")}
            </span>
            <span className="flex-1 text-ink-2">{ev.message}</span>
          </li>
        );
      })}
    </ul>
  );
}
