"use client";

/**
 * useSimulationPlayback — drives a virtual clock over a precomputed timeline.
 *
 * The simulation is already calculated when the player hits "Run"; this hook
 * only plays back the per-second frames at 1×/2× speed (or skips to the end).
 * It never recalculates anything (spec §15.4, §10.1).
 *
 * Respects prefers-reduced-motion: when reduced, playback auto-skips to the
 * final frame instead of animating (spec §16).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { SimulationRun } from "../domain/types";

export interface PlaybackState {
  /** Current virtual second (0..duration-1), or duration when complete. */
  currentSecond: number;
  isPlaying: boolean;
  speed: 1 | 2;
  isComplete: boolean;
}

const TICK_MS = 100; // 1 real second = 10 virtual seconds at 1x

export function useSimulationPlayback(run: SimulationRun | undefined) {
  const duration = run?.virtualDurationSeconds ?? 0;
  const [currentSecond, setCurrentSecond] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const reducedMotion = usePrefersReducedMotion();

  // Reset whenever a new run arrives.
  useEffect(() => {
    setCurrentSecond(0);
    setIsPlaying(false);
    setSpeed(1);
  }, [run?.id]);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isPlaying || !run) return;
    // Reduced-motion users: jump to the end immediately, don't animate.
    if (reducedMotion) {
      setCurrentSecond(duration);
      setIsPlaying(false);
      return;
    }
    const interval = speed * TICK_MS;
    tickRef.current = setInterval(() => {
      setCurrentSecond((s) => {
        const next = s + 1;
        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
    }, interval);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isPlaying, speed, duration, run, reducedMotion]);

  const play = useCallback(() => {
    if (currentSecond >= duration) setCurrentSecond(0);
    setIsPlaying(true);
  }, [currentSecond, duration]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const seek = useCallback(
    (second: number) => {
      setCurrentSecond(Math.max(0, Math.min(duration, Math.round(second))));
    },
    [duration]
  );

  const skipToEnd = useCallback(() => {
    setIsPlaying(false);
    setCurrentSecond(duration);
  }, [duration]);

  const restart = useCallback(() => {
    setIsPlaying(false);
    setCurrentSecond(0);
  }, []);

  return {
    currentSecond,
    isPlaying,
    speed,
    isComplete: currentSecond >= duration,
    play,
    pause,
    seek,
    skipToEnd,
    restart,
    cycleSpeed: () => setSpeed((s) => (s === 1 ? 2 : 1)),
  };
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}
