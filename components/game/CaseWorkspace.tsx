"use client";

/**
 * CaseWorkspace — client orchestrator owning session state.
 *
 * Renders the phase-appropriate UI: briefing → workspace (shell + panels) →
 * debrief. Wires the session hook to each panel via render props.
 */

import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import type { GameCaseDefinition } from "@/lib/game/domain/types";
import { useGameSession } from "@/lib/game/hooks/useGameSession";
import { BriefingPanel } from "./BriefingPanel";
import { CaseHeader } from "./CaseHeader";
import { GameShell } from "./GameShell";
import { EvidenceLocker } from "./EvidenceLocker";
import { ArchitectureMap } from "./ArchitectureMap";
import { OpsConsole } from "./OpsConsole";
import { DebriefPanel } from "./DebriefPanel";
import { selectLatestRun } from "@/lib/game/domain/state/game-selectors";

interface Props {
  caseDef: GameCaseDefinition;
}

export function CaseWorkspace({ caseDef }: Props) {
  const { state, dispatch, startCase, clearError, reset } = useGameSession(caseDef);

  if (state.kind === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-ink-3">
        Loading case…
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <AlertCircle size={32} className="mx-auto mb-3 text-warn" />
        <p className="text-ink-2">{state.message}</p>
        <Link
          href="/game"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-rule px-4 py-2 text-sm font-medium text-ink-2 hover:border-accent hover:text-accent"
        >
          <ArrowLeft size={15} /> All cases
        </Link>
      </div>
    );
  }

  const { session, lastError } = state;
  const latestRun = selectLatestRun(session);

  return (
    <div>
      <CaseHeader
        caseDef={caseDef}
        session={session}
        lastError={lastError}
        onReset={reset}
        onDismissError={clearError}
        primaryAction={
          session.status === "DEBRIEF" || session.status === "CASE_RESOLVED"
            ? undefined
            : undefined
        }
      />

      {session.status === "BRIEFING" ? (
        <BriefingPanel caseDef={caseDef} onStart={startCase} />
      ) : session.status === "DEBRIEF" ? (
        <DebriefPanel caseDef={caseDef} session={session} latestRun={latestRun} onReset={reset} />
      ) : (
        <GameShell
          renderEvidence={() => (
            <EvidenceLocker caseDef={caseDef} session={session} dispatch={dispatch} />
          )}
          renderMap={() => (
            <ArchitectureMap caseDef={caseDef} session={session} dispatch={dispatch} />
          )}
          renderOps={() => (
            <OpsConsole caseDef={caseDef} session={session} dispatch={dispatch} />
          )}
        />
      )}
    </div>
  );
}
