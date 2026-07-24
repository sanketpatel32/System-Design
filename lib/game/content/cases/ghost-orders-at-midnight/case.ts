/**
 * Case: Ghost Orders at Midnight.
 *
 * The complete, validated tutorial case. Every number here is tuned to the
 * simulation balancing targets in spec §23: the baseline reproduces the
 * duplicate-order incident, the correct idempotency solution passes all
 * objectives, and scaling-only solutions fail for the right reason.
 *
 * Spec reference: §4 (the first playable case).
 */

import type { GameCaseDefinition } from "../../../domain/types";

export const ghostOrdersCase: GameCaseDefinition = {
  schemaVersion: 1,
  id: "case_ghost_orders_v1",
  slug: "ghost-orders-at-midnight",
  title: "Ghost Orders at Midnight",
  subtitle: "An incident investigation into duplicate orders and charges",
  difficulty: "tutorial",
  estimatedMinutes: 25,
  learningGoals: [
    "Network timeouts do not prove that an operation failed.",
    "Automatic retries can duplicate non-idempotent operations.",
    "Idempotency should be enforced close to the operation boundary.",
    "Database uniqueness can provide a second safety layer.",
    "Horizontal scaling does not solve semantic duplication.",
    "Every fix introduces cost and complexity.",
  ],

  // -------------------------------------------------------------------------
  // §4.2, §4.6 — narrative + symptoms
  // -------------------------------------------------------------------------
  briefing: {
    narrative:
      "You have joined an e-commerce company as the new reliability lead. During last night's late flash sale, some customers received duplicate orders — and duplicate charges. The previous team left behind incomplete diagrams and conflicting explanations. The CEO wants the issue understood and fixed before tomorrow's larger sale. You have limited time, a strict change budget, and no mandate to rewrite the platform.",
    incidentWindow: "23:55 – 00:20 (25-minute flash sale window)",
    customerImpact: [
      "1.8% of orders were duplicated between 23:55 and 00:20.",
      "Customer support reports duplicate charges on affected orders.",
      "Fulfillment reports fewer duplicate shipments than duplicate orders.",
      "API p95 latency rose from 420 ms to 2.6 s during the peak.",
    ],
    knownSymptoms: [
      {
        id: "symptom_dup_orders",
        label: "Duplicate orders",
        value: "1.8% of orders duplicated",
        tone: "critical",
      },
      {
        id: "symptom_p95",
        label: "API p95 latency",
        value: "420 ms → 2.6 s",
        tone: "critical",
      },
      {
        id: "symptom_svc_cpu",
        label: "Order-service CPU",
        value: "Stayed below 55%",
        tone: "healthy",
      },
      {
        id: "symptom_db_cpu",
        label: "Database CPU",
        value: "Stayed below 48%",
        tone: "healthy",
      },
      {
        id: "symptom_dup_charges",
        label: "Duplicate charges",
        value: "Reported by support",
        tone: "critical",
      },
      {
        id: "symptom_fulfillment",
        label: "Duplicate shipments",
        value: "Fewer than duplicate orders",
        tone: "info",
      },
    ],
    constraints: [
      "Change budget: 6 units. You cannot ship every possible fix.",
      "Investigation points: 7. Spend them where evidence matters.",
      "You cannot rewrite the platform overnight.",
      "Tomorrow's sale is larger — the fix must be robust, not cosmetic.",
    ],
    missionObjectives: [
      "Bring duplicate-order rate below 0.05%.",
      "Bring duplicate-charge rate below 0.02%.",
      "Keep successful-checkout rate above 97%.",
      "Keep p95 checkout latency below 3.0 s.",
    ],
  },

  // -------------------------------------------------------------------------
  // §4.8 — resource budgets
  // -------------------------------------------------------------------------
  resources: {
    investigationPoints: 7,
    changeBudget: 6,
    incidentTolerance: 3,
  },

  // -------------------------------------------------------------------------
  // §4.4 — the TRUE hidden architecture (revealed through evidence)
  // -------------------------------------------------------------------------
  baselineArchitecture: {
    nodes: [
      {
        id: "browser",
        type: "client",
        label: "Browser",
        position: { x: 40, y: 40 },
        visibility: "revealed",
        ownership: "baseline",
        config: {
          kind: "client",
          manualRetryProbability: 0.35,
          generatesStableCheckoutId: false,
        },
        capacity: { healthMultiplier: 1 },
        cost: { runtime: 0, oneOff: 0 },
        tags: ["client", "edge"],
      },
      {
        id: "cdn",
        type: "cdn",
        label: "CDN",
        position: { x: 200, y: 40 },
        visibility: "silhouette",
        ownership: "baseline",
        config: { kind: "generic" },
        capacity: { healthMultiplier: 1 },
        cost: { runtime: 0.2, oneOff: 0 },
        tags: ["edge", "cache"],
      },
      {
        id: "gateway",
        type: "api-gateway",
        label: "API Gateway",
        position: { x: 360, y: 40 },
        visibility: "revealed",
        ownership: "baseline",
        config: {
          kind: "api-gateway",
          timeoutMs: 1500,
          retryCount: 2,
          retryBackoffMs: 100,
          retryMethods: ["GET", "POST"],
          requireIdempotencyKeyForUnsafeRetries: false,
        },
        capacity: { healthMultiplier: 1 },
        cost: { runtime: 0.5, oneOff: 0 },
        tags: ["edge", "retries"],
      },
      {
        id: "order-service",
        type: "service",
        label: "Order Service",
        position: { x: 520, y: 40 },
        visibility: "revealed",
        ownership: "baseline",
        config: {
          kind: "service",
          replicas: 3,
          baseCapacityRpsPerReplica: 80,
          baseLatencyMs: 40,
          timeoutMs: 2000,
          supportsIdempotency: false,
          idempotencyKeySource: "none",
        },
        capacity: { healthMultiplier: 1 },
        cost: { runtime: 1.5, oneOff: 0 },
        tags: ["core", "checkout"],
      },
      {
        id: "payment-provider",
        type: "external-api",
        label: "Payment Provider",
        position: { x: 700, y: -40 },
        visibility: "silhouette",
        ownership: "baseline",
        config: {
          kind: "external-api",
          completesAfterTimeout: true,
          normalLatencyRangeMs: [350, 700],
          peakLatencyRangeMs: [1400, 3000],
          peakPhase: "peak",
        },
        capacity: { healthMultiplier: 1 },
        cost: { runtime: 0.8, oneOff: 0 },
        tags: ["external", "payment", "ambiguous-timeout"],
      },
      {
        id: "orders-db",
        type: "database",
        label: "Orders Database",
        position: { x: 700, y: 120 },
        visibility: "revealed",
        ownership: "baseline",
        config: {
          kind: "database",
          engineLabel: "Postgres",
          writeCapacityRps: 300,
          readCapacityRps: 600,
          baseWriteLatencyMs: 8,
          baseReadLatencyMs: 4,
          uniqueConstraints: [],
          replicas: 1,
        },
        capacity: { healthMultiplier: 1 },
        cost: { runtime: 1.2, oneOff: 0 },
        tags: ["core", "storage"],
      },
      {
        id: "events-queue",
        type: "queue",
        label: "Order Events Queue",
        position: { x: 860, y: 40 },
        visibility: "silhouette",
        ownership: "baseline",
        config: {
          kind: "queue",
          deliverySemantics: "at-least-once",
          redeliveryProbability: 0.02,
          throughputRps: 500,
        },
        capacity: { healthMultiplier: 1 },
        cost: { runtime: 0.6, oneOff: 0 },
        tags: ["messaging", "at-least-once"],
      },
      {
        id: "fulfillment-worker",
        type: "worker",
        label: "Fulfillment Worker",
        position: { x: 1020, y: 40 },
        visibility: "silhouette",
        ownership: "baseline",
        config: {
          kind: "worker",
          deduplicationStrategy: "by-key",
          deduplicationKey: "orderId",
          throughputRps: 200,
        },
        capacity: { healthMultiplier: 1 },
        cost: { runtime: 0.7, oneOff: 0 },
        tags: ["worker", "idempotent"],
      },
    ],
    edges: [
      {
        id: "e-browser-cdn",
        source: "browser",
        target: "cdn",
        protocol: "http",
        visibility: "silhouette",
        tags: ["edge"],
      },
      {
        id: "e-browser-gateway",
        source: "browser",
        target: "gateway",
        protocol: "http",
        visibility: "revealed",
        tags: ["checkout", "edge"],
      },
      {
        id: "e-cdn-gateway",
        source: "cdn",
        target: "gateway",
        protocol: "http",
        visibility: "silhouette",
        tags: ["edge"],
      },
      {
        id: "e-gateway-order",
        source: "gateway",
        target: "order-service",
        protocol: "http",
        timeoutMs: 1500,
        retryPolicy: {
          count: 2,
          backoffMs: 100,
          methods: ["GET", "POST"],
        },
        visibility: "revealed",
        tags: ["checkout", "retries"],
      },
      {
        id: "e-order-payment",
        source: "order-service",
        target: "payment-provider",
        protocol: "http",
        timeoutMs: 2000,
        visibility: "silhouette",
        tags: ["payment", "ambiguous-timeout"],
      },
      {
        id: "e-order-db",
        source: "order-service",
        target: "orders-db",
        protocol: "sql",
        visibility: "revealed",
        tags: ["write", "storage"],
      },
      {
        id: "e-order-queue",
        source: "order-service",
        target: "events-queue",
        protocol: "event",
        semantics: "at-least-once",
        visibility: "silhouette",
        tags: ["messaging", "event"],
      },
      {
        id: "e-queue-worker",
        source: "events-queue",
        target: "fulfillment-worker",
        protocol: "event",
        semantics: "at-least-once",
        visibility: "silhouette",
        tags: ["messaging", "event"],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // §4.5 — what the player sees at the start
  // -------------------------------------------------------------------------
  initialVisibility: {
    revealedNodeIds: ["browser", "gateway", "order-service", "orders-db"],
    revealedEdgeIds: ["e-browser-gateway", "e-gateway-order", "e-order-db"],
  },

  // -------------------------------------------------------------------------
  // §4.7 — evidence (free + paid + red herrings)
  // -------------------------------------------------------------------------
  evidence: [
    // --- Free evidence ---
    {
      id: "ev_incident_summary",
      title: "Incident summary",
      category: "memo",
      cost: 0,
      initiallyUnlocked: true,
      reliability: "confirmed",
      preview:
        "Timeline, customer impact, and high-level metrics for the midnight incident.",
      content: {
        category: "memo",
        body: "INCIDENT SUMMARY — 2025-07-23\n\nWindow: 23:55 – 00:20 (flash sale)\n\nTimeline:\n  23:55  Sale begins. Checkout traffic rises sharply.\n  00:02  p95 latency crosses 1.5 s (gateway timeout).\n  00:05  First duplicate-charge ticket opened.\n  00:20  Sale ends; duplicate rate normalizes.\n\nCustomer impact:\n  - 1.8% of orders duplicated.\n  - Duplicate charges reported on affected orders.\n  - Fewer duplicate shipments than duplicate orders.\n\nNote: order-service and database CPU never saturated.",
      },
      reveals: [],
      tags: ["free", "overview"],
      debriefExplanation:
        "The summary frames the incident. The key clues are the gap between duplicate orders and duplicate shipments, and the fact that CPU never saturated.",
    },
    {
      id: "ev_partial_arch",
      title: "Current partial architecture diagram",
      category: "diagram",
      cost: 0,
      initiallyUnlocked: true,
      reliability: "confirmed",
      preview: "The architecture as the previous team documented it.",
      content: {
        category: "diagram",
        ascii:
          "Browser -> API Gateway -> Order Service -> Orders Database\n\n" +
          "  [?]           [?]          [?]            [?]\n" +
          "  external     unknown      unknown        unknown\n" +
          "  dependency   component    component      component",
      },
      reveals: [],
      tags: ["free", "diagram"],
      debriefExplanation:
        "The diagram is deliberately incomplete. Four nodes are unknown — their roles are revealed by purchasing evidence.",
    },
    {
      id: "ev_complaint_sample",
      title: "Customer complaint sample",
      category: "memo",
      cost: 0,
      initiallyUnlocked: true,
      reliability: "reported",
      preview:
        '"Checkout showed an error, so I clicked again. Now I see two charges."',
      content: {
        category: "memo",
        body: "CUSTOMER COMPLAINT (verbatim)\n\n\"Checkout spun for a long time, then showed an error. I assumed it\n failed, so I clicked 'Place Order' again. A few minutes later I got\n TWO order confirmations and my card was charged twice.\"\n\n— Ticket #4821, 00:07",
      },
      reveals: [],
      tags: ["free", "qualitative"],
      debriefExplanation:
        "The customer's own words describe the mechanism: a timeout followed by a retry that created a second operation. This is the human signal of a non-idempotent retry.",
    },

    // --- Paid evidence (costs investigation points) ---
    {
      id: "ev_gateway_retry_config",
      title: "Gateway retry configuration",
      category: "config",
      cost: 1,
      initiallyUnlocked: false,
      reliability: "confirmed",
      preview: "Timeout and retry policy for POST /orders at the gateway.",
      content: {
        category: "config",
        snippet:
          "# API Gateway — /orders route\n" +
          "timeout_ms: 1500\n" +
          "retry_count: 2\n" +
          "retry_backoff_ms: 100\n" +
          "retry_methods: [GET, POST]   # <-- POST retried automatically\n" +
          "require_idempotency_key_for_unsafe_retries: false",
        language: "yaml",
      },
      reveals: [
        { type: "reveal-config", nodeId: "gateway", configKey: "retryPolicy" },
      ],
      tags: ["gateway", "retries", "paid"],
      debriefExplanation:
        "The gateway retries timed-out POST /orders up to two times automatically. Because POST is not safe and the order service has no idempotency, each retry can create a fresh order and charge.",
    },
    {
      id: "ev_dup_order_trace",
      title: "Distributed trace — one duplicate order",
      category: "trace",
      cost: 2,
      initiallyUnlocked: false,
      reliability: "confirmed",
      preview:
        "Three order-service requests tied to one checkout session.",
      content: {
        category: "trace",
        spans: [
          { name: "gateway POST /orders (attempt 1)", durationMs: 1520, note: "timed out at gateway" },
          { name: "order-service create (attempt 1)", durationMs: 2100, note: "payment completed late" },
          { name: "gateway POST /orders (retry 1)", durationMs: 1480, note: "timed out again" },
          { name: "order-service create (retry 1)", durationMs: 1800, note: "second charge + second order" },
          { name: "gateway POST /orders (retry 2)", durationMs: 1450, note: "client had already clicked again" },
          { name: "order-service create (retry 2)", durationMs: 1600, note: "third order in some cases" },
        ],
      },
      reveals: [
        { type: "reveal-node", nodeId: "payment-provider" },
        { type: "reveal-edge", edgeId: "e-order-payment" },
      ],
      tags: ["trace", "duplicate", "paid"],
      debriefExplanation:
        "The trace shows one logical checkout producing multiple order-service creates. The gateway retried automatically after each timeout, and each retry ran a fresh, non-idempotent operation.",
    },
    {
      id: "ev_payment_log",
      title: "Payment-provider event log",
      category: "log",
      cost: 2,
      initiallyUnlocked: false,
      reliability: "confirmed",
      preview:
        "Shows the original payment succeeded — after the gateway had timed out.",
      content: {
        category: "log",
        lines: [
          { ts: "00:02:14.110", level: "info", msg: "charge request received (checkout_session=abc-51)" },
          { ts: "00:02:15.500", level: "warn", msg: "processing slower than usual (peak)" },
          { ts: "00:02:16.020", level: "info", msg: "caller timed out (gateway 1500ms)" },
          { ts: "00:02:16.380", level: "info", msg: "charge COMPLETED after caller gave up" },
          { ts: "00:02:16.610", level: "warn", msg: "duplicate charge request received (gateway retry)" },
          { ts: "00:02:18.990", level: "error", msg: "second charge COMPLETED — no idempotency key" },
        ],
      },
      reveals: [],
      tags: ["payment", "ambiguous-timeout", "paid"],
      debriefExplanation:
        "This is the smoking gun for payment-provider timeout ambiguity: the charge completed after the gateway's timeout, so a retry charges the customer again. It explains duplicate charges specifically.",
    },
    {
      id: "ev_orders_schema",
      title: "Orders table schema",
      category: "schema",
      cost: 1,
      initiallyUnlocked: false,
      reliability: "confirmed",
      preview: "The orders table — note the absence of a uniqueness constraint.",
      content: {
        category: "schema",
        tables: [
          {
            name: "orders",
            columns: [
              { name: "id", type: "uuid", constraint: "PRIMARY KEY" },
              { name: "customer_id", type: "uuid" },
              { name: "cart_fingerprint", type: "text" },
              { name: "checkout_session_id", type: "text" },
              { name: "amount_cents", type: "integer" },
              { name: "created_at", type: "timestamptz" },
              {
                name: "(no unique constraint)",
                type: "—",
                constraint: "duplicate inserts NOT blocked",
              },
            ],
          },
        ],
      },
      reveals: [
        { type: "reveal-config", nodeId: "orders-db", configKey: "uniqueConstraints" },
      ],
      tags: ["database", "integrity", "paid"],
      debriefExplanation:
        "There is no unique constraint on checkout_session_id. Nothing in the database prevents two order rows for the same checkout attempt. Adding one is a strong safety layer.",
    },
    {
      id: "ev_service_cpu",
      title: "Order-service CPU & saturation dashboard",
      category: "metric",
      cost: 1,
      initiallyUnlocked: false,
      reliability: "confirmed",
      preview: "Confirms the service was not compute-bound during the incident.",
      content: {
        category: "metric",
        series: [
          { label: "Peak CPU utilization", value: "54%", tone: "healthy" },
          { label: "Peak RPS handled", value: "150/s", tone: "info" },
          { label: "Effective capacity (3 replicas)", value: "240/s", tone: "healthy" },
          { label: "Utilization at peak", value: "62%", tone: "healthy" },
        ],
      },
      reveals: [],
      tags: ["capacity", "red-herring-adjacent", "paid"],
      debriefExplanation:
        "The service had ample headroom. Adding replicas would lower utilization further but would do nothing about duplicate semantics — duplicates come from retries, not CPU saturation.",
    },
    {
      id: "ev_queue_contract",
      title: "Queue delivery contract",
      category: "config",
      cost: 1,
      initiallyUnlocked: false,
      reliability: "confirmed",
      preview: "Order events are delivered at-least-once.",
      content: {
        category: "config",
        snippet:
          "# Order Events Queue\n" +
          "delivery_semantics: at-least-once\n" +
          "redelivery_probability: 0.02\n" +
          "# consumers MUST be idempotent",
        language: "yaml",
      },
      reveals: [
        { type: "reveal-node", nodeId: "events-queue" },
        { type: "reveal-edge", edgeId: "e-order-queue" },
      ],
      tags: ["queue", "messaging", "paid"],
      debriefExplanation:
        "At-least-once delivery means events can repeat. This is a real property of the system, but it does not cause duplicate charges — the worker dedups by orderId. It is a tempting but incorrect primary hypothesis.",
    },
    {
      id: "ev_fulfillment_note",
      title: "Fulfillment worker implementation note",
      category: "memo",
      cost: 1,
      initiallyUnlocked: false,
      reliability: "confirmed",
      preview: "Fulfillment deduplicates by orderId.",
      content: {
        category: "memo",
        body:
          "IMPLEMENTATION NOTE — fulfillment-worker\n\n" +
          "The worker keeps a 24h seen-set keyed by orderId. On redelivery,\n" +
          "it skips shipping for any orderId already processed.\n\n" +
          "Effect: duplicate order EVENTS do not become duplicate SHIPMENTS,\n" +
          "even though the queue delivers at-least-once.",
      },
      reveals: [
        { type: "reveal-node", nodeId: "fulfillment-worker" },
        { type: "reveal-edge", edgeId: "e-queue-worker" },
      ],
      tags: ["fulfillment", "idempotent", "paid"],
      debriefExplanation:
        "This explains the symptom gap: duplicate orders > duplicate shipments. Fulfillment is already idempotent, so the queue is not the source of duplicate charges.",
    },

    // --- Red herrings (plausible but non-causal) ---
    {
      id: "ev_cdn_dashboard",
      title: "CDN cache dashboard",
      category: "metric",
      cost: 1,
      initiallyUnlocked: false,
      reliability: "confirmed",
      preview: "Cache hit-rate and origin requests during the sale.",
      content: {
        category: "metric",
        series: [
          { label: "Static-asset hit rate", value: "98.4%", tone: "healthy" },
          { label: "Origin requests (checkout)", value: "0", tone: "info" },
          { label: "Cache header on POST /orders", value: "no-store", tone: "info" },
        ],
      },
      reveals: [{ type: "reveal-node", nodeId: "cdn" }],
      tags: ["cdn", "red-herring", "paid"],
      isRedHerring: true,
      debriefExplanation:
        "Red herring. Checkout POST requests are not cacheable (no-store), so the CDN cannot replay them. Investigating it cost a point but ruled out an edge-cache cause.",
    },
    {
      id: "ev_replica_lag",
      title: "Database read-replica lag",
      category: "metric",
      cost: 1,
      initiallyUnlocked: false,
      reliability: "confirmed",
      preview: "Mild replication lag observed during the peak.",
      content: {
        category: "metric",
        series: [
          { label: "Peak replica lag", value: "420 ms", tone: "warning" },
          { label: "Reads served by replica", value: "12%", tone: "info" },
          { label: "Writes affected by lag", value: "0", tone: "info" },
        ],
      },
      reveals: [],
      tags: ["database", "red-herring", "paid"],
      isRedHerring: true,
      debriefExplanation:
        "Red herring. Replica lag affects reads, not writes. Duplicate orders are duplicate writes, so lag cannot explain them. Mild lag is normal under load.",
    },
  ],

  // -------------------------------------------------------------------------
  // §4.9 — hypotheses (correct primary = gateway retries)
  // -------------------------------------------------------------------------
  hypotheses: [
    {
      id: "hyp_overload",
      label: "Order-service replicas are overloaded.",
      role: "primary",
      isCorrect: false,
      reasonCodes: ["SERVICE_NOT_CAPACITY_BOUND"],
      supportingEvidenceIds: ["ev_service_cpu"],
      debriefExplanation:
        "Incorrect. The service peaked at ~62% utilization with three replicas. Overload would raise errors and latency, but it cannot create semantically duplicate orders.",
    },
    {
      id: "hyp_db_contention",
      label: "Database write contention is duplicating rows.",
      role: "primary",
      isCorrect: false,
      reasonCodes: ["DATABASE_NOT_CAPACITY_BOUND"],
      supportingEvidenceIds: [],
      debriefExplanation:
        "Incorrect. Contention slows writes; it does not fabricate duplicate rows. The database had write headroom and no unique constraint — the missing constraint allows duplicates, but contention doesn't cause them.",
    },
    {
      id: "hyp_gateway_retry",
      label: "Gateway retries are repeating a non-idempotent operation.",
      role: "primary",
      isCorrect: true,
      reasonCodes: [
        "UNSAFE_POST_RETRY",
        "MISSING_IDEMPOTENCY_KEY",
        "PAYMENT_COMPLETED_AFTER_TIMEOUT",
      ],
      supportingEvidenceIds: [
        "ev_gateway_retry_config",
        "ev_dup_order_trace",
        "ev_payment_log",
      ],
      debriefExplanation:
        "Correct. The gateway automatically retries timed-out POST /orders. Because the order service is not idempotent, each retry creates a new order and charge. The payment provider completing after the timeout makes it worse.",
    },
    {
      id: "hyp_queue_redelivery",
      label: "Queue redelivery is creating duplicate charges.",
      role: "primary",
      isCorrect: false,
      reasonCodes: ["QUEUE_REDELIVERY_DEDUPED_BY_WORKER"],
      supportingEvidenceIds: ["ev_queue_contract", "ev_fulfillment_note"],
      debriefExplanation:
        "Incorrect. The queue does redeliver (at-least-once), but it carries order events, not charges. The fulfillment worker dedups by orderId, which is why duplicate shipments are rarer than duplicate orders.",
    },
    {
      id: "hyp_cdn_cache",
      label: "CDN cache corruption is replaying requests.",
      role: "primary",
      isCorrect: false,
      reasonCodes: [],
      supportingEvidenceIds: ["ev_cdn_dashboard"],
      debriefExplanation:
        "Incorrect. Checkout requests carry a no-store header and are never cached. The CDN cannot replay a POST.",
    },
    // Contributing factors
    {
      id: "contrib_missing_idem",
      label: "Missing idempotency key.",
      role: "contributing",
      isCorrect: true,
      reasonCodes: ["MISSING_IDEMPOTENCY_KEY"],
      supportingEvidenceIds: ["ev_gateway_retry_config", "ev_orders_schema"],
      debriefExplanation:
        "Correct contributing factor. Without an idempotency key, retries cannot be collapsed into a single operation.",
    },
    {
      id: "contrib_missing_uc",
      label: "Missing database uniqueness constraint.",
      role: "contributing",
      isCorrect: true,
      reasonCodes: ["UNIQUE_CONSTRAINT_BLOCKED_DUPLICATE"],
      supportingEvidenceIds: ["ev_orders_schema"],
      debriefExplanation:
        "Correct contributing factor. A unique constraint on checkout_session_id would have blocked the duplicate insert even without idempotency.",
    },
    {
      id: "contrib_payment_ambiguity",
      label: "Payment-provider timeout ambiguity.",
      role: "contributing",
      isCorrect: true,
      reasonCodes: ["PAYMENT_COMPLETED_AFTER_TIMEOUT"],
      supportingEvidenceIds: ["ev_payment_log"],
      debriefExplanation:
        "Correct contributing factor. The provider completes charges after the caller times out, so a timeout does not mean the charge failed.",
    },
    {
      id: "contrib_at_least_once",
      label: "At-least-once queue delivery.",
      role: "contributing",
      isCorrect: false,
      reasonCodes: ["QUEUE_REDELIVERY_DEDUPED_BY_WORKER"],
      supportingEvidenceIds: ["ev_queue_contract"],
      debriefExplanation:
        "A real property, but not a contributing factor to duplicate charges. The worker is idempotent.",
    },
    {
      id: "contrib_manual_retry",
      label: "Manual customer retry.",
      role: "contributing",
      isCorrect: true,
      reasonCodes: ["MANUAL_RETRY_CREATED_NEW_OPERATION"],
      supportingEvidenceIds: ["ev_complaint_sample"],
      debriefExplanation:
        "Correct contributing factor. ~35% of customers retry after a visible error. Without a stable checkout identity, a manual retry looks like a brand-new operation and can also duplicate.",
    },
  ],

  // -------------------------------------------------------------------------
  // §4.10 — design actions (catalogue constrained for the tutorial)
  // -------------------------------------------------------------------------
  availableActions: [
    {
      id: "action_idempotency_support",
      title: "Add idempotency-key support to Order Service",
      category: "reliability",
      description:
        "Order Service stores the first terminal result keyed by checkout attempt id and replays it on retries instead of creating a new order.",
      cost: 3,
      operationalRisk: "medium",
      reversible: true,
      targetRules: [{ type: "by-id", nodeIds: ["order-service"] }],
      prerequisites: [{ kind: "action", id: "action_client_checkout_id" }],
      effects: [
        {
          type: "set-config",
          nodeId: "order-service",
          path: ["supportsIdempotency"],
          value: true,
        },
        {
          type: "set-config",
          nodeId: "order-service",
          path: ["idempotencyKeySource"],
          value: "header",
        },
        {
          type: "set-config",
          nodeId: "order-service",
          path: ["replayStoredResponse"],
          value: true,
        },
      ],
      explanation:
        "Requires key storage and response replay, but collapses repeated checkout attempts into one operation.",
    },
    {
      id: "action_unique_constraint",
      title: "Add unique constraint on checkout attempt ID",
      category: "integrity",
      description:
        "Adds a UNIQUE constraint on orders(checkout_session_id) so duplicate inserts fail and are mapped to the existing order.",
      cost: 2,
      operationalRisk: "medium",
      reversible: true,
      targetRules: [{ type: "by-id", nodeIds: ["orders-db"] }],
      prerequisites: [{ kind: "action", id: "action_client_checkout_id" }],
      effects: [
        {
          type: "add-unique-constraint",
          nodeId: "orders-db",
          constraint: {
            id: "uc_checkout_session",
            fields: ["checkout_session_id"],
            enabled: true,
          },
        },
      ],
      explanation:
        "Requires a schema migration and conflict handling, but blocks duplicate rows as a final safety layer.",
    },
    {
      id: "action_disable_retries",
      title: "Disable all gateway retries",
      category: "traffic",
      description:
        "Sets gateway retry_count to 0 so timed-out requests are never automatically replayed.",
      cost: 1,
      operationalRisk: "medium",
      reversible: true,
      targetRules: [{ type: "by-id", nodeIds: ["gateway"] }],
      prerequisites: [],
      effects: [
        {
          type: "set-config",
          nodeId: "gateway",
          path: ["retryCount"],
          value: 0,
        },
      ],
      explanation:
        "Reduces automatic duplicates, but increases visible transient failures — customers must retry safely themselves.",
    },
    {
      id: "action_safe_method_retries",
      title: "Retry only safe HTTP methods automatically",
      category: "traffic",
      description:
        "Restricts gateway automatic retries to GET (safe) only, stopping automatic POST replay.",
      cost: 1,
      operationalRisk: "low",
      reversible: true,
      targetRules: [{ type: "by-id", nodeIds: ["gateway"] }],
      prerequisites: [],
      effects: [
        {
          type: "set-config",
          nodeId: "gateway",
          path: ["retryMethods"],
          value: ["GET"],
        },
      ],
      explanation:
        "Stops automatic POST replay. Some requests fail unless clients retry safely.",
    },
    {
      id: "action_add_replicas",
      title: "Add 3 more Order Service replicas",
      category: "capacity",
      description: "Scales Order Service from 3 to 6 replicas.",
      cost: 3,
      operationalRisk: "low",
      reversible: true,
      targetRules: [{ type: "by-id", nodeIds: ["order-service"] }],
      prerequisites: [],
      effects: [
        {
          type: "set-config",
          nodeId: "order-service",
          path: ["replicas"],
          value: 6,
        },
      ],
      explanation:
        "Adds compute capacity and lowers utilization. Does not fix semantic duplication — duplicates come from retries, not CPU saturation.",
    },
    {
      id: "action_increase_db",
      title: "Increase database size",
      category: "capacity",
      description: "Doubles the database write capacity.",
      cost: 3,
      operationalRisk: "low",
      reversible: true,
      targetRules: [{ type: "by-id", nodeIds: ["orders-db"] }],
      prerequisites: [],
      effects: [
        {
          type: "set-config",
          nodeId: "orders-db",
          path: ["writeCapacityRps"],
          value: 600,
        },
      ],
      explanation:
        "Adds DB capacity. Does not fix semantic duplication — the DB was not the bottleneck.",
    },
    {
      id: "action_client_checkout_id",
      title: "Add client-generated checkout attempt ID",
      category: "integrity",
      description:
        "Browser generates a stable checkout_session_id per attempt, sent in a header so retries and manual re-clicks share an identity.",
      cost: 2,
      operationalRisk: "low",
      reversible: true,
      targetRules: [{ type: "by-id", nodeIds: ["browser"] }],
      prerequisites: [],
      effects: [
        {
          type: "set-config",
          nodeId: "browser",
          path: ["generatesStableCheckoutId"],
          value: true,
        },
      ],
      explanation:
        "Gives requests a stable identity. Requires client and server coordination, but is the foundation for idempotency and unique constraints.",
    },
    {
      id: "action_payment_reconciliation",
      title: "Add payment reconciliation worker",
      category: "reliability",
      description:
        "A worker reconciles ambiguous payment-provider timeouts: if a charge completed after a timeout, it maps the follow-up to the original charge.",
      cost: 3,
      operationalRisk: "medium",
      reversible: true,
      targetRules: [{ type: "by-id", nodeIds: ["payment-provider"] }],
      prerequisites: [],
      effects: [],
      explanation:
        "Repairs ambiguous payment state. Adds delay and operational complexity. Useful as a later hardening step.",
    },
    {
      id: "action_gateway_require_idem_key",
      title: "Require idempotency key for unsafe retries",
      category: "traffic",
      description:
        "Gateway retries POST only when an idempotency key is present, so retries are safe by construction.",
      cost: 1,
      operationalRisk: "low",
      reversible: true,
      targetRules: [{ type: "by-id", nodeIds: ["gateway"] }],
      prerequisites: [{ kind: "action", id: "action_client_checkout_id" }],
      effects: [
        {
          type: "set-config",
          nodeId: "gateway",
          path: ["requireIdempotencyKeyForUnsafeRetries"],
          value: true,
        },
      ],
      explanation:
        "Lets the gateway keep retrying, but only safely. Requires clients to send a stable id.",
    },
    {
      id: "action_add_queue",
      title: "Add a queue before Order Service",
      category: "messaging",
      description:
        "Introduces an inbound queue so checkout traffic is smoothed before reaching Order Service.",
      cost: 4,
      operationalRisk: "high",
      reversible: true,
      targetRules: [{ type: "by-id", nodeIds: ["order-service"] }],
      prerequisites: [],
      effects: [],
      explanation:
        "Smooths traffic and adds latency, but duplicate semantics remain unless identity is preserved. Adds complexity.",
    },
  ],

  // -------------------------------------------------------------------------
  // §10.4 — traffic scenario (60 virtual seconds)
  // -------------------------------------------------------------------------
  trafficScenario: {
    durationSeconds: 60,
    manualRetryProbability: 0.35,
    phases: [
      {
        phase: "warm-up",
        startSecond: 0,
        endSecond: 9,
        checkoutRps: 20,
        description: "Normal traffic.",
      },
      {
        phase: "sale",
        startSecond: 9,
        endSecond: 24,
        checkoutRps: 80,
        description: "Sharp rise as the flash sale begins.",
      },
      {
        phase: "peak",
        startSecond: 24,
        endSecond: 44,
        checkoutRps: 150,
        description: "Peak load — payment provider slows down.",
      },
      {
        phase: "recovery",
        startSecond: 44,
        endSecond: 60,
        checkoutRps: 60,
        description: "Traffic declines after the sale.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // §4.12 — objectives (minimum passing solution)
  // -------------------------------------------------------------------------
  objectives: [
    {
      id: "obj_dup_orders",
      label: "Duplicate-order rate",
      metric: "duplicateOrderRate",
      comparator: "<=",
      target: 0.0005,
      points: 90,
      description: "Below 0.05% of orders duplicated.",
    },
    {
      id: "obj_dup_charges",
      label: "Duplicate-charge rate",
      metric: "duplicateChargeRate",
      comparator: "<=",
      target: 0.0002,
      points: 90,
      description: "Below 0.02% of charges duplicated.",
    },
    {
      id: "obj_success",
      label: "Successful-checkout rate",
      metric: "successfulCheckoutRate",
      comparator: ">=",
      target: 0.97,
      points: 60,
      description: "At least 97% of checkouts succeed.",
    },
    {
      id: "obj_p95",
      label: "p95 checkout latency",
      metric: "p95LatencyMs",
      comparator: "<=",
      target: 3000,
      points: 60,
      description: "p95 checkout latency below 3.0 s.",
    },
  ],

  // -------------------------------------------------------------------------
  // §11.2 — scoring (1000-point breakdown)
  // -------------------------------------------------------------------------
  scoring: {
    maxScore: 1000,
    rootCauseAccuracyMax: 220,
    objectiveAchievementMax: 300,
    investigationEfficiencyMax: 120,
    changeBudgetEfficiencyMax: 120,
    complexityDisciplineMax: 80,
    reliabilityMarginMax: 80,
    tradeoffRecognitionMax: 50,
    firstRunBonus: 30,
    // Strong solutions that fit within budget=6:
    //   {client-id(2) + idempotency(3) + safe-method-retries(1)} = 6
    //   {client-id(2) + unique-constraint(2) + safe-method-retries(1)} = 5
    solutionFamilies: [
      ["action_client_checkout_id", "action_idempotency_support", "action_safe_method_retries"],
      ["action_client_checkout_id", "action_unique_constraint", "action_safe_method_retries"],
      ["action_client_checkout_id", "action_idempotency_support", "action_gateway_require_idem_key"],
    ],
  },

  // -------------------------------------------------------------------------
  // §4.11, §5.11 — debrief
  // -------------------------------------------------------------------------
  debrief: {
    correctRootCauseExplanation:
      "The duplicate orders were caused by the API gateway automatically retrying timed-out POST /orders requests against an order service that has no idempotency. Each retry ran a fresh, non-idempotent operation: a new order row and a new charge. The payment provider completing charges after the gateway's timeout meant a timeout did not mean 'no charge happened,' so the retry charged the customer again.",
    evidenceChain: [
      "Gateway retries POST on timeout (ev_gateway_retry_config).",
      "One checkout produced multiple order-service creates (ev_dup_order_trace).",
      "The charge completed after the gateway timed out (ev_payment_log).",
      "The orders table has no uniqueness constraint (ev_orders_schema).",
      "The service was not CPU-bound (ev_service_cpu).",
    ],
    whyChangesWorked: [
      "A client-generated checkout attempt id gives every retry and manual re-click the same stable identity.",
      "Idempotency support lets the order service return the stored first result instead of creating a second order and charge.",
      "A unique constraint on checkout_session_id blocks any duplicate insert that slips past idempotency.",
    ],
    whyAlternativesFailed: [
      {
        hypothesisId: "hyp_overload",
        explanation:
          "The service had ~38% headroom at peak. More replicas lower utilization but cannot stop a retry from creating a second order.",
      },
      {
        hypothesisId: "hyp_queue_redelivery",
        explanation:
          "The queue carries order events, not charges, and the worker dedups by orderId. That is why duplicate shipments were rarer than duplicate orders.",
      },
      {
        hypothesisId: "hyp_cdn_cache",
        explanation:
          "Checkout requests are served no-store, so the CDN cannot replay them.",
      },
    ],
    residualHardeningSteps: [
      "Add a payment reconciliation worker for ambiguous provider timeouts.",
      "Add structured idempotency-key TTL management and monitoring.",
      "Add an alert on duplicate-order rate and duplicate-charge rate.",
      "Backfill a checkout_session_id on historical rows before enforcing the constraint.",
    ],
    idealSolution: [
      {
        step: "Add a client-generated checkout attempt id (stable identity).",
        actionIds: ["action_client_checkout_id"],
      },
      {
        step: "Add order-service idempotency keyed by that id.",
        actionIds: ["action_idempotency_support"],
      },
      {
        step: "Add a unique DB constraint as a final safety layer.",
        actionIds: ["action_unique_constraint"],
      },
      {
        step: "Require an idempotency key before the gateway retries unsafe methods.",
        actionIds: ["action_gateway_require_idem_key"],
      },
      {
        step: "Optionally add payment reconciliation for ambiguous timeouts (later).",
        actionIds: ["action_payment_reconciliation"],
      },
    ],
  },

  contentMetadata: {
    author: "System Design Atlas",
    version: "1.0.0",
    createdAt: "2025-07-24",
  },
};
