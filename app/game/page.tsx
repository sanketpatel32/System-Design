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
      <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        <span className="h-px w-6 bg-accent" aria-hidden />
        Incident Lab
      </p>
      <h1 className="text-[clamp(2.25rem,5vw,3.25rem)] font-bold leading-[1.05] tracking-tight text-ink">
        Investigate a failing system.
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
        You inherit a mysterious production incident. Uncover the hidden
        architecture from evidence, form a hypothesis, change the design, and
        run a deterministic simulation to see if your fix holds — or makes
        things worse.
      </p>

      {/* Continue (client component reading localStorage) */}
      <ContinueCard />

      {/* Case catalog */}
      <section className="mt-10" aria-label="Available cases">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-3">
          Cases
        </h2>
        <ul className="grid grid-cols-1 gap-4">
          {cases.map((c) => (
            <li key={c.id}>
              <Link
                href={`/game/${c.slug}`}
                className="lift group flex flex-col gap-3 rounded-2xl border border-rule bg-paper-2/50 p-5 elev-xs hover:border-accent/50 hover:bg-paper-3/40 sm:flex-row sm:items-center sm:gap-5"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                      {c.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-ink-3">
                      <Clock size={12} aria-hidden /> {c.estimatedMinutes} min
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold tracking-tight text-ink group-hover:text-accent">
                    {c.title}
                  </h3>
                  {c.subtitle && (
                    <p className="mt-1 text-sm text-ink-2">{c.subtitle}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-3">
                    {c.briefing.knownSymptoms.slice(0, 3).map((s) => (
                      <span key={s.id} className="inline-flex items-center gap-1">
                        <BarChart3 size={11} aria-hidden /> {s.label}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent">
                  Start <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
