"use client";

/**
 * OpsConsole — the right panel (spec §5.7).
 *
 * Tabs: Symptoms / Metrics / Logs / Hypothesis / Simulation Report. The
 * hypothesis form collects structured selections (no NL grading — spec §5.7).
 */

import { useState } from "react";
import {
  AlertOctagon,
  BarChart3,
  ScrollText,
  FlaskConical,
  ClipboardList,
} from "lucide-react";
import type {
  GameCaseDefinition,
  GameSession,
  GameCommand,
  Result,
  GameRuleError,
} from "@/lib/game/domain/types";
import { HypothesisForm } from "./HypothesisForm";
import { SimulationReport } from "./SimulationReport";

type Dispatch = (command: GameCommand) => Result<GameSession, GameRuleError>;

interface Props {
  caseDef: GameCaseDefinition;
  session: GameSession;
  dispatch: Dispatch;
}

type Tab = "symptoms" | "metrics" | "logs" | "hypothesis" | "report";

export function OpsConsole({ caseDef, session, dispatch }: Props) {
  const [tab, setTab] = useState<Tab>("symptoms");
  const hasRun = session.simulationRuns.length > 0;

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap gap-1.5 border-b border-rule/80 pb-2.5">
        <TabButton active={tab === "symptoms"} onClick={() => setTab("symptoms")}>
          <AlertOctagon size={13} /> Symptoms
        </TabButton>
        <TabButton active={tab === "metrics"} onClick={() => setTab("metrics")}>
          <BarChart3 size={13} /> Metrics
        </TabButton>
        <TabButton active={tab === "logs"} onClick={() => setTab("logs")}>
          <ScrollText size={13} /> Logs
        </TabButton>
        <TabButton active={tab === "hypothesis"} onClick={() => setTab("hypothesis")}>
          <FlaskConical size={13} /> Hypothesis
        </TabButton>
        {hasRun && (
          <TabButton active={tab === "report"} onClick={() => setTab("report")}>
            <ClipboardList size={13} /> Report
          </TabButton>
        )}
      </div>

      {tab === "symptoms" && <SymptomsTab caseDef={caseDef} />}
      {tab === "metrics" && <MetricsTab caseDef={caseDef} />}
      {tab === "logs" && <LogsTab session={session} />}
      {tab === "hypothesis" && (
        <HypothesisForm caseDef={caseDef} session={session} dispatch={dispatch} />
      )}
      {tab === "report" && hasRun && (
        <SimulationReport session={session} caseDef={caseDef} dispatch={dispatch} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-150 data-[on=true]:bg-accent data-[on=true]:text-[rgb(var(--accent-ink-rgb))] text-ink-2 hover:bg-paper-3/60 shadow-xs"
      data-on={active}
    >
      {children}
    </button>
  );
}

function SymptomsTab({ caseDef }: { caseDef: GameCaseDefinition }) {
  const symptoms = caseDef.briefing.knownSymptoms;
  return (
    <ul className="space-y-2">
      {symptoms.map((s) => (
        <li
          key={s.id}
          className="rounded-xl border border-rule bg-paper px-3.5 py-2.5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-2">{s.label}</span>
            <span
              className="font-mono text-xs font-bold"
              data-tone={s.tone}
            >
              {s.value}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function MetricsTab({ caseDef }: { caseDef: GameCaseDefinition }) {
  // Aggregate metric evidence the player has unlocked.
  const metricEvidence = caseDef.evidence.filter((e) => e.category === "metric");
  return (
    <div className="space-y-3">
      {metricEvidence.length === 0 && (
        <p className="text-xs text-ink-3">
          Unlock metric dashboards from the Evidence Locker to populate this view.
        </p>
      )}
      {metricEvidence.map((ev) => (
        <div key={ev.id} className="rounded-xl border border-rule bg-paper p-3 shadow-xs">
          <p className="mb-2 text-xs font-bold text-ink">{ev.title}</p>
          {ev.content.category === "metric" && (
            <ul className="space-y-1.5">
              {ev.content.series.map((s, i) => (
                <li key={i} className="flex justify-between text-xs">
                  <span className="text-ink-3 font-medium">{s.label}</span>
                  <span className="font-mono font-bold text-ink">{s.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function LogsTab({ session }: { session: GameSession }) {
  // Surface log lines from unlocked evidence.
  const hasLogs = session.inspectedEvidenceIds.length > 0;
  return (
    <div className="space-y-2">
      {!hasLogs && (
        <p className="text-xs text-ink-3">
          No logs collected yet. Inspect trace or log evidence to populate this view.
        </p>
      )}
      <p className="rounded-xl border border-dashed border-rule/80 bg-paper-2/40 p-3 text-[11px] font-medium text-ink-3">
        Detailed request logs appear here once you unlock distributed-trace and
        payment-log evidence.
      </p>
    </div>
  );
}
