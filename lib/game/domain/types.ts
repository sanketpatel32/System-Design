/**
 * Architecture Archaeologist — domain types.
 *
 * Pure TypeScript. No React, no DOM, no I/O. This module is the single source
 * of truth for every shape that flows between the simulation engine, the
 * command reducer, the persistence layer, and the UI.
 *
 * Spec reference: §8 (Core data model).
 *
 * Design notes:
 *  - Component behaviour comes from a discriminated-union config (`kind`),
 *    not from the `ComponentType` tag alone (spec §8.5: "Do not use component
 *    types as behavior by themselves").
 *  - Identifiers are string aliases rather than branded types: the rest of the
 *    codebase uses plain strings and JSON, and branding would complicate the
 *    Zod schemas and persistence for little safety gain in a single-player app.
 */

// ---------------------------------------------------------------------------
// Identifiers (spec §8.1)
// ---------------------------------------------------------------------------

export type CaseId = string;
export type SessionId = string;
export type NodeId = string;
export type EdgeId = string;
export type EvidenceId = string;
export type ActionId = string;
export type ObjectiveId = string;
export type SimulationRunId = string;

// ---------------------------------------------------------------------------
// Briefing (spec §8.3)
// ---------------------------------------------------------------------------

export interface SymptomDefinition {
  id: string;
  label: string;
  value: string;
  /** "healthy" symptoms are true but misleading; flagged for the debrief. */
  tone: "critical" | "warning" | "healthy" | "info";
}

export interface CaseBriefing {
  narrative: string;
  incidentWindow: string;
  customerImpact: string[];
  knownSymptoms: SymptomDefinition[];
  constraints: string[];
  missionObjectives: string[];
}

// ---------------------------------------------------------------------------
// Component configuration (spec §8.6) — discriminated union on `kind`
// ---------------------------------------------------------------------------

export interface ClientConfig {
  kind: "client";
  manualRetryProbability: number;
  /** True once the client generates a stable checkout-attempt id. */
  generatesStableCheckoutId: boolean;
}

export interface GatewayConfig {
  kind: "api-gateway";
  timeoutMs: number;
  retryCount: number;
  retryBackoffMs: number;
  retryMethods: Array<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">;
  /** When true, unsafe methods are retried only if an idempotency key is present. */
  requireIdempotencyKeyForUnsafeRetries: boolean;
}

export interface ServiceConfig {
  kind: "service";
  replicas: number;
  baseCapacityRpsPerReplica: number;
  baseLatencyMs: number;
  timeoutMs: number;
  supportsIdempotency: boolean;
  idempotencyKeySource?: "header" | "request-body" | "none";
  idempotencyTtlSeconds?: number;
  replayStoredResponse?: boolean;
}

export interface DatabaseConfig {
  kind: "database";
  engineLabel: string;
  writeCapacityRps: number;
  readCapacityRps: number;
  baseWriteLatencyMs: number;
  baseReadLatencyMs: number;
  uniqueConstraints: UniqueConstraint[];
  replicas: number;
}

export interface UniqueConstraint {
  id: string;
  fields: string[];
  enabled: boolean;
}

export interface CacheConfig {
  kind: "cache";
  capacityRps: number;
  baseLatencyMs: number;
}

export interface QueueConfig {
  kind: "queue";
  deliverySemantics: "at-most-once" | "at-least-once" | "effectively-once";
  redeliveryProbability: number;
  throughputRps: number;
}

export interface WorkerConfig {
  kind: "worker";
  deduplicationStrategy: "none" | "by-key";
  deduplicationKey?: string;
  throughputRps: number;
}

export interface ExternalApiConfig {
  kind: "external-api";
  /** Provider that may complete a charge after the caller has timed out. */
  completesAfterTimeout: boolean;
  normalLatencyRangeMs: [number, number];
  peakLatencyRangeMs: [number, number];
  /** Fraction of the incident window during which the provider is "at peak." */
  peakPhase: TrafficPhase;
}

export interface IdempotencyStoreConfig {
  kind: "idempotency-store";
  ttlSeconds: number;
  baseLatencyMs: number;
}

export interface LoadBalancerConfig {
  kind: "load-balancer";
  strategy: "round-robin" | "least-connections";
}

