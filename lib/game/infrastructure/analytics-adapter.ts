/**
 * Analytics adapter — typed event emission for the game (spec §17).
 *
 * Events are strictly typed (no free-text payloads) so sensitive hypothesis
 * reasoning is never logged. In dev, events echo to the console; in prod this
 * is a no-op stub a real analytics SDK can replace.
 *
 * The adapter is a thin indirection so the domain never imports an analytics
 * SDK directly — the application layer calls it.
 */

export type GameAnalyticsEvent =
  | { event: "system_game_case_started"; case_id: string; session_id: string }
  | { event: "system_game_evidence_inspected"; case_id: string; session_id: string; evidence_id: string; investigation_points_spent: number }
  | { event: "system_game_hypothesis_submitted"; case_id: string; session_id: string; phase: string }
  | { event: "system_game_action_applied"; case_id: string; session_id: string; action_id: string; change_budget_spent: number }
  | { event: "system_game_simulation_run"; case_id: string; session_id: string; run_number: number; passed: boolean }
  | { event: "system_game_case_completed"; case_id: string; session_id: string; score_band: string; elapsed_seconds: number }
  | { event: "system_game_save_recovered"; session_id: string };

type Sink = (event: GameAnalyticsEvent) => void;

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

const devSink: Sink = (event) => {
  // Surface to the console for developer diagnostics; never in prod.
  if (isDev) console.debug("[analytics]", event);
};

let sink: Sink = devSink;

/** Replace the sink (used to wire a real analytics SDK in prod). */
export function setAnalyticsSink(next: Sink): void {
  sink = next;
}

export function track(event: GameAnalyticsEvent): void {
  try {
    sink(event);
  } catch {
    // Analytics must never break gameplay — swallow emitter errors.
  }
}
