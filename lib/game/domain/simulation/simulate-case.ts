/**
 * Deterministic simulation engine — the heart of the game.
 *
 * Given a case + current architecture + seed, produces a `SimulationRun` with
 * metrics, a reason-coded event timeline, and objective results. Pure: same
 * inputs always yield byte-identical outputs (spec §10.1, §28 invariants).
 *
 * Model (spec §10): for each virtual second, generate a cohort of checkout
 * requests. Each logical checkout flows gateway -> order-service -> payment ->
 * database, and may be retried by the gateway on timeout. The semantic
 * identity of the checkout (idempotency key) determines whether retries create
 * duplicate orders/charges or collapse into one operation.
 *
 * The engine is deliberately a semantic model, not a packet simulator.
 */

import type {
  ArchitectureGraph,
  GameCaseDefinition,
  MetricSeries,
  ObjectiveResult,
  ReasonCode,
  SimulationEvent,
  SimulationRun,
  SimulationSummary,
  SimulationTimelineSample,
  RequestCohort,
  TrafficPhase,
} from "../types";
import type { Rng } from "./seeded-rng";
import { createRng } from "./seeded-rng";
import { findNode } from "../graph/graph-utils";
import { getUniqueConstraints } from "../actions/apply-mutation";
import { evaluateObjectives } from "../scoring/objective-evaluator";

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function simulateCase(
  caseDef: GameCaseDefinition,
  architecture: ArchitectureGraph,
  appliedActionIds: string[],
  seed: string,
  runNumber: number
): SimulationRun {
  const rng = createRng(seed);
  const topology = buildTopology(architecture, caseDef);
  const cohorts = generateCohorts(caseDef.trafficScenario, topology, rng);

  const timeline = runTimeline(cohorts, topology, rng, caseDef);
  const metrics = buildMetrics(timeline, caseDef.trafficScenario.durationSeconds);
  const events = timeline.events;
  const objectiveResults = evaluateObjectives(caseDef.objectives, timeline.summary);

  return {
    id: `run_${caseDef.id}_${runNumber}_${seed.slice(0, 8)}`,
    seed,
    architectureHash: hashForRun(seed),
    startedAt: new Date().toISOString(),
    virtualDurationSeconds: caseDef.trafficScenario.durationSeconds,
    metrics,
    events,
    objectiveResults,
    summary: timeline.summary,
    appliedActionIds,
    timeline: buildTimelinePlayback(timeline.perSecond, caseDef),
  };
}

