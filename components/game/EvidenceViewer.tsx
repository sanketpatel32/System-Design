"use client";

/**
 * EvidenceViewer — renders the opened evidence item by category (spec §5.4).
 *
 * Log lines, metric series, trace waterfalls, memos, config snippets, schemas,
 * and architecture fragments each get an appropriate presentation. The debrief
 * explanation is shown only after the case is resolved.
 */

import { ArrowLeft, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import type { EvidenceItem, EvidenceReliability } from "@/lib/game/domain/types";

interface Props {
  item: EvidenceItem;
  isRedHerringRevealed: boolean;
  onClose: () => void;
}

const RELIABILITY_LABEL: Record<EvidenceReliability, { label: string; icon: React.ReactNode }> = {
  confirmed: { label: "Confirmed", icon: <ShieldCheck size={12} aria-hidden /> },
  reported: { label: "Reported", icon: <ShieldAlert size={12} aria-hidden /> },
  inferred: { label: "Inferred", icon: <ShieldQuestion size={12} aria-hidden /> },
};

export function EvidenceViewer({ item, isRedHerringRevealed, onClose }: Props) {
  const rel = RELIABILITY_LABEL[item.reliability];
  return (
    <article>
      <button
        type="button"
        onClick={onClose}
        className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-3 hover:text-accent"
      >
        <ArrowLeft size={13} /> Back to evidence
      </button>

      <header className="mb-3">
        <h3 className="text-base font-bold tracking-tight text-ink">{item.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-paper-3 px-2 py-0.5 font-medium text-ink-2">
            {rel.icon} {rel.label}
          </span>
          {item.isRedHerring && isRedHerringRevealed && (
            <span className="rounded-full bg-warn/10 px-2 py-0.5 font-medium text-warn">
              red herring
            </span>
          )}
        </div>
      </header>

      <Body content={item.content} />

      {isRedHerringRevealed && item.debriefExplanation && (
        <p className="mt-4 rounded-lg border border-rule bg-paper-3/40 p-3 text-xs italic text-ink-2">
          {item.debriefExplanation}
        </p>
      )}
    </article>
  );
}

function Body({ content }: { content: EvidenceItem["content"] }) {
  switch (content.category) {
    case "memo":
      return (
        <div className="rounded-xl border border-rule bg-paper p-4 text-xs leading-relaxed text-ink shadow-xs">
          <p className="whitespace-pre-wrap font-sans text-sm text-ink-2">{content.body}</p>
        </div>
      );

    case "diagram":
      return (
        <pre className="diagram overflow-x-auto rounded-xl border border-rule bg-paper-2/60 p-4 text-xs">
          {content.ascii}
        </pre>
      );

    case "config":
      return (
        <div className="overflow-hidden rounded-xl border border-rule bg-paper-2/80">
          <div className="border-b border-rule/60 bg-paper-3/60 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">
            Configuration Snippet
          </div>
          <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-ink">
            <code>{content.snippet}</code>
          </pre>
        </div>
      );

    case "log":
      return (
        <div className="overflow-hidden rounded-xl border border-rule bg-paper-2/90 shadow-inner">
          <div className="flex items-center justify-between border-b border-rule/60 bg-paper-3/70 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-slow" />
              Log Stream
            </span>
            <span>{content.lines.length} lines</span>
          </div>
          <div className="space-y-1 p-3 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto">
            {content.lines.map((line, i) => (
              <div key={i} className="flex gap-2.5 hover:bg-paper-3/40 px-1 py-0.5 rounded">
                <span className="shrink-0 text-ink-3/70 text-[10px] select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="shrink-0 text-ink-3 font-medium">{line.ts}</span>
                <span
                  className={
                    line.level === "error"
                      ? "shrink-0 font-bold text-warn"
                      : line.level === "warn"
                      ? "shrink-0 font-bold text-accent"
                      : "shrink-0 font-medium text-ink-3"
                  }
                >
                  [{line.level.toUpperCase()}]
                </span>
                <span className="text-ink font-medium">{line.msg}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "metric":
      return (
        <ul className="space-y-2">
          {content.series.map((s, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-xl border border-rule bg-paper px-3.5 py-2.5 shadow-xs"
            >
              <span className="text-xs font-semibold text-ink">{s.label}</span>
              <span
                className="font-mono text-sm font-bold"
                data-tone={s.tone ?? "info"}
              >
                {s.value}
              </span>
            </li>
          ))}
        </ul>
      );

    case "trace":
      return (
        <div className="rounded-xl border border-rule bg-paper-2/60 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-3 border-b border-rule/60 pb-2">
            <span>Span Timeline</span>
            <span>Duration (ms)</span>
          </div>
          {content.spans.map((span, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-ink">{span.name}</span>
                <span className="font-mono text-accent font-bold">{span.durationMs}ms</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-paper-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    span.durationMs > 1500 ? "bg-warn" : "bg-accent"
                  }`}
                  style={{ width: `${Math.min(100, (span.durationMs / 2200) * 100)}%` }}
                  aria-hidden
                />
              </div>
              {span.note && (
                <p className="text-[11px] italic font-medium text-warn">{span.note}</p>
              )}
            </div>
          ))}
        </div>
      );

    case "schema":
      return (
        <div className="overflow-hidden rounded-xl border border-rule shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-rule bg-paper-3/60">
                <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-[10px] text-ink-2">Column</th>
                <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-[10px] text-ink-2">Type</th>
                <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-[10px] text-ink-2">Constraint</th>
              </tr>
            </thead>
            <tbody className="bg-paper">
              {content.tables.flatMap((table) =>
                table.columns.map((col, j) => (
                  <tr key={`${table.name}-${j}`} className="border-b border-rule/60 hover:bg-paper-3/30">
                    <td className="px-3.5 py-2 font-mono font-bold text-ink">{col.name}</td>
                    <td className="px-3.5 py-2 font-mono text-ink-3">{col.type}</td>
                    <td className="px-3.5 py-2 font-mono text-warn font-semibold">{col.constraint ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
  }
}
