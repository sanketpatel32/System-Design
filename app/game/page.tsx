/**
 * Game landing page — the case catalog (spec §5.3 entry point).
 *
 * Lists available cases with difficulty, estimated time, and a "continue"
 * affordance if a saved session exists. Server component (static export safe).
 */

import Link from "next/link";
import { ArrowRight, Clock, BarChart3 } from "lucide-react";
import { getAllCases } from "@/lib/game/infrastructure/static-case-repository";
import { ContinueCard } from "@/components/game/ContinueCard";

export default function GameLandingPage() {
  const cases = getAllCases();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-accent">
        <span className="h-2 w-2 rounded-full bg-accent animate-pulse-slow" aria-hidden />
        Incident Lab Command Center
      </div>
      <h1 className="text-[clamp(2.25rem,5vw,3.25rem)] font-bold leading-[1.05] tracking-tight text-ink">
        Investigate a failing production system.
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
        You inherit a mysterious live incident. Uncover the topology from evidence,
        formulate a diagnostic hypothesis, redesign architecture parameters, and execute a
        deterministic load simulation to see if your fix holds under fire.
      </p>

      {/* Continue (client component reading localStorage) */}
      <ContinueCard />

      {/* Case catalog */}
      <section className="mt-12" aria-label="Available cases">
        <div className="mb-5 flex items-center justify-between border-b border-rule/80 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink-3">
            Incident Scenarios ({cases.length})
          </h2>
          <span className="text-xs font-semibold text-ink-3">Interactive Architecture Simulations</span>
        </div>

        <ul className="grid grid-cols-1 gap-5">
          {cases.map((c) => (
            <li key={c.id}>
              <Link
                href={`/game/${c.slug}`}
                className="lift group flex flex-col gap-4 rounded-2xl border border-rule/80 bg-paper-2/50 p-6 elev-sm hover:border-accent/60 hover:bg-paper-3/50 sm:flex-row sm:items-center sm:gap-6 shadow-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full bg-accent/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/20">
                      {c.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-3">
                      <Clock size={13} aria-hidden /> {c.estimatedMinutes} min
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-xl font-bold tracking-tight text-ink group-hover:text-accent transition-colors">
                    {c.title}
                  </h3>
                  {c.subtitle && (
                    <p className="mt-1 text-sm font-medium text-ink-2">{c.subtitle}</p>
                  )}
                  <div className="mt-3.5 flex flex-wrap gap-2 text-xs">
                    {c.briefing.knownSymptoms.slice(0, 3).map((s) => (
                      <span key={s.id} className="inline-flex items-center gap-1.5 rounded-lg border border-rule/60 bg-paper/60 px-2.5 py-1 text-[11px] font-medium text-ink-2">
                        <BarChart3 size={12} className="text-accent" aria-hidden /> {s.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 flex items-center">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[rgb(var(--accent-ink-rgb))] shadow-xs group-hover:bg-accent-2 transition-colors">
                    Launch Incident <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
