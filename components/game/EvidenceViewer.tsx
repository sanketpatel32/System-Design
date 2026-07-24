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
        <pre className="whitespace-pre-wrap rounded-lg border border-rule bg-paper p-3 font-mono text-xs leading-relaxed text-ink-2">
          {content.body}
        </pre>
      );

    case "diagram":
      return (
        <pre className="diagram overflow-x-auto rounded-lg border border-rule bg-paper p-3 text-xs">
          {content.ascii}
        </pre>
      );

    case "config":
      return (
        <pre className="overflow-x-auto rounded-lg border border-rule bg-paper p-3 font-mono text-xs leading-relaxed text-ink">
          <code>{content.snippet}</code>
        </pre>
      );

    case "log":
      return (
        <div className="space-y-0.5 rounded-lg border border-rule bg-paper p-3 font-mono text-xs">
          {content.lines.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 text-ink-3">{line.ts}</span>
              <span
                className={
                  line.level === "error"
                    ? "shrink-0 font-semibold text-warn"
                    : line.level === "warn"
                    ? "shrink-0 font-semibold text-accent"
                    : "shrink-0 text-ink-3"
                }
              >
                {line.level.toUpperCase()}
              </span>
              <span className="text-ink-2">{line.msg}</span>
            </div>
          ))}
        </div>
      );

    case "metric":
      return (
        <ul className="space-y-1.5">
          {content.series.map((s, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-rule bg-paper px-3 py-2"
            >
              <span className="text-sm text-ink-2">{s.label}</span>
              <span
                className="font-mono text-sm font-semibold"
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
        <div className="space-y-1.5">
          {content.spans.map((span, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-2">{span.name}</span>
                <span className="font-mono text-ink-3">{span.durationMs}ms</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-paper-3">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.min(100, (span.durationMs / 2200) * 100)}%` }}
                  aria-hidden
                />
              </div>
              {span.note && (
                <p className="mt-0.5 text-[11px] italic text-ink-3">{span.note}</p>
              )}
            </div>
          ))}
        </div>
      );

    case "schema":
      return (
        <div className="overflow-x-auto rounded-lg border border-rule">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-rule bg-paper-3/50">
                <th className="px-3 py-1.5 font-semibold text-ink-2">Column</th>
                <th className="px-3 py-1.5 font-semibold text-ink-2">Type</th>
                <th className="px-3 py-1.5 font-semibold text-ink-2">Constraint</th>
              </tr>
            </thead>
            <tbody>
              {content.tables.flatMap((table) =>
                table.columns.map((col, j) => (
                  <tr key={`${table.name}-${j}`} className="border-b border-rule/60">
                    <td className="px-3 py-1.5 font-mono text-ink">{col.name}</td>
                    <td className="px-3 py-1.5 font-mono text-ink-3">{col.type}</td>
                    <td className="px-3 py-1.5 font-mono text-warn">{col.constraint ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
  }
}