export interface GenericConfig {
  kind: "generic";
  [key: string]: unknown;
}

export type ComponentConfig =
  | ClientConfig
  | GatewayConfig
  | ServiceConfig
  | DatabaseConfig
  | CacheConfig
  | QueueConfig
  | WorkerConfig
  | ExternalApiConfig
  | IdempotencyStoreConfig
  | LoadBalancerConfig
  | GenericConfig;

// ---------------------------------------------------------------------------
// Architecture graph (spec §8.4, §8.5)
// ---------------------------------------------------------------------------

export type ComponentType =
  | "client"
  | "cdn"
  | "api-gateway"
  | "service"
  | "database"
  | "cache"
  | "queue"
  | "worker"
  | "external-api"
  | "idempotency-store"
  | "load-balancer";

export interface CapacityProfile {
  healthMultiplier: number;
}

export interface CostProfile {
  /** Abstract runtime cost units. */
  runtime: number;
  /** One-off operational/migration cost units. */
  oneOff: number;
}

export interface RetryPolicy {
  count: number;
  backoffMs: number;
  methods: Array<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">;
}

export type Visibility = "hidden" | "silhouette" | "revealed";

export interface ArchitectureNode {
  id: NodeId;
  type: ComponentType;
  label: string;
  description?: string;
  position: { x: number; y: number };
  visibility: Visibility;
  ownership: "baseline" | "player-added";
  config: ComponentConfig;
  capacity: CapacityProfile;
  cost: CostProfile;
  tags: string[];
}

export interface ArchitectureEdge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  protocol: "http" | "grpc" | "sql" | "event" | "internal";
  semantics?: "at-most-once" | "at-least-once" | "effectively-once";
  timeoutMs?: number;
  retryPolicy?: RetryPolicy;
  visibility: Visibility;
  tags: string[];
}

