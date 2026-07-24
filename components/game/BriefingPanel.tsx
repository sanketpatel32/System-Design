"use client";

/**
 * BriefingPanel — the case intro screen (spec §5.3).
 *
 * Progressive disclosure: narrative first, then impact, objectives, and
 * constraints, ending in a single "Start Investigation" CTA. No wall of text.
 */

import { useState } from "react";
import { ArrowRight, ChevronDown, Target, AlertTriangle, BookOpen } from "lucide-react";
import type { GameCaseDefinition } from "@/lib/game/domain/types";

interface Props {
  caseDef: GameCaseDefinition;
  onStart: () => void;
}

export function BriefingPanel({ caseDef, onStart }: Props) {
  const [expanded, setExpanded] = useState(false);
  const b = caseDef.briefing;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        <span className="h-px w-6 bg-accent" aria-hidden />
        Incident briefing · {caseDef.difficulty}
      </p>
      <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.06] tracking-tight text-ink">
        {caseDef.title}
      </h1>
      {caseDef.subtitle && (
        <p className="mt-3 text-lg text-ink-2">{caseDef.subtitle}</p>
      )}

      {/* Narrative */}
      <div className="prose-atlas mt-8">
        <p className="text-lg leading-relaxed">{b.narrative}</p>
      </div>

      {/* Incident window + impact */}
      <section className="mt-8 rounded-xl border border-rule bg-paper-2/60 p-5 elev-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
          Incident window
        </p>
        <p className="font-mono text-sm text-ink">{b.incidentWindow}</p>
        <ul className="mt-4 space-y-2">
          {b.customerImpact.map((line, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warn" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Symptoms grid */}
      <section className="mt-6" aria-label="Known symptoms">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
          Known symptoms
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {b.knownSymptoms.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-rule bg-paper px-3 py-2 elev-xs"
            >
              <span className="text-sm font-medium text-ink-2">{s.label}</span>
              <span
              className="font-mono text-sm font-semibold"
              data-tone={s.tone}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Collapsible objectives + constraints */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
      >
        <ChevronDown
          size={15}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden
        />
        {expanded ? "Hide" : "Show"} objectives &amp; constraints
      </button>

      {expanded && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-rule bg-paper-2/40 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-3">
              <Target size={13} aria-hidden /> Objectives
            </p>
            <ul className="space-y-1.5">
              {b.missionObjectives.map((o, i) => (
                <li key={i} className="text-sm text-ink-2">{o}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-rule bg-paper-2/40 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-3">
              <BookOpen size={13} aria-hidden /> Constraints
            </p>
            <ul className="space-y-1.5">
              {b.constraints.map((c, i) => (
                <li key={i} className="text-sm text-ink-2">{c}</li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {/* Learning goals + CTA */}
      <section className="mt-8 rounded-xl border border-accent/30 bg-accent/5 p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
          What you&apos;ll learn
        </p>
        <ul className="space-y-1">
          {caseDef.learningGoals.map((g, i) => (
            <li key={i} className="text-sm text-ink-2">· {g}</li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={onStart}
        className="lift mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-[rgb(var(--accent-ink-rgb))] elev-sm hover:elev-md sm:w-auto"
      >
        Start Investigation <ArrowRight size={18} />
      </button>
    </div>
  );
}
