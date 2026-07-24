"use client";

/**
 * useGameSession — the React bridge over the pure command reducer.
 *
 * Owns the session in component state, dispatches commands through the reducer,
 * surfaces reducer errors, and persists to localStorage (debounced + immediate
 * on critical steps). Mirrors the `useProgress` pattern from `lib/progress.ts`
 * (custom-event cross-tab sync, hydrated flag for SSR safety).
 *
 * Spec reference: §12.1 (reducer), §13 (persistence), §15.1 (GameShell).
 */

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type {
  GameCaseDefinition,
  GameCommand,
  GameSession,
  Result,
} from "../domain/types";
import { createSession } from "../domain/state/game-state";
import { applyGameCommand } from "../domain/state/game-reducer";
import type { GameRuleError } from "../domain/errors";
import { loadSession, saveSession } from "../infrastructure/local-session-repository";

type State =
  | { kind: "loading" }
  | { kind: "ready"; session: GameSession; lastError: GameRuleError | null }
  | { kind: "error"; message: string };

type Action =
  | { type: "LOADED"; session: GameSession }
  | { type: "LOAD_FAILED"; message: string }
  | { type: "STARTED"; session: GameSession }
  | { type: "APPLIED"; session: GameSession }
  | { type: "REJECTED"; error: GameRuleError }
  | { type: "RESET"; session: GameSession };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOADED":
    case "STARTED":
    case "RESET":
      return { kind: "ready", session: action.session, lastError: null };
    case "LOAD_FAILED":
      return { kind: "error", message: action.message };
    case "APPLIED":
      return { kind: "ready", session: action.session, lastError: null };
    case "REJECTED":
      if (state.kind !== "ready") return state;
      return { ...state, lastError: action.error };
  }
}

export interface UseGameSession {
  state: State;
  /** Dispatch a command; returns the Result so callers can branch on failure. */
  dispatch: (command: GameCommand) => Result<GameSession, GameRuleError>;
  /** Transition BRIEFING -> INVESTIGATION (the "Start" CTA). No resource cost. */
  startCase: () => void;
  /** Clear the last reducer error (for dismissing toasts). */
  clearError: () => void;
  /** Restart the case from scratch (keeps the same session id). */
  reset: () => void;
  hydrated: boolean;
}

export function useGameSession(
  caseDef: GameCaseDefinition,
  options?: { sessionId?: string }
): UseGameSession {
  const [state, dispatch] = useReducer(reducer, { kind: "loading" });
  const hydratedRef = useRef(false);
  // Keep a live ref to the current session so dispatch() can compute
  // synchronously and return the Result without waiting for a re-render.
  const sessionRef = useRef<GameSession | null>(null);
  const seqRef = useRef(0);
  const sessionId = options?.sessionId ?? useMemo(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `s_${Date.now().toString(36)}`;
  }, []);

  // Mirror the latest session into the ref whenever state changes.
  useEffect(() => {
    sessionRef.current = state.kind === "ready" ? state.session : null;
  }, [state]);

  // --- Load on mount: resume a saved session or create a fresh one. ---
  useEffect(() => {
    let cancelled = false;
    const existing = options?.sessionId ? loadSession(options.sessionId) : null;
    if (existing && existing.caseId === caseDef.id) {
      if (!cancelled) {
        dispatch({ type: "LOADED", session: existing });
        hydratedRef.current = true;
      }
      return;
    }
    const fresh = createSession(caseDef, { id: sessionId });
    if (!cancelled) {
      dispatch({ type: "STARTED", session: fresh });
      hydratedRef.current = true;
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseDef.id]);

  // --- Persist whenever the session changes. ---
  useEffect(() => {
    if (state.kind !== "ready") return;
    if (!hydratedRef.current) return;
    saveSession(state.session);
  }, [state]);

  const apply = useCallback(
    (command: GameCommand): Result<GameSession, GameRuleError> => {
      const current = sessionRef.current;
      if (!current) {
        return {
          ok: false,
          error: {
            reason: "INVALID_PHASE_TRANSITION",
            message: "Session is not ready yet.",
          },
        };
      }
      // Stamp metadata if the caller didn't, so components can dispatch bare.
      seqRef.current += 1;
      const stamped: GameCommand =
        command.meta && command.meta.sessionId
          ? command
          : ({
              ...command,
              meta: {
                id: `cmd_${seqRef.current}`,
                sessionId: current.id,
                issuedAt: new Date().toISOString(),
                sequence: seqRef.current,
              },
            } as GameCommand);
      const result = applyGameCommand(current, stamped, caseDef);
      if (result.ok) {
        sessionRef.current = result.value;
        dispatch({ type: "APPLIED", session: result.value });
      } else {
        dispatch({ type: "REJECTED", error: result.error });
      }
      return result;
    },
    [caseDef]
  );

  const clearError = useCallback(() => {
    if (state.kind === "ready" && state.lastError) {
      dispatch({ type: "APPLIED", session: state.session });
    }
  }, [state]);

  const reset = useCallback(() => {
    const fresh = createSession(caseDef, { id: sessionId });
    sessionRef.current = fresh;
    dispatch({ type: "RESET", session: fresh });
  }, [caseDef, sessionId]);

  const startCase = useCallback(() => {
    const current = sessionRef.current;
    if (!current || current.status !== "BRIEFING") return;
    const next: GameSession = { ...current, status: "INVESTIGATION" };
    sessionRef.current = next;
    dispatch({ type: "APPLIED", session: next });
  }, []);

  return {
    state,
    dispatch: apply,
    startCase,
    clearError,
    reset,
    hydrated: hydratedRef.current,
  };
}