function hashForRun(seed: string): string {
  // Lightweight stable id derived from the seed; the canonical architecture
  // hash is already encoded in the seed itself.
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

// ---------------------------------------------------------------------------
// Topology: extract the typed config the simulation cares about from the graph
// ---------------------------------------------------------------------------

interface Topology {
  gateway: {
    timeoutMs: number;
    retryCount: number;
    retryMethods: string[];
    requireIdemKeyForUnsafe: boolean;
  };
  service: {
    replicas: number;
    capacityPerReplica: number;
    baseLatencyMs: number;
    supportsIdempotency: boolean;
    keySource: string;
  };
  payment: {
    completesAfterTimeout: boolean;
    normalRange: [number, number];
    peakRange: [number, number];
  };
  database: {
    writeCapacity: number;
    uniqueConstraintsEnabled: number;
  };
  client: {
    manualRetryProbability: number;
    generatesStableCheckoutId: boolean;
  };
}

function buildTopology(graph: ArchitectureGraph, caseDef: GameCaseDefinition): Topology {
  const get = (id: string) => findNode(graph, id);
  const gateway = get("gateway");
  const service = get("order-service");
  const payment = get("payment-provider");
  const database = get("orders-db");
  const client = get("browser");

  return {
    gateway: gateway && gateway.config.kind === "api-gateway"
      ? {
          timeoutMs: gateway.config.timeoutMs,
          retryCount: gateway.config.retryCount,
          retryMethods: gateway.config.retryMethods,
          requireIdemKeyForUnsafe: gateway.config.requireIdempotencyKeyForUnsafeRetries,
        }
      : { timeoutMs: 1500, retryCount: 2, retryMethods: ["GET", "POST"], requireIdemKeyForUnsafe: false },
    service: service && service.config.kind === "service"
      ? {
          replicas: service.config.replicas,
          capacityPerReplica: service.config.baseCapacityRpsPerReplica,
          baseLatencyMs: service.config.baseLatencyMs,
          supportsIdempotency: service.config.supportsIdempotency,
          keySource: service.config.idempotencyKeySource ?? "none",
        }
      : { replicas: 3, capacityPerReplica: 80, baseLatencyMs: 40, supportsIdempotency: false, keySource: "none" },
    payment: payment && payment.config.kind === "external-api"
      ? {
          completesAfterTimeout: payment.config.completesAfterTimeout,
          normalRange: payment.config.normalLatencyRangeMs,
          peakRange: payment.config.peakLatencyRangeMs,
        }
      : { completesAfterTimeout: true, normalRange: [350, 700], peakRange: [1400, 3000] },
    database: database && database.config.kind === "database"
      ? {
          writeCapacity: database.config.writeCapacityRps,
          uniqueConstraintsEnabled: getUniqueConstraints(graph, "orders-db").length,
        }
      : { writeCapacity: 300, uniqueConstraintsEnabled: 0 },
    client: client && client.config.kind === "client"
      ? {
          manualRetryProbability: client.config.manualRetryProbability,
          generatesStableCheckoutId: client.config.generatesStableCheckoutId,
        }
      : { manualRetryProbability: 0.35, generatesStableCheckoutId: false },
  };
}

// ---------------------------------------------------------------------------
// Traffic cohorts (spec §10.4)
// ---------------------------------------------------------------------------

function generateCohorts(
  scenario: GameCaseDefinition["trafficScenario"],
  _topology: Topology,
  rng: Rng
): RequestCohort[] {
  const cohorts: RequestCohort[] = [];
  for (const phase of scenario.phases) {
    for (let s = phase.startSecond; s < phase.endSecond; s++) {
      // Small jitter on the per-second count so the timeline isn't perfectly flat.
      const jitter = rng.range(0.85, 1.15);
      cohorts.push({
        second: s,
        route: "checkout",
        count: Math.round(phase.checkoutRps * jitter),
        hasStableCheckoutAttemptId: _topology.client.generatesStableCheckoutId,
        manualRetryProbability: scenario.manualRetryProbability,
      });
    }
  }
  return cohorts;
}

// ---------------------------------------------------------------------------
// Timeline runner — the semantic model
// ---------------------------------------------------------------------------

interface TimelineResult {
  summary: SimulationSummary;
  events: SimulationEvent[];
  perSecond: PerSecondMetrics[];
}

interface PerSecondMetrics {
  second: number;
  requests: number;
  successes: number;
  failures: number;
  duplicates: number;
  duplicateCharges: number;
  p95LatencyMs: number;
}

function runTimeline(
  cohorts: RequestCohort[],
  topology: Topology,
  rng: Rng,
  caseDef: GameCaseDefinition
): TimelineResult {
  const events: SimulationEvent[] = [];
  const perSecond: PerSecondMetrics[] = [];

  let totalRequests = 0;
  let totalSuccesses = 0;
  let totalFailures = 0;
  let totalLogicalCheckouts = 0;
  let totalOrdersCreated = 0;
  let totalDuplicateOrders = 0;
  let totalCharges = 0;
  let totalDuplicateCharges = 0;
  let totalIdempotencyReplays = 0;
  let totalUniqueConstraintBlocks = 0;
  const latencies: number[] = [];

  // Track peak phase for payment latency.
  const peakPhase = caseDef.trafficScenario.phases.find((p) => p.phase === "peak");

  for (const cohort of cohorts) {
    const isPeak = peakPhase
      ? cohort.second >= peakPhase.startSecond && cohort.second < peakPhase.endSecond
      : false;

    let secRequests = 0;
    let secSuccesses = 0;
    let secFailures = 0;
    let secDuplicates = 0;
    let secDupCharges = 0;
    const secLatencies: number[] = [];

    // Capacity model (spec §10.5).
    const effectiveCapacity = topology.service.replicas * topology.service.capacityPerReplica;
    const utilization = cohort.count / effectiveCapacity;
    const latencyMultiplier = capacityLatencyMultiplier(utilization);
    const overloadErrorRate = capacityOverloadErrorRate(utilization);

    // First traffic-spike event per phase boundary.
    if (cohort.second === 9) {
      events.push({
        second: 9,
        reasonCode: "UNSAFE_POST_RETRY",
        message: "Sale begins — checkout traffic rising sharply.",
        tone: "info",
      });
    }

    for (let i = 0; i < cohort.count; i++) {
      totalLogicalCheckouts++;
      secRequests++;
      const outcome = simulateCheckout(
        topology,
        rng,
        isPeak,
        latencyMultiplier,
        overloadErrorRate
      );

      totalOrdersCreated += outcome.ordersCreated;
      totalDuplicateOrders += outcome.duplicateOrders;
      totalCharges += outcome.chargesCreated;
      totalDuplicateCharges += outcome.duplicateCharges;
      totalIdempotencyReplays += outcome.idempotencyReplays;
      totalUniqueConstraintBlocks += outcome.uniqueConstraintBlocks;

      if (outcome.success) {
        totalSuccesses++;
        secSuccesses++;
      } else {
        totalFailures++;
        secFailures++;
      }
      latencies.push(outcome.latencyMs);
      secLatencies.push(outcome.latencyMs);
      secDuplicates += outcome.duplicateOrders;
      secDupCharges += outcome.duplicateCharges;
    }

    perSecond.push({
      second: cohort.second,
      requests: secRequests,
      successes: secSuccesses,
      failures: secFailures,
      duplicates: secDuplicates,
      duplicateCharges: secDupCharges,
      p95LatencyMs: percentile(secLatencies, 0.95),
    });
  }

  // Emit reason-coded events for notable moments.
  if (totalIdempotencyReplays > 0) {
    events.push({
      second: 30,
      reasonCode: "IDEMPOTENCY_REPLAYED_RESULT",
      message: `${totalIdempotencyReplays} repeated checkouts resolved to their original result instead of creating new orders.`,
      tone: "positive",
    });
  }
  if (totalUniqueConstraintBlocks > 0) {
    events.push({
      second: 31,
      reasonCode: "UNIQUE_CONSTRAINT_BLOCKED_DUPLICATE",
      message: `${totalUniqueConstraintBlocks} duplicate inserts blocked by the unique constraint.`,
      tone: "positive",
    });
  }

  const p95 = percentile(latencies, 0.95);
  const summary: SimulationSummary = {
    totalRequests: totalLogicalCheckouts,
    successfulRequests: totalSuccesses,
    failedRequests: totalFailures,
    p50LatencyMs: percentile(latencies, 0.5),
    p95LatencyMs: p95,
    p99LatencyMs: percentile(latencies, 0.99),
    duplicateOrderRate: safeRate(totalDuplicateOrders, totalOrdersCreated),
    duplicateChargeRate: safeRate(totalDuplicateCharges, totalCharges),
    successfulCheckoutRate: safeRate(totalSuccesses, totalLogicalCheckouts),
    estimatedCostUnits: estimateCost(topology, caseDef),
    complexityUnits: estimateComplexity(topology, caseDef),
    newRisks: [],
    residualRisks: buildResidualRisks(topology, totalDuplicateOrders, totalDuplicateCharges),
  };

  return { summary, events: events.sort((a, b) => a.second - b.second), perSecond };
}

// ---------------------------------------------------------------------------
// Per-checkout simulation
// ---------------------------------------------------------------------------

interface CheckoutOutcome {
  success: boolean;
  latencyMs: number;
  ordersCreated: number;
  duplicateOrders: number;
  chargesCreated: number;
  duplicateCharges: number;
  idempotencyReplays: number;
  uniqueConstraintBlocks: number;
}

function simulateCheckout(
  topology: Topology,
  rng: Rng,
  isPeak: boolean,
  latencyMultiplier: number,
  overloadErrorRate: number
): CheckoutOutcome {
  const result: CheckoutOutcome = {
    success: false,
    latencyMs: 0,
    ordersCreated: 0,
    duplicateOrders: 0,
    chargesCreated: 0,
    duplicateCharges: 0,
    idempotencyReplays: 0,
    uniqueConstraintBlocks: 0,
  };

  // Overload-induced failure (capacity model).
  if (rng.chance(overloadErrorRate)) {
    result.success = false;
    result.latencyMs = topology.gateway.timeoutMs;
    return result;
  }

  // Payment latency: provider slows during peak (spec §10.6).
  const paymentLatency = isPeak
    ? rng.range(topology.payment.peakRange[0], topology.payment.peakRange[1])
    : rng.range(topology.payment.normalRange[0], topology.payment.normalRange[1]);

  const serviceLatency = topology.service.baseLatencyMs * latencyMultiplier;
  const totalLatency = serviceLatency + paymentLatency;
  result.latencyMs = Math.round(totalLatency);

  // Did the gateway time out waiting for the response?
  const timedOut = totalLatency > topology.gateway.timeoutMs;

  // Number of gateway retry attempts for this logical checkout (spec §10.7).
  const retriesActuallySent = countRetries(topology, rng, timedOut);

  // First attempt: did the payment eventually complete? When the provider
  // "completes after timeout", the charge goes through even though the caller
  // gave up — this is precisely what makes a timeout ambiguous (spec §10.6).
  // The probability is high because the provider *does* finish; the ambiguity
  // is about the caller not knowing, not about the payment failing.
  const firstPaymentCompleted = !timedOut
    ? true
    : topology.payment.completesAfterTimeout
    ? rng.chance(0.95) // almost always completes; the rare miss is a true failure
    : rng.chance(0.4);

  if (firstPaymentCompleted) {
    result.ordersCreated += 1;
    result.chargesCreated += 1;
  }

  // Each subsequent gateway retry can duplicate unless idempotency protects it.
  for (let attempt = 0; attempt < retriesActuallySent; attempt++) {
    const dupPrevented = tryPreventDuplicate(topology, rng);
    if (dupPrevented.byIdempotency) {
      result.idempotencyReplays += 1;
      // Idempotent replay: no new order, no new charge, checkout still succeeds.
      continue;
    }
    if (dupPrevented.byUniqueConstraint) {
      result.uniqueConstraintBlocks += 1;
      continue;
    }
    // Not prevented: this retry creates a fresh order + charge.
    result.ordersCreated += 1;
    result.duplicateOrders += 1;
    result.chargesCreated += 1;
    result.duplicateCharges += 1;
  }

  // Manual customer retry (spec §10.11): a fraction of customers retry after
  // a visible error. This only duplicates if there's no stable identity.
  if (timedOut && rng.chance(topology.client.manualRetryProbability)) {
    const manualPrevented = tryPreventDuplicate(topology, rng);
    if (!manualPrevented.byIdempotency && !manualPrevented.byUniqueConstraint) {
      if (topology.client.generatesStableCheckoutId && topology.service.supportsIdempotency) {
        // Stable identity + idempotency collapses the manual retry too.
        result.idempotencyReplays += 1;
      } else {
        result.ordersCreated += 1;
        result.duplicateOrders += 1;
        result.chargesCreated += 1;
        result.duplicateCharges += 1;
      }
    }
  }

  // Success = the logical checkout ultimately resulted in at least one order.
  result.success = result.ordersCreated > 0;
  return result;
}

function countRetries(topology: Topology, rng: Rng, timedOut: boolean): number {
  if (!timedOut) return 0;
  // The gateway retries up to retryCount times, but only for configured methods.
  // POST is in retryMethods in the baseline, so unsafe retries happen.
  const unsafeRetried = topology.gateway.retryMethods.includes("POST");
  if (!unsafeRetried) return 0;
  if (topology.gateway.requireIdemKeyForUnsafe && !topology.service.supportsIdempotency) {
    return 0; // gateway refuses to retry unsafe without an idempotency key
  }
  return topology.gateway.retryCount;
}

interface DuplicationPrevention {
  byIdempotency: boolean;
  byUniqueConstraint: boolean;
}

function tryPreventDuplicate(topology: Topology, rng: Rng): DuplicationPrevention {
  // Idempotency rule (spec §10.9): stable key + service support => replay.
  if (topology.service.supportsIdempotency && topology.client.generatesStableCheckoutId) {
    return { byIdempotency: true, byUniqueConstraint: false };
  }
  // Unique constraint rule (spec §10.10): blocks the duplicate insert.
  if (topology.database.uniqueConstraintsEnabled > 0 && rng.chance(0.9)) {
    return { byIdempotency: false, byUniqueConstraint: true };
  }
  return { byIdempotency: false, byUniqueConstraint: false };
}

// ---------------------------------------------------------------------------
// Capacity model (spec §10.5) — latency multiplier + overload error ladder
// ---------------------------------------------------------------------------

function capacityLatencyMultiplier(utilization: number): number {
  if (utilization <= 0.7) return 1.0;
  if (utilization <= 0.9) return 1.0 + ((utilization - 0.7) / 0.2) * 0.8;
  if (utilization <= 1.0) return 1.8 + ((utilization - 0.9) / 0.1) * 2.2;
  return 4.0 + Math.min(8.0, (utilization - 1.0) * 10);
}

function capacityOverloadErrorRate(utilization: number): number {
  if (utilization <= 0.95) return 0;
  if (utilization <= 1.0) return 0.02;
  if (utilization <= 1.2) return 0.02 + ((utilization - 1.0) / 0.2) * 0.18;
  return Math.min(0.6, 0.2 + ((utilization - 1.2)) * 0.4);
}

/** Map per-second samples to the playback timeline, tagging the traffic phase. */
function buildTimelinePlayback(
  perSecond: PerSecondMetrics[],
  caseDef: GameCaseDefinition
): SimulationTimelineSample[] {
  return perSecond.map((ps) => {
    const phaseDef = caseDef.trafficScenario.phases.find(
      (p) => ps.second >= p.startSecond && ps.second < p.endSecond
    );
    return {
      second: ps.second,
      requests: ps.requests,
      successes: ps.successes,
      failures: ps.failures,
      duplicates: ps.duplicates,
      duplicateCharges: ps.duplicateCharges,
      p95LatencyMs: ps.p95LatencyMs,
      phase: phaseDef?.phase ?? "warm-up",
    };
  });
}

// ---------------------------------------------------------------------------
// Metrics aggregation
// ---------------------------------------------------------------------------

function buildMetrics(
  timeline: TimelineResult,
  duration: number
): MetricSeries[] {
  const samples = (key: keyof PerSecondMetrics) =>
    Array.from({ length: duration }, (_, i) => {
      const ps = timeline.perSecond.find((p) => p.second === i);
      return ps ? Number(ps[key]) : 0;
    });

  return [
    {
      key: "requests",
      label: "Checkout requests/s",
      samples: samples("requests"),
      unit: "rps",
    },
    {
      key: "p95LatencyMs",
      label: "p95 latency",
      samples: samples("p95LatencyMs"),
      unit: "ms",
    },
    {
      key: "duplicates",
      label: "Duplicate orders/s",
      samples: samples("duplicates"),
      unit: "ops",
    },
  ];
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

function safeRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

// ---------------------------------------------------------------------------
// Cost + complexity (spec §10.13, §10.14) — abstract units
// ---------------------------------------------------------------------------

function estimateCost(topology: Topology, caseDef: GameCaseDefinition): number {
  // Baseline runtime cost of the components, plus per-replica cost.
  const serviceCost = topology.service.replicas * 0.5;
  const dbCost = topology.database.writeCapacity / 300;
  return Math.round((2 + serviceCost + dbCost) * 10) / 10;
}

function estimateComplexity(topology: Topology, caseDef: GameCaseDefinition): number {
  let complexity = 2; // baseline
  if (topology.service.supportsIdempotency) complexity += 1;
  if (topology.database.uniqueConstraintsEnabled > 0) complexity += 0.5;
  if (topology.gateway.requireIdemKeyForUnsafe) complexity += 0.5;
  return Math.round(complexity * 10) / 10;
}

function buildResidualRisks(
  topology: Topology,
  dupOrders: number,
  dupCharges: number
): string[] {
  const risks: string[] = [];
  if (dupOrders > 0) risks.push("Duplicate orders still occurring.");
  if (dupCharges > 0) risks.push("Duplicate charges still occurring.");
  if (!topology.service.supportsIdempotency)
    risks.push("No end-to-end idempotency — manual retries can still duplicate.");
  if (topology.payment.completesAfterTimeout && topology.gateway.retryCount > 0)
    risks.push("Payment-provider timeout ambiguity remains; retries without an idempotency key are unsafe.");
  return risks;
}
