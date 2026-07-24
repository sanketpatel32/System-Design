/**
 * Static case repository.
 *
 * Cases ship with the frontend bundle (Mode A, spec §0.2). Each case is
 * validated exactly once on first access via the Zod + semantic validator.
 * A malformed case throws a CaseValidationError at load time rather than
 * rendering a blank screen (spec §0.1 rule 6, §19.2).
 *
 * The repository is the only place the UI should obtain case definitions from,
 * keeping the validation boundary in one spot.
 */

import type { GameCaseDefinition } from "../domain/types";
import { validateCase } from "../domain/case-validator";
import { ghostOrdersCase } from "../content/cases/ghost-orders-at-midnight/case";

const RAW_CASES: GameCaseDefinition[] = [ghostOrdersCase];

let _validated: Map<string, GameCaseDefinition> | null = null;

function loadAll(): Map<string, GameCaseDefinition> {
  if (_validated) return _validated;
  const map = new Map<string, GameCaseDefinition>();
  for (const raw of RAW_CASES) {
    // validateCase throws CaseValidationError on failure — fail loud, once.
    const valid = validateCase(raw);
    map.set(valid.slug, valid);
  }
  _validated = map;
  return map;
}

/** Re-load and re-validate every case (used by tests). */
export function reloadCases(): void {
  _validated = null;
  loadAll();
}

export function getAllCases(): GameCaseDefinition[] {
  return [...loadAll().values()];
}

export function getCaseBySlug(slug: string): GameCaseDefinition | undefined {
  return loadAll().get(slug);
}

export function getCaseById(id: string): GameCaseDefinition | undefined {
  return getAllCases().find((c) => c.id === id);
}

/** Slugs for static-export `generateStaticParams`. */
export function getCaseSlugs(): string[] {
  return getAllCases().map((c) => c.slug);
}