export interface ArchitectureGraph {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

// ---------------------------------------------------------------------------
// Evidence (spec §8.7)
// ---------------------------------------------------------------------------

export type EvidenceCategory =
  | "metric"
  | "log"
  | "trace"
  | "memo"
  | "config"
  | "schema"
  | "diagram";

export type EvidenceReliability = "confirmed" | "reported" | "inferred";

/**
 * A reveal effect mutates the player's view of the system when evidence is
 * inspected. One evidence item may carry several.
 */
export type RevealEffect =
  | { type: "reveal-node"; nodeId: NodeId }
  | { type: "reveal-edge"; edgeId: EdgeId }
  | { type: "reveal-config"; nodeId: NodeId; configKey: string }
  | { type: "unlock-hypothesis"; hypothesisId: string }
  | { type: "unlock-action"; actionId: ActionId }
  | { type: "add-metric"; metricKey: string };

/** Content payloads for the evidence viewer, keyed by category. */
export type EvidenceContent =
  | { category: "log"; lines: Array<{ ts: string; level: "info" | "warn" | "error"; msg: string }> }
  | { category: "trace"; spans: Array<{ name: string; durationMs: number; note?: string }> }
  | { category: "metric"; series: Array<{ label: string; value: string; tone?: SymptomDefinition["tone"] }> }
  | { category: "config"; snippet: string; language?: string }
  | { category: "schema"; tables: Array<{ name: string; columns: Array<{ name: string; type: string; constraint?: string }> }> }
  | { category: "memo"; body: string }
  | { category: "diagram"; ascii: string };

export interface EvidenceItem {
  id: EvidenceId;
  title: string;
  category: EvidenceCategory;
  cost: number;
  initiallyUnlocked: boolean;
  reliability: EvidenceReliability;
  preview: string;
  content: EvidenceContent;
  reveals: RevealEffect[];
  tags: string[];
  /** Shown only in the debrief. */
  debriefExplanation: string;
  /** Marked true for plausible-but-non-causal clues. */
  isRedHerring?: boolean;
}

// ---------------------------------------------------------------------------
// Design actions (spec §8.8)
// ---------------------------------------------------------------------------

export type DesignActionCategory =
  | "reliability"
  | "capacity"
  | "integrity"
  | "traffic"
  | "messaging"
  | "observability";

export type OperationalRisk = "low" | "medium" | "high";

/** A rule describing which nodes an action may target. */
export type TargetRule =
  | { type: "any" }
  | { type: "by-id"; nodeIds: NodeId[] }
  | { type: "by-type"; componentTypes: ComponentType[] }
  | { type: "by-tag"; tags: string[] };

export interface ActionPrerequisite {
  /** Another action that must already be applied, or an evidence item. */
  kind: "action" | "evidence";
  id: string;
}

/**
 * A mutation applied to the architecture graph when a design action is taken.
 * Effects are described declaratively; `applyMutation` interprets them.
 */
export type ArchitectureMutation =
  | { type: "set-config"; nodeId: NodeId; path: string[]; value: unknown }
  | { type: "add-node"; node: Omit<ArchitectureNode, "ownership"> }
  | { type: "remove-node"; nodeId: NodeId }
  | { type: "add-edge"; edge: Omit<ArchitectureEdge, "id"> }
  | { type: "remove-edge"; edgeId: EdgeId }
  | { type: "add-unique-constraint"; nodeId: NodeId; constraint: UniqueConstraint }
  | { type: "enable-unique-constraint"; nodeId: NodeId; constraintId: string };

export interface DesignActionDefinition {
  id: ActionId;
  title: string;
  category: DesignActionCategory;
  description: string;
  cost: number;
  operationalRisk: OperationalRisk;
  reversible: boolean;
  targetRules: TargetRule[];
  prerequisites: ActionPrerequisite[];
  effects: ArchitectureMutation[];
  explanation: string;
}

// ---------------------------------------------------------------------------
// Hypotheses (spec §4.9)
// ---------------------------------------------------------------------------

export interface HypothesisOption {
  id: string;
  label: string;
  /** "primary" mechanisms vs "contributing" factors. */
  role: "primary" | "contributing";
  isCorrect: boolean;
  /** Reason codes this hypothesis maps to, for scoring/debrief. */
  reasonCodes: ReasonCode[];
  /** Evidence that supports (or refutes) this hypothesis. */
  supportingEvidenceIds: EvidenceId[];
  debriefExplanation: string;
}

// ---------------------------------------------------------------------------
// Traffic + simulation inputs (spec §10.4)
// ---------------------------------------------------------------------------

export type TrafficPhase = "warm-up" | "sale" | "peak" | "recovery";

export interface TrafficPhaseConfig {
  phase: TrafficPhase;
  startSecond: number;
  endSecond: number;
  checkoutRps: number;
  description: string;
}

export interface TrafficScenario {
  durationSeconds: number;
  phases: TrafficPhaseConfig[];
  /** Probability a customer manually retries after a visible error. */
  manualRetryProbability: number;
}

export interface RequestCohort {
  second: number;
  route: "checkout";
  count: number;
  hasStableCheckoutAttemptId: boolean;
  manualRetryProbability: number;
}

// ---------------------------------------------------------------------------
// Objectives + scoring (spec §4.12, §11)
// ---------------------------------------------------------------------------

export type ObjectiveMetricKey =
  | "duplicateOrderRate"
  | "duplicateChargeRate"
  | "successfulCheckoutRate"
  | "p95LatencyMs"
  | "estimatedCostUnits"
  | "complexityUnits";

export type ObjectiveComparator = "<=" | ">=" | "==";

export interface ObjectiveDefinition {
  id: ObjectiveId;
  label: string;
  metric: ObjectiveMetricKey;
  comparator: ObjectiveComparator;
  target: number;
  /** How much of the objective score is awarded for full achievement. */
  points: number;
  description: string;
}

export interface ScoringConfig {
  maxScore: number;
  rootCauseAccuracyMax: number;
  objectiveAchievementMax: number;
  investigationEfficiencyMax: number;
  changeBudgetEfficiencyMax: number;
  complexityDisciplineMax: number;
  reliabilityMarginMax: number;
  tradeoffRecognitionMax: number;
  firstRunBonus: number;
  /** Curated set of action-id combos that represent strong solutions. */
  solutionFamilies: ActionId[][];
}

export interface DebriefConfig {
  correctRootCauseExplanation: string;
  evidenceChain: string[];
  whyChangesWorked: string[];
  whyAlternativesFailed: { hypothesisId: string; explanation: string }[];
  residualHardeningSteps: string[];
  idealSolution: { step: string; actionIds: ActionId[] }[];
}

export interface ContentMetadata {
  author: string;
  version: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Case definition (spec §8.2)
// ---------------------------------------------------------------------------

export interface CaseResourceConfig {
  investigationPoints: number;
  changeBudget: number;
  incidentTolerance: number;
}

export interface VisibilityConfig {
  /** Node ids visible at briefing time. */
  revealedNodeIds: NodeId[];
  revealedEdgeIds: EdgeId[];
}

export interface GameCaseDefinition {
  schemaVersion: number;
  id: CaseId;
  slug: string;
  title: string;
  subtitle?: string;
  difficulty: "tutorial" | "easy" | "medium" | "hard" | "expert";
  estimatedMinutes: number;
  learningGoals: string[];
  briefing: CaseBriefing;
  resources: CaseResourceConfig;
  baselineArchitecture: ArchitectureGraph;
  initialVisibility: VisibilityConfig;
  evidence: EvidenceItem[];
  hypotheses: HypothesisOption[];
  availableActions: DesignActionDefinition[];
  trafficScenario: TrafficScenario;
  objectives: ObjectiveDefinition[];
  scoring: ScoringConfig;
  debrief: DebriefConfig;
  contentMetadata: ContentMetadata;
}

// ---------------------------------------------------------------------------
// Reason codes (spec §10.16)
// ---------------------------------------------------------------------------

export type ReasonCode =
  | "UNSAFE_POST_RETRY"
  | "MISSING_IDEMPOTENCY_KEY"
  | "IDEMPOTENCY_REPLAYED_RESULT"
  | "PAYMENT_COMPLETED_AFTER_TIMEOUT"
  | "UNIQUE_CONSTRAINT_BLOCKED_DUPLICATE"
  | "SERVICE_NOT_CAPACITY_BOUND"
  | "DATABASE_NOT_CAPACITY_BOUND"
  | "MANUAL_RETRY_CREATED_NEW_OPERATION"
  | "QUEUE_REDELIVERY_DEDUPED_BY_WORKER";

// ---------------------------------------------------------------------------
// Session state (spec §8.9) + commands (§8.10)
// ---------------------------------------------------------------------------

export type GamePhase =
  | "LOADING"
  | "BRIEFING"
  | "INVESTIGATION"
  | "HYPOTHESIS_READY"
  | "DESIGN"
  | "SIMULATING"
  | "OUTCOME_REVIEW"
  | "CASE_RESOLVED"
  | "DEBRIEF";

export interface SubmittedHypothesis {
  primaryHypothesisId: string;
  contributingFactorIds: string[];
  citedEvidenceIds: EvidenceId[];
  responsibleComponentId?: NodeId;
  expectedFixActionId?: ActionId;
  expectedTradeoff?: string;
  freeTextNote?: string;
  submittedAt: string;
}

// A snapshot of applied action ids, used for rollback + scoring.
export interface AppliedActionRecord {
  actionId: ActionId;
  targetNodeId?: NodeId;
  appliedAt: string;
}

export interface GameSession {
  schemaVersion: number;
  id: SessionId;
  caseId: CaseId;
  userId?: string;
  status: GamePhase;
  createdAt: string;
  updatedAt: string;
  investigationPointsRemaining: number;
  changeBudgetRemaining: number;
  incidentToleranceRemaining: number;
  unlockedEvidenceIds: EvidenceId[];
  inspectedEvidenceIds: EvidenceId[];
  revealedNodeIds: NodeId[];
  revealedEdgeIds: EdgeId[];
  /** Current working architecture (baseline + player edits). */
  currentArchitecture: ArchitectureGraph;
  baselineArchitectureHash: string;
  appliedActions: AppliedActionRecord[];
  commandLog: GameCommand[];
  hypothesis?: SubmittedHypothesis;
  simulationRuns: SimulationRun[];
  acceptedRunId?: SimulationRunId;
  score?: ScoreReport;
}

// ---------------------------------------------------------------------------
// Simulation report (spec §8.11)
// ---------------------------------------------------------------------------

export interface SimulationEvent {
  second: number;
  reasonCode: ReasonCode;
  message: string;
  tone: "info" | "warn" | "critical" | "positive";
}

export interface MetricSeries {
  key: ObjectiveMetricKey | string;
  label: string;
  /** Per-second samples across the virtual timeline. */
  samples: number[];
  unit: string;
}

export type ObjectiveStatus = "passed" | "failed" | "partial";

export interface ObjectiveResult {
  objectiveId: ObjectiveId;
  status: ObjectiveStatus;
  actual: number;
  target: number;
  comparator: ObjectiveComparator;
  /** Fraction of the objective's points awarded (0..1). */
  credit: number;
}

export interface SimulationSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  duplicateOrderRate: number;
  duplicateChargeRate: number;
  successfulCheckoutRate: number;
  estimatedCostUnits: number;
  complexityUnits: number;
  newRisks: string[];
  residualRisks: string[];
}

export interface SimulationRun {
  id: SimulationRunId;
  seed: string;
  architectureHash: string;
  startedAt: string;
  virtualDurationSeconds: number;
  metrics: MetricSeries[];
  events: SimulationEvent[];
  objectiveResults: ObjectiveResult[];
  summary: SimulationSummary;
  appliedActionIds: ActionId[];
}

// ---------------------------------------------------------------------------
// Commands (spec §8.10, §3.3)
// ---------------------------------------------------------------------------

export interface CommandMetadata {
  id: string;
  sessionId: SessionId;
  issuedAt: string;
  sequence: number;
}

export interface InspectEvidenceCommand {
  type: "INSPECT_EVIDENCE";
  meta: CommandMetadata;
  evidenceId: EvidenceId;
}

export interface SubmitHypothesisCommand {
  type: "SUBMIT_HYPOTHESIS";
  meta: CommandMetadata;
  hypothesis: SubmittedHypothesis;
}

export interface ApplyDesignActionCommand {
  type: "APPLY_DESIGN_ACTION";
  meta: CommandMetadata;
  actionId: ActionId;
  targetNodeId?: NodeId;
}

export interface RevertDesignActionCommand {
  type: "REVERT_DESIGN_ACTION";
  meta: CommandMetadata;
  actionId: ActionId;
}

export interface RollbackToBaselineCommand {
  type: "ROLLBACK_TO_BASELINE";
  meta: CommandMetadata;
}

export interface RunSimulationCommand {
  type: "RUN_SIMULATION";
  meta: CommandMetadata;
  seed: string;
  /**
   * The precomputed simulation run. The application layer computes this with
   * the pure simulation engine (seeded from session + architecture), then
   * dispatches the command carrying the result. This keeps the reducer pure —
   * it never calls the simulator itself (spec §12.2, §15.4).
   */
  run: SimulationRun;
}

export interface AcceptSolutionCommand {
  type: "ACCEPT_SOLUTION";
  meta: CommandMetadata;
  runId: SimulationRunId;
}

export type GameCommand =
  | InspectEvidenceCommand
  | SubmitHypothesisCommand
  | ApplyDesignActionCommand
  | RevertDesignActionCommand
  | RollbackToBaselineCommand
  | RunSimulationCommand
  | AcceptSolutionCommand;

// ---------------------------------------------------------------------------
// Scoring output (spec §11)
// ---------------------------------------------------------------------------

export interface ScoreBreakdown {
  rootCauseAccuracy: number;
  objectiveAchievement: number;
  investigationEfficiency: number;
  changeBudgetEfficiency: number;
  complexityDiscipline: number;
  reliabilityMargin: number;
  tradeoffRecognition: number;
  firstRunBonus: number;
}

export interface ScoreReport {
  total: number;
  maxTotal: number;
  breakdown: ScoreBreakdown;
  rank: RankLabel;
  acceptedRunId: SimulationRunId;
  calculatedAt: string;
}

export type RankLabel =
  | "Principal Archaeologist"
  | "Incident Detective"
  | "Systems Investigator"
  | "Apprentice Maintainer"
  | "Case Reopened";

// ---------------------------------------------------------------------------
// Result helper (spec §12.3) — the reducer never throws; it returns Result.
// ---------------------------------------------------------------------------

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
