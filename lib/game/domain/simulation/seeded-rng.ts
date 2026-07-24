/**
 * Seeded pseudo-random number generator (Mulberry32).
 *
 * Determinism is non-negotiable for the simulation (spec §0.1 rule 5, §10.3):
 * the same seed + architecture must always produce byte-identical reports.
 * Mulberry32 is fast, dependency-free, and well-distributed for this use.
 *
 * The seed is derived from caseId + sessionId + runNumber + architectureHash,
 * so every distinct design produces a distinct (but reproducible) incident.
 *
 * Spec reference: §10.3 (Determinism).
 */

/** Hash an arbitrary string into a 32-bit unsigned integer (FNV-1a). */
export function hashSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Float in [min, max). */
  range(min: number, max: number): number;
  /** True with probability `p` (0..1). */
  chance(p: number): boolean;
  /** Pick one element uniformly. */
  pick<T>(items: readonly T[]): T;
}

/** Create a deterministic RNG seeded from a string. */
export function createRng(seed: string): Rng {
  let state = hashSeed(seed);
  // Avoid the degenerate all-zero state.
  if (state === 0) state = 0x1701;

  const next = (): number => {
    // Mulberry32 core step.
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    range: (min, max) => next() * (max - min) + min,
    chance: (p) => next() < p,
    pick: (items) => items[Math.floor(next() * items.length)],
  };
}
