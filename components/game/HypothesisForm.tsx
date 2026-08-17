"use client";

/**
 * HypothesisForm — structured root-cause selection (spec §5.7, §4.9).
 *
 * Collects a primary mechanism + contributing factors + cited evidence + an
 * optional free-text note. No natural-language grading — correctness is
 * determined by comparing structured selections to the case's `isCorrect`
 * flags at scoring time.
 */

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type {
  GameCaseDefinition,
  GameSession,
  GameCommand,
  Result,
  GameRuleError,
  SubmittedHypothesis,
} from "@/lib/game/domain/types";

type Dispatch = (command: GameCommand) => Result<GameSession, GameRuleError>;

interface Props {
  caseDef: GameCaseDefinition;
  session: GameSession;
  dispatch: Dispatch;
}

const MAX_NOTE = 500;

export function HypothesisForm({ caseDef, session, dispatch }: Props) {
  const primaryOptions = caseDef.hypotheses.filter((h) => h.role === "primary");
  const contribOptions = caseDef.hypotheses.filter((h) => h.role === "contributing");
  const inspected = caseDef.evidence.filter((e) =>
    session.inspectedEvidenceIds.includes(e.id)
  );

  const [primaryId, setPrimaryId] = useState<string>(
    session.hypothesis?.primaryHypothesisId ?? ""
  );
  const [contribIds, setContribIds] = useState<string[]>(
    session.hypothesis?.contributingFactorIds ?? []
  );
  const [citedIds, setCitedIds] = useState<string[]>(
    session.hypothesis?.citedEvidenceIds ?? []
  );
  const [note, setNote] = useState(session.hypothesis?.freeTextNote ?? "");
  const [saved, setSaved] = useState(false);

  const toggleContrib = (id: string) => {
    setContribIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  };
  const toggleCite = (id: string) => {
    setCitedIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  };

  const handleSubmit = () => {
    if (!primaryId) return;
    const hypothesis: SubmittedHypothesis = {
      primaryHypothesisId: primaryId,
      contributingFactorIds: contribIds,
      citedEvidenceIds: citedIds,
      freeTextNote: note.slice(0, MAX_NOTE),
      submittedAt: new Date().toISOString(),
    };
    dispatch({
      type: "SUBMIT_HYPOTHESIS",
      meta: stubMeta(session.id),
      hypothesis,
    });
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-3">
          Primary Failure Mechanism
        </p>
        <ul className="space-y-2">
          {primaryOptions.map((h) => (
            <li key={h.id}>
              <label className="lift flex cursor-pointer items-start gap-2.5 rounded-xl border border-rule/80 bg-paper p-3 text-xs transition-colors hover:border-accent/50 shadow-xs">
                <input
                  type="radio"
                  name="primary"
                  value={h.id}
                  checked={primaryId === h.id}
                  onChange={() => setPrimaryId(h.id)}
                  className="mt-0.5 accent-[rgb(var(--accent-rgb))]"
                />
                <span className="font-semibold text-ink leading-relaxed">{h.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-3">
          Contributing Factors
        </p>
        <ul className="space-y-2">
          {contribOptions.map((h) => (
            <li key={h.id}>
              <label className="lift flex cursor-pointer items-start gap-2.5 rounded-xl border border-rule/80 bg-paper p-3 text-xs transition-colors hover:border-accent/50 shadow-xs">
                <input
                  type="checkbox"
                  checked={contribIds.includes(h.id)}
                  onChange={() => toggleContrib(h.id)}
                  className="mt-0.5 accent-[rgb(var(--accent-rgb))]"
                />
                <span className="font-semibold text-ink leading-relaxed">{h.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {inspected.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-3">
            Cite Supporting Evidence
          </p>
          <ul className="space-y-1.5 rounded-xl border border-rule bg-paper-2/40 p-3">
            {inspected.map((e) => (
              <li key={e.id}>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-2 hover:text-accent">
                  <input
                    type="checkbox"
                    checked={citedIds.includes(e.id)}
                    onChange={() => toggleCite(e.id)}
                    className="accent-[rgb(var(--accent-rgb))]"
                  />
                  {e.title}
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-3">
          Reasoning &amp; Tradeoff Notes (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE))}
          maxLength={MAX_NOTE}
          rows={3}
          placeholder="Document your diagnostic hypothesis and architectural tradeoffs…"
          className="w-full rounded-xl border border-rule bg-paper p-3 text-xs text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 shadow-xs"
        />
        <p className="mt-1 text-right text-[10px] font-mono text-ink-3">
          {note.length}/{MAX_NOTE}
        </p>
      </section>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!primaryId}
        className="lift inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[rgb(var(--accent-ink-rgb))] disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
      >
        <CheckCircle2 size={15} />
        {session.hypothesis ? "Update Hypothesis" : "Submit Diagnostic Hypothesis"}
      </button>

      {saved && (
        <p className="rounded-xl border border-ok/40 bg-ok/10 px-3.5 py-2.5 text-xs font-semibold text-ok shadow-xs">
          ✓ Diagnostic hypothesis submitted! Switch to the Report tab or header button to run load simulation.
        </p>
      )}
    </div>
  );
}

function stubMeta(sessionId: string) {
  return {
    id: `cmd_${Date.now()}`,
    sessionId,
    issuedAt: new Date().toISOString(),
    sequence: 0,
  };
}
