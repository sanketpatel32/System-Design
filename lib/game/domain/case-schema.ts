/**
 * Zod schemas mirroring every domain type. These run at case-load time to give
 * a structured, field-path-accurate error before any UI renders.
 *
 * Spec reference: §9.2 (use Zod), §0.1 rule 6 (malformed case must fail loudly).
 *
 * The schemas are deliberately permissive about *values* (a config field can
 * be any number) and strict about *shape* (the right keys, the right union
 * tag). Semantic validation (cross-references, cycles, solution paths) lives
 * in `case-validator.ts`.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

const visibility = z.enum(["hidden", "silhouette", "revealed"]);

const symptomTone = z.enum(["critical", "warning", "healthy", "info"]);

const componentType = z.enum([
  "client",
  "cdn",
  "api-gateway",
  "service",
  "database",
  "cache",
  "queue",
  "worker",
  "external-api",
  "idempotency-store",
  "load-balancer",
]);

// ---------------------------------------------------------------------------
// Component config — discriminated union on `kind`
// ---------------------------------------------------------------------------

export const componentConfigSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("client"),
    manualRetryProbability: z.number().min(0).max(1),
    generatesStableCheckoutId: z.boolean(),
  }),
  z.object({
    kind: z.literal("api-gateway"),
    timeoutMs: z.number().positive(),
    retryCount: z.number().int().min(0),
    retryBackoffMs: z.number().min(0),
    retryMethods: z.array(
      z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
    ),
    requireIdempotencyKeyForUnsafeRetries: z.boolean(),
  }),
  z.object({
    kind: z.literal("service"),
    replicas: z.number().int().min(1),
    baseCapacityRpsPerReplica: z.number().positive(),
    baseLatencyMs: z.number().min(0),
    timeoutMs: z.number().positive(),
    supportsIdempotency: z.boolean(),
    idempotencyKeySource: z.enum(["header", "request-body", "none"]).optional(),
    idempotencyTtlSeconds: z.number().positive().optional(),
    replayStoredResponse: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("database"),
    engineLabel: z.string(),
    writeCapacityRps: z.number().positive(),
    readCapacityRps: z.number().positive(),
    baseWriteLatencyMs: z.number().min(0),
    baseReadLatencyMs: z.number().min(0),
    uniqueConstraints: z.array(
      z.object({
        id: z.string(),
        fields: z.array(z.string()),
        enabled: z.boolean(),
      })
    ),
    replicas: z.number().int().min(1),
  }),
  z.object({
    kind: z.literal("cache"),
    capacityRps: z.number().positive(),
    baseLatencyMs: z.number().min(0),
  }),
  z.object({
    kind: z.literal("queue"),
    deliverySemantics: z.enum([
      "at-most-once",
      "at-least-once",
      "effectively-once",
    ]),
    redeliveryProbability: z.number().min(0).max(1),
    throughputRps: z.number().positive(),
  }),
  z.object({
    kind: z.literal("worker"),
    deduplicationStrategy: z.enum(["none", "by-key"]),
    deduplicationKey: z.string().optional(),
    throughputRps: z.number().positive(),
  }),
  z.object({
    kind: z.literal("external-api"),
    completesAfterTimeout: z.boolean(),
    normalLatencyRangeMs: z.tuple([z.number(), z.number()]),
    peakLatencyRangeMs: z.tuple([z.number(), z.number()]),
    peakPhase: z.enum(["warm-up", "sale", "peak", "recovery"]),
  }),
  z.object({
    kind: z.literal("idempotency-store"),
    ttlSeconds: z.number().positive(),
    baseLatencyMs: z.number().min(0),
  }),
  z.object({
    kind: z.literal("load-balancer"),
    strategy: z.enum(["round-robin", "least-connections"]),
  }),
  z.object({
    kind: z.literal("generic"),
  }).catchall(z.unknown()),
]);

// ---------------------------------------------------------------------------
// Graph
// ---------------------------------------------------------------------------

export const architectureNodeSchema = z.object({
  id: z.string().min(1),
  type: componentType,
  label: z.string(),
  description: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }),
  visibility,
  ownership: z.enum(["baseline", "player-added"]),
  config: componentConfigSchema,
  capacity: z.object({ healthMultiplier: z.number().positive() }),
  cost: z.object({ runtime: z.number().min(0), oneOff: z.number().min(0) }),
  tags: z.array(z.string()),
});

export const architectureEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string(),
  target: z.string(),
  protocol: z.enum(["http", "grpc", "sql", "event", "internal"]),
  semantics: z
    .enum(["at-most-once", "at-least-once", "effectively-once"])
    .optional(),
  timeoutMs: z.number().positive().optional(),
  retryPolicy: z
    .object({
      count: z.number().int().min(0),
      backoffMs: z.number().min(0),
      methods: z.array(z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"])),
    })
    .optional(),
  visibility,
  tags: z.array(z.string()),
});

export const architectureGraphSchema = z.object({
  nodes: z.array(architectureNodeSchema),
  edges: z.array(architectureEdgeSchema),
});

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export const evidenceContentSchema = z.discriminatedUnion("category", [
  z.object({
    category: z.literal("log"),
    lines: z.array(
      z.object({
        ts: z.string(),
        level: z.enum(["info", "warn", "error"]),
        msg: z.string(),
      })
    ),
  }),
  z.object({
    category: z.literal("trace"),
    spans: z.array(
      z.object({
        name: z.string(),
        durationMs: z.number(),
        note: z.string().optional(),
      })
    ),
  }),
  z.object({
    category: z.literal("metric"),
    series: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        tone: symptomTone.optional(),
      })
    ),
  }),
  z.object({
    category: z.literal("config"),
    snippet: z.string(),
    language: z.string().optional(),
  }),
  z.object({
    category: z.literal("schema"),
    tables: z.array(
      z.object({
        name: z.string(),
        columns: z.array(
          z.object({
            name: z.string(),
            type: z.string(),
            constraint: z.string().optional(),
          })
        ),
      })
    ),
  }),
  z.object({ category: z.literal("memo"), body: z.string() }),
  z.object({ category: z.literal("diagram"), ascii: z.string() }),
]);

const revealEffectSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("reveal-node"), nodeId: z.string() }),
  z.object({ type: z.literal("reveal-edge"), edgeId: z.string() }),
  z.object({ type: z.literal("reveal-config"), nodeId: z.string(), configKey: z.string() }),
  z.object({ type: z.literal("unlock-hypothesis"), hypothesisId: z.string() }),
  z.object({ type: z.literal("unlock-action"), actionId: z.string() }),
  z.object({ type: z.literal("add-metric"), metricKey: z.string() }),
]);

export const evidenceItemSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  category: z.enum([
    "metric",
    "log",
    "trace",
    "memo",
    "config",
    "schema",
    "diagram",
  ]),
  cost: z.number().int().min(0),
  initiallyUnlocked: z.boolean(),
  reliability: z.enum(["confirmed", "reported", "inferred"]),
  preview: z.string(),
  content: evidenceContentSchema,
  reveals: z.array(revealEffectSchema),
  tags: z.array(z.string()),
  debriefExplanation: z.string(),
  isRedHerring: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Design actions
// ---------------------------------------------------------------------------

const targetRuleSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("any") }),
  z.object({ type: z.literal("by-id"), nodeIds: z.array(z.string()) }),
  z.object({ type: z.literal("by-type"), componentTypes: z.array(componentType) }),
  z.object({ type: z.literal("by-tag"), tags: z.array(z.string()) }),
]);

const architectureMutationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("set-config"),
    nodeId: z.string(),
    path: z.array(z.string()),
    value: z.unknown(),
  }),
  z.object({
    type: z.literal("add-node"),
    node: architectureNodeSchema.omit({ ownership: true }),
  }),
  z.object({ type: z.literal("remove-node"), nodeId: z.string() }),
  z.object({
    type: z.literal("add-edge"),
    edge: architectureEdgeSchema.omit({ id: true }),
  }),
  z.object({ type: z.literal("remove-edge"), edgeId: z.string() }),
  z.object({
    type: z.literal("add-unique-constraint"),
    nodeId: z.string(),
    constraint: z.object({
      id: z.string(),
      fields: z.array(z.string()),
      enabled: z.boolean(),
    }),
  }),
  z.object({
    type: z.literal("enable-unique-constraint"),
    nodeId: z.string(),
    constraintId: z.string(),
  }),
]);

export const designActionSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  category: z.enum([
    "reliability",
    "capacity",
    "integrity",
    "traffic",
    "messaging",
    "observability",
  ]),
  description: z.string(),
  cost: z.number().int().min(0),
  operationalRisk: z.enum(["low", "medium", "high"]),
  reversible: z.boolean(),
  targetRules: z.array(targetRuleSchema),
  prerequisites: z.array(
    z.object({
      kind: z.enum(["action", "evidence"]),
      id: z.string(),
    })
  ),
  effects: z.array(architectureMutationSchema),
  explanation: z.string(),
});

// ---------------------------------------------------------------------------
// Hypotheses, traffic, objectives, scoring, debrief
// ---------------------------------------------------------------------------

const reasonCodeSchema = z.enum([
  "UNSAFE_POST_RETRY",
  "MISSING_IDEMPOTENCY_KEY",
  "IDEMPOTENCY_REPLAYED_RESULT",
  "PAYMENT_COMPLETED_AFTER_TIMEOUT",
  "UNIQUE_CONSTRAINT_BLOCKED_DUPLICATE",
  "SERVICE_NOT_CAPACITY_BOUND",
  "DATABASE_NOT_CAPACITY_BOUND",
  "MANUAL_RETRY_CREATED_NEW_OPERATION",
  "QUEUE_REDELIVERY_DEDUPED_BY_WORKER",
]);

export const hypothesisSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  role: z.enum(["primary", "contributing"]),
  isCorrect: z.boolean(),
  reasonCodes: z.array(reasonCodeSchema),
  supportingEvidenceIds: z.array(z.string()),
  debriefExplanation: z.string(),
});

export const trafficPhaseSchema = z.object({
  phase: z.enum(["warm-up", "sale", "peak", "recovery"]),
  startSecond: z.number().int().min(0),
  endSecond: z.number().int().min(0),
  checkoutRps: z.number().int().min(0),
  description: z.string(),
});

export const trafficScenarioSchema = z.object({
  durationSeconds: z.number().int().min(1),
  phases: z.array(trafficPhaseSchema).min(1),
  manualRetryProbability: z.number().min(0).max(1),
});

export const objectiveSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  metric: z.enum([
    "duplicateOrderRate",
    "duplicateChargeRate",
    "successfulCheckoutRate",
    "p95LatencyMs",
    "estimatedCostUnits",
    "complexityUnits",
  ]),
  comparator: z.enum(["<=", ">=", "=="]),
  target: z.number(),
  points: z.number().positive(),
  description: z.string(),
});

export const scoringConfigSchema = z.object({
  maxScore: z.number().positive(),
  rootCauseAccuracyMax: z.number().min(0),
  objectiveAchievementMax: z.number().min(0),
  investigationEfficiencyMax: z.number().min(0),
  changeBudgetEfficiencyMax: z.number().min(0),
  complexityDisciplineMax: z.number().min(0),
  reliabilityMarginMax: z.number().min(0),
  tradeoffRecognitionMax: z.number().min(0),
  firstRunBonus: z.number().min(0),
  solutionFamilies: z.array(z.array(z.string())),
});

export const debriefConfigSchema = z.object({
  correctRootCauseExplanation: z.string(),
  evidenceChain: z.array(z.string()),
  whyChangesWorked: z.array(z.string()),
  whyAlternativesFailed: z.array(
    z.object({
      hypothesisId: z.string(),
      explanation: z.string(),
    })
  ),
  residualHardeningSteps: z.array(z.string()),
  idealSolution: z.array(
    z.object({
      step: z.string(),
      actionIds: z.array(z.string()),
    })
  ),
});

// ---------------------------------------------------------------------------
// Top-level case schema
// ---------------------------------------------------------------------------

export const caseBriefingSchema = z.object({
  narrative: z.string(),
  incidentWindow: z.string(),
  customerImpact: z.array(z.string()),
  knownSymptoms: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      value: z.string(),
      tone: symptomTone,
    })
  ),
  constraints: z.array(z.string()),
  missionObjectives: z.array(z.string()),
});

export const gameCaseDefinitionSchema = z.object({
  schemaVersion: z.number().int().min(1),
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string(),
  subtitle: z.string().optional(),
  difficulty: z.enum(["tutorial", "easy", "medium", "hard", "expert"]),
  estimatedMinutes: z.number().positive(),
  learningGoals: z.array(z.string()),
  briefing: caseBriefingSchema,
  resources: z.object({
    investigationPoints: z.number().int().min(0),
    changeBudget: z.number().int().min(0),
    incidentTolerance: z.number().int().min(0),
  }),
  baselineArchitecture: architectureGraphSchema,
  initialVisibility: z.object({
    revealedNodeIds: z.array(z.string()),
    revealedEdgeIds: z.array(z.string()),
  }),
  evidence: z.array(evidenceItemSchema),
  hypotheses: z.array(hypothesisSchema),
  availableActions: z.array(designActionSchema),
  trafficScenario: trafficScenarioSchema,
  objectives: z.array(objectiveSchema),
  scoring: scoringConfigSchema,
  debrief: debriefConfigSchema,
  contentMetadata: z.object({
    author: z.string(),
    version: z.string(),
    createdAt: z.string(),
  }),
});
