/**
 * Local-session repository — a localStorage adapter for game saves.
 *
 * Mirrors the conventions of `lib/progress.ts`:
 *  - Namespaced keys (`atlas:game:session:<id>`) so the game never collides
 *    with the study-progress store.
 *  - Safe on the server (returns null / no-ops when `window` is undefined),
 *    which matters because this is a static-export Next.js app.
 *  - A separate index key lists active sessions so the landing page can show
 *    "continue" cards without scanning every key.
 *
 * Spec reference: §13.1 (repository interface), §13.2 (local storage adapter).
 */

import type { GameSession } from "../domain/types";

const KEY_PREFIX = "atlas:game:session:";
const INDEX_KEY = "atlas:game:index";
const SAVE_SCHEMA_VERSION = 1;

interface StoredSession {
  schemaVersion: number;
  session: GameSession;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Load a session by id, or null if missing/corrupt. */
export function loadSession(sessionId: string): GameSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + sessionId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    // Future: run migrate() here when schema versions diverge (spec §13.3).
    if (parsed.schemaVersion !== SAVE_SCHEMA_VERSION) {
      // For now there is only v1, so a mismatch means unknown data.
      return migrateSession(parsed);
    }
    return parsed.session;
  } catch {
    return null;
  }
}

/** Save a session (overwrites). Idempotent. */
export function saveSession(session: GameSession): void {
  if (!isBrowser()) return;
  const payload: StoredSession = {
    schemaVersion: SAVE_SCHEMA_VERSION,
    session,
  };
  try {
    window.localStorage.setItem(
      KEY_PREFIX + session.id,
      JSON.stringify(payload)
    );
    addToIndex(session.id);
  } catch {
    // Quota exceeded or serialization failure — fail quietly rather than
    // crash the game. The debounced save will retry on the next change.
  }
}

/** Delete a session and remove it from the index. */
export function deleteSession(sessionId: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEY_PREFIX + sessionId);
  removeFromIndex(sessionId);
}

/** List all known session ids (most recent first is best-effort). */
export function listSessionIds(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

/** Load every session (used by the landing page). Corrupt entries are skipped. */
export function loadAllSessions(): GameSession[] {
  return listSessionIds()
    .map(loadSession)
    .filter((s): s is GameSession => s !== null);
}

function addToIndex(sessionId: string): void {
  const ids = listSessionIds().filter((id) => id !== sessionId);
  ids.unshift(sessionId);
  // Cap the index to avoid unbounded growth.
  const capped = ids.slice(0, 50);
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(capped));
}

function removeFromIndex(sessionId: string): void {
  const ids = listSessionIds().filter((id) => id !== sessionId);
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

/**
 * Migration hook. Today there is only v1, so any other version is treated as
 * unloadable (returns null) — the caller will create a fresh session.
 *
 * When v2 lands, add `migrateV1ToV2` here and chain them, preserving a backup
 * key before mutating (spec §13.3).
 */
function migrateSession(parsed: StoredSession): GameSession | null {
  if (parsed.schemaVersion === SAVE_SCHEMA_VERSION) return parsed.session;
  // Unknown future version — preserve the raw blob in a backup key and bail.
  if (isBrowser() && parsed.session?.id) {
    try {
      window.localStorage.setItem(
        KEY_PREFIX + parsed.session.id + ":backup",
        JSON.stringify(parsed)
      );
    } catch {
      /* ignore */
    }
  }
  return null;
}

export const SAVE_VERSION = SAVE_SCHEMA_VERSION;
