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
      <div className="mb-3 flex flex-wrap gap-1">
        <TabButton active={tab === "symptoms"} onClick={() => setTab("symptoms")}>
          <AlertOctagon size={12} /> Symptoms
        </TabButton>
        <TabButton active={tab === "metrics"} onClick={() => setTab("metrics")}>
          <BarChart3 size={12} /> Metrics
        </TabButton>
        <TabButton active={tab === "logs"} onClick={() => setTab("logs")}>
          <ScrollText size={12} /> Logs
        </TabButton>
        <TabButton active={tab === "hypothesis"} onClick={() => setTab("hypothesis")}>
          <FlaskConical size={12} /> Hypothesis
        </TabButton>
        {hasRun && (
          <TabButton active={tab === "report"} onClick={() => setTab("report")}>
            <ClipboardList size={12} /> Report
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
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink-2 data-[on=true]:bg-accent/10 data-[on=true]:text-accent"
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
          className="rounded-lg border border-rule bg-paper px-3 py-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-2">{s.label}</span>
            <span
              className="font-mono text-xs font-semibold"
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
        <div key={ev.id} className="rounded-lg border border-rule bg-paper p-2">
          <p className="mb-1.5 text-xs font-semibold text-ink-2">{ev.title}</p>
          {ev.content.category === "metric" && (
            <ul className="space-y-1">
              {ev.content.series.map((s, i) => (
                <li key={i} className="flex justify-between text-xs">
                  <span className="text-ink-3">{s.label}</span>
                  <span className="font-mono font-semibold text-ink">{s.value}</span>
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
      <p className="rounded-lg border border-dashed border-rule bg-paper/40 p-2 text-[11px] text-ink-3">
        Detailed request logs appear here once you unlock distributed-trace and
        payment-log evidence.
      </p>
    </div>
  );
}
