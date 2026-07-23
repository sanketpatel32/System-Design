"use client";

import { useCallback, useEffect, useState } from "react";

export type TopicStatus = "new" | "doing" | "done";

export interface ProgressState {
  status: Record<number, TopicStatus>;
  favorites: number[];
  flashcardKnown: Record<number, boolean>;
  recent: number[]; // most recent first, capped
}

const KEY = "atlas:progress:v1";
const RECENT_CAP = 12;

const empty: ProgressState = {
  status: {},
  favorites: [],
  flashcardKnown: {},
  recent: [],
};

function read(): ProgressState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return {
      status: parsed.status ?? {},
      favorites: parsed.favorites ?? [],
      flashcardKnown: parsed.flashcardKnown ?? {},
      recent: parsed.recent ?? [],
    };
  } catch {
    return empty;
  }
}

function write(state: ProgressState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
  // Notify other components in the same tab.
  window.dispatchEvent(new CustomEvent("atlas:progress"));
}

/**
 * Single shared progress store. Subscribes to a storage event + a custom
 * same-tab event so every component stays in sync without a context provider.
 */
export function useProgress() {
  const [state, setState] = useState<ProgressState>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
    const handler = () => setState(read());
    window.addEventListener("storage", handler);
    window.addEventListener("atlas:progress", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("atlas:progress", handler);
    };
  }, []);

  const setStatus = useCallback((id: number, status: TopicStatus) => {
    const s = read();
    // toggling to the current value clears it
    if (s.status[id] === status) {
      delete s.status[id];
    } else {
      s.status[id] = status;
    }
    write(s);
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    const s = read();
    s.favorites = s.favorites.includes(id)
      ? s.favorites.filter((x) => x !== id)
      : [...s.favorites, id];
    write(s);
  }, []);

  const setFlashcardKnown = useCallback((id: number, known: boolean) => {
    const s = read();
    s.flashcardKnown[id] = known;
    write(s);
  }, []);

  const markRecent = useCallback((id: number) => {
    const s = read();
    s.recent = [id, ...s.recent.filter((x) => x !== id)].slice(0, RECENT_CAP);
    write(s);
  }, []);

  const reset = useCallback(() => {
    write(empty);
  }, []);

  return {
    state,
    hydrated,
    setStatus,
    toggleFavorite,
    setFlashcardKnown,
    markRecent,
    reset,
  };
}
