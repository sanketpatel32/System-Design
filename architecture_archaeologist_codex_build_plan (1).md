# Architecture Archaeologist
## A build-ready specification for a single-player system-design investigation game

**Working title:** Architecture Archaeologist  
**Alternate title:** System Relic: Incident Zero  
**Document purpose:** Give this file to a coding agent and ask it to implement the game inside an existing web application.  
**Default technical assumption:** TypeScript + React. Next.js examples are included, but the domain model is framework-independent.  
**Implementation strategy:** Build one complete vertical slice first, then add content and polish.  
**MVP case:** “Ghost Orders at Midnight.”

---

# 0. Instructions for the coding agent

Read this entire document before changing code.

Do not begin by creating dozens of empty files. First inspect the repository, identify its framework, routing, state-management style, component library, authentication, persistence layer, testing tools, linting rules, and naming conventions. Then map the architecture in this document onto the existing conventions.

## 0.1 Non-negotiable implementation rules

1. Preserve the existing web application’s visual language, authentication flow, routing conventions, and deployment setup.
2. Add the game as an isolated feature. Do not refactor unrelated areas unless the game cannot be integrated safely without a small refactor.
3. Put all simulation logic in pure functions. UI components must not contain simulation formulas.
4. The same case definition and the same sequence of player actions must always produce the same simulation result.
5. Do not use random numbers without a seeded pseudo-random number generator.
6. Validate every case-definition file at load time. A malformed case must fail with a useful developer error, not a blank screen.
7. Do not hardcode the tutorial case into UI components. The UI must render from case data.
8. Keep the first release single-player and asynchronous. Do not add multiplayer, chat, leaderboards, or real-time networking.
9. The player must be able to lose, recover, retry, and understand why a choice failed.
10. Avoid fake complexity. The game should simulate system-design tradeoffs, not reproduce a real cloud provider.
11. Do not make the architecture editor a fully general diagramming product. Support only the actions required by the game.
12. Every interactive control must be keyboard accessible.
13. Add tests before adding a second mission.
14. Use feature flags or route-level isolation so the game can be disabled without affecting the rest of the web app.
15. Never silently discard a saved game after a schema change. Add save-version migrations.

## 0.2 Required first step: repository reconnaissance

Before implementation, create a short internal checklist containing:

- Application framework and version
- Package manager
- Route where the game will live
- Existing design system or component library
- Existing state-management pattern
- Existing API conventions
- Existing database or storage layer
- Existing authentication and user identifier
- Existing test runners
- Existing analytics or logging system
- Existing feature-flag system
- Mobile support expectations

Then choose one of these integration modes:

### Mode A: Frontend-only MVP

Use this when the product does not need secure rewards, shared progress, or cross-device saves yet.

- Case definitions ship with the frontend.
- Simulation runs in the browser.
- Saves use local storage or the app’s existing client persistence.
- No new backend is required.
- The simulation engine must still be written as a separate pure module so it can be moved server-side later.

### Mode B: Server-backed MVP

Use this when users are authenticated and progress must sync across devices.

- Case definitions can remain static.
- Session state is saved to the existing backend.
- Simulation may run on the server or be verified by the server.
- The client uses a repository interface rather than calling storage directly.

If the repository already has a clear preference, follow it. Otherwise implement Mode A first and create a clean persistence adapter boundary.

---

# 1. Product vision

## 1.1 One-sentence pitch

**Architecture Archaeologist is a single-player detective game in which the player inherits a mysterious failing software system, uncovers its hidden architecture from operational evidence, proposes changes, and runs deterministic simulations to see whether those changes fix the incident or create new failures.**

## 1.2 Core fantasy

The player is not answering a system-design interview question on a blank whiteboard. The player is entering an existing, imperfect, partially undocumented system under pressure.

The fantasy is:

> “I can understand a complex system from evidence, find the actual failure mechanism, and improve it without causing a worse incident.”

## 1.3 Why this feels different from common system-design games

Most system-design exercises begin with a clean prompt such as “Design Twitter.” This game begins with symptoms, incomplete information, misleading clues, legacy constraints, and consequences.

The player must:

- Infer architecture rather than receive the complete diagram.
- Decide what evidence is worth collecting.
- Distinguish root causes from correlated symptoms.
- Modify a living system instead of drawing a greenfield design.
- Balance reliability, latency, cost, complexity, and delivery risk.
- Explain the reasoning behind a fix.
- Observe second-order effects after a change.

## 1.4 Target player

Primary audience:

- Junior-to-mid-level software engineers learning system design
- Senior engineers who enjoy incident-analysis puzzles
- Interview candidates who want practical reasoning exercises
- Engineering teams using the game for training

The MVP should assume basic familiarity with HTTP requests, APIs, databases, caches, queues, retries, and horizontal scaling. It should teach advanced concepts through play rather than requiring them up front.

## 1.5 Desired emotional arc

Each case should create this sequence:

1. **Confusion:** “Something is clearly wrong, but I do not know where.”
2. **Curiosity:** “This log or metric does not match my initial assumption.”
3. **Hypothesis:** “I think I understand the failure mechanism.”
4. **Commitment:** “I will change the architecture and test it.”
5. **Consequence:** “The simulation shows what my decision caused.”
6. **Insight:** “Now I understand the design principle and the tradeoff.”
7. **Mastery:** “I can solve the case with fewer probes, less cost, and a cleaner design.”

---

# 2. Scope

## 2.1 MVP scope

The first release must contain:

- One complete case: **Ghost Orders at Midnight**
- A briefing screen
- An evidence locker
- A partially hidden architecture map
- A limited architecture-editing tool
- A hypothesis submission step
- A deterministic simulation engine
- A simulation timeline with metrics and incident events
- A score and debrief screen
- Retry and reset controls
- Local progress persistence
- Basic analytics events
- Unit, integration, and end-to-end tests
- Responsive desktop and tablet layouts
- A simple mobile fallback layout

## 2.2 Explicit non-goals for MVP

Do not add these before the first case is complete and tested:

- Multiplayer
- User-generated cases
- Public leaderboards
- Real-time collaboration
- Free-form code execution
- Cloud-provider-specific billing calculators
- A general-purpose diagramming canvas
- AI-generated explanations as a dependency
- Voice input
- Live production integrations
- Competitive timed mode
- More than one playable case

## 2.3 Post-MVP expansion

After the first case proves the loop, add cases involving:

1. Cache stampedes
2. Hot partitions
3. Queue poison messages
4. Regional failover
5. Fan-out overload
6. Search-index staleness
7. Data-consistency tradeoffs
8. Rate limiting and abuse
9. Schema migration failures
10. Observability blind spots

---

# 3. Game structure

## 3.1 Core gameplay loop

Every case uses the same loop:

1. **Receive the incident briefing**
2. **Inspect symptoms and evidence**
3. **Spend investigation resources to reveal more information**
4. **Construct a root-cause hypothesis**
5. **Modify the architecture or operational policy**
6. **Run a simulation**
7. **Inspect the outcome**
8. **Accept the fix, revise it, or roll back**
9. **Complete the case and receive a debrief**

## 3.2 The player’s resources

The player has three constrained resources:

### Investigation points

Spent on actions such as:

- Querying logs
- Opening a trace
- Running a load test
- Interviewing an engineer
- Inspecting a schema
- Revealing hidden architecture metadata

Purpose: prevent the player from opening every clue immediately and encourage information prioritization.

### Change budget

Spent on architecture modifications.

Examples:

- Add an idempotency store
- Add a unique database constraint
- Change retry policy
- Add a queue
- Increase replica count
- Add a cache

Purpose: force tradeoffs and prevent “add everything” solutions.

### Incident tolerance

A case-specific limit representing how many failed simulations or how much customer impact is acceptable.

Purpose: give failed experiments consequences without permanently blocking learning.

For the tutorial case, failed simulations should reduce score but never lock the player out. The player can always continue.

## 3.3 Turn structure

A case is not strictly turn-based, but actions are recorded as an ordered command log.

Each meaningful action creates a `GameCommand`:

- `INSPECT_EVIDENCE`
- `RUN_PROBE`
- `REVEAL_COMPONENT`
- `ADD_COMPONENT`
- `REMOVE_COMPONENT`
- `UPDATE_COMPONENT_CONFIG`
- `ADD_CONNECTION`
- `REMOVE_CONNECTION`
- `SUBMIT_HYPOTHESIS`
- `RUN_SIMULATION`
- `ACCEPT_SOLUTION`
- `ROLLBACK_TO_SNAPSHOT`

The command log enables:

- Deterministic replay
- Undo or rollback
- Debugging
- Save restoration
- Analytics
- Future replay sharing

## 3.4 Case state machine

Use an explicit state machine. Do not manage case flow through scattered booleans.

```text
LOADING
  -> BRIEFING
  -> INVESTIGATION
  -> HYPOTHESIS_READY
  -> DESIGN
  -> SIMULATING
  -> OUTCOME_REVIEW
      -> INVESTIGATION
      -> DESIGN
      -> CASE_RESOLVED
      -> CASE_FAILED
  -> DEBRIEF
```

Recommended transitions:

| Current state | Event | Next state | Notes |
|---|---|---|---|
| `LOADING` | `CASE_LOADED` | `BRIEFING` | Case validated before transition |
| `BRIEFING` | `START_CASE` | `INVESTIGATION` | Initialize resource budgets |
| `INVESTIGATION` | `CAN_FORM_HYPOTHESIS` | `HYPOTHESIS_READY` | UI may still allow more investigation |
| `HYPOTHESIS_READY` | `SUBMIT_HYPOTHESIS` | `DESIGN` | Store selected root cause and reasoning |
| `DESIGN` | `RUN_SIMULATION` | `SIMULATING` | Snapshot the proposed architecture |
| `SIMULATING` | `SIMULATION_COMPLETE` | `OUTCOME_REVIEW` | Store deterministic report |
| `OUTCOME_REVIEW` | `REVISE` | `DESIGN` | Keep evidence and previous report |
| `OUTCOME_REVIEW` | `INVESTIGATE_MORE` | `INVESTIGATION` | Spend remaining investigation points |
| `OUTCOME_REVIEW` | `ACCEPT_SOLUTION` | `CASE_RESOLVED` | Only when minimum objectives pass |
| `CASE_RESOLVED` | `SHOW_DEBRIEF` | `DEBRIEF` | Calculate score once |

A case should not enter `CASE_FAILED` in the tutorial. Later cases may fail when incident tolerance reaches zero, but always permit restarting.

---

# 4. The first playable case

## 4.1 Case title

**Ghost Orders at Midnight**

## 4.2 Narrative setup

The player has joined an e-commerce company as the new reliability lead. During a late-night flash sale, some customers received duplicate orders and duplicate charges. The previous team left behind incomplete diagrams and conflicting explanations.

The CEO wants the issue fixed before tomorrow’s larger sale. The player has limited time, a strict change budget, and no permission to rewrite the entire platform.

## 4.3 Learning goals

The case should teach:

- Network timeouts do not prove that an operation failed.
- Automatic retries can duplicate non-idempotent operations.
- Idempotency should be enforced close to the operation boundary.
- Database uniqueness can provide a second safety layer.
- Horizontal scaling does not solve semantic duplication.
- A queue can move a problem without solving it.
- Every fix introduces cost and complexity.

## 4.4 Initial hidden architecture

The actual system is:

```text
Browser
  -> CDN
  -> API Gateway
  -> Order Service (3 replicas)
  -> Payment Provider
  -> Orders Database
  -> Order Events Queue
  -> Fulfillment Worker
```

Important hidden configuration:

- The API gateway retries timed-out `POST /orders` requests up to two times.
- The order service has no idempotency-key handling.
- The payment provider sometimes completes a charge after the client timeout.
- The orders table has no uniqueness constraint for a checkout attempt.
- Order events are delivered at least once.
- The fulfillment worker is idempotent, so shipping is usually not duplicated even when order events repeat.

## 4.5 Initial architecture visible to the player

At case start, reveal:

```text
Browser -> API Gateway -> Order Service -> Orders Database
```

Show blurred or unknown nodes for:

- Payment Provider
- Event Queue
- Fulfillment Worker

Unknown nodes should be represented as intentional silhouettes with labels such as `Unknown external dependency` rather than missing UI.

## 4.6 Initial symptoms

The briefing shows:

- 1.8% of orders were duplicated between 23:55 and 00:20.
- API p95 latency rose from 420 ms to 2.6 s.
- Order-service CPU stayed below 55%.
- Database CPU stayed below 48%.
- Customer support reports duplicate charges.
- Fulfillment reports fewer duplicate shipments than duplicate orders.

## 4.7 Evidence items

Evidence is divided into categories. Some items are free; others cost investigation points.

### Free evidence

1. **Incident summary**
   - Timeline
   - Customer impact
   - High-level metrics

2. **Current partial architecture diagram**

3. **Customer complaint sample**
   - “Checkout showed an error, so I clicked again. Now I see two charges.”

### Paid evidence

1. **Gateway retry configuration** — cost 1
   - Reveals timeout and retry policy.

2. **Distributed trace for one duplicate order** — cost 2
   - Shows three order-service requests tied to one checkout session.

3. **Payment-provider event log** — cost 2
   - Shows the original payment succeeded after the gateway timed out.

4. **Orders schema** — cost 1
   - Reveals absence of a uniqueness constraint.

5. **Order-service CPU and saturation dashboard** — cost 1
   - Confirms the service was not compute-bound.

6. **Queue delivery contract** — cost 1
   - Reveals at-least-once delivery.

7. **Fulfillment worker implementation note** — cost 1
   - Reveals deduplication by order ID.

### Red-herring evidence

1. **CDN cache dashboard**
   - Not relevant because checkout requests are not cached.

2. **Database read-replica lag**
   - Mild lag exists but does not explain duplicate inserts.

3. **Order-service memory graph**
   - Looks noisy but stays within healthy limits.

Red herrings must be plausible, not absurd. The debrief should explain why they were not causal.

## 4.8 Investigation budget

For the tutorial:

- Start with 7 investigation points.
- The most efficient solution should require 4 or 5 points.
- The player can spend all 7 and still complete the case.

## 4.9 Available hypotheses

The player chooses one primary hypothesis and may choose one contributing factor.

Primary hypotheses:

1. Order-service replicas are overloaded.
2. Database write contention is duplicating rows.
3. Gateway retries are repeating a non-idempotent operation.
4. Queue redelivery is creating duplicate charges.
5. CDN cache corruption is replaying requests.

Contributing factors:

- Missing idempotency key
- Missing database uniqueness constraint
- Payment-provider timeout ambiguity
- At-least-once queue delivery
- Manual customer retry

Correct primary hypothesis:

- Gateway retries are repeating a non-idempotent operation.

Best contributing factors:

- Missing idempotency key
- Missing database uniqueness constraint
- Payment-provider timeout ambiguity

## 4.10 Available design actions

The tutorial must constrain the action catalogue so the player learns decisions instead of browsing a huge toolbox.

| Action | Cost | Expected effect | Tradeoff |
|---|---:|---|---|
| Add idempotency-key support to Order Service | 3 | Prevents repeated checkout requests from creating new orders | Requires key storage and response replay |
| Add unique constraint on checkout attempt ID | 2 | Blocks duplicate order rows | Requires schema migration and conflict handling |
| Disable all gateway retries | 1 | Reduces automatic duplicates | Increases visible transient failures |
| Retry only safe HTTP methods automatically | 1 | Stops automatic `POST` replay | Some requests fail unless clients retry safely |
| Add 3 more Order Service replicas | 3 | Adds compute capacity | Does not fix semantic duplication |
| Increase database size | 3 | Adds DB capacity | Does not fix semantic duplication |
| Add a queue before Order Service | 4 | Smooths traffic | Adds latency and may still duplicate messages |
| Add client-generated checkout attempt ID | 2 | Gives requests a stable identity | Requires client and server coordination |
| Add payment reconciliation worker | 3 | Repairs ambiguous payment state | Adds delay and operational complexity |
| Add a short-lived distributed lock | 4 | Can reduce concurrent duplicates | Lock contention and failure handling |

## 4.11 Intended high-quality solution

A strong solution is:

1. Add a client-generated checkout attempt ID.
2. Add order-service idempotency handling keyed by checkout attempt ID.
3. Add a unique database constraint as a final safety layer.
4. Configure gateway retries to avoid blindly retrying unsafe operations unless an idempotency key is present.
5. Preserve payment reconciliation for ambiguous provider timeouts as an optional later improvement.

The MVP action budget may make the player choose the two most important changes rather than all five.

## 4.12 Minimum passing solution

A simulation passes if:

- Duplicate-order rate is below 0.05%.
- Duplicate-charge rate is below 0.02%.
- Successful-checkout rate remains above 97%.
- p95 checkout latency remains below 3.0 s.
- Change cost does not exceed the case budget.

A solution may pass with one weakness, but the debrief should explain the residual risk.

---

# 5. Screen and interaction design

## 5.1 Overall desktop layout

Use a three-panel game workspace.

```text
+---------------------------------------------------------------+
| Header: Case | Phase | Investigation | Budget | Run Simulation |
+----------------------+------------------------+---------------+
| Evidence Locker      | Architecture Map       | Ops Console   |
|                      |                        |               |
| Clues and documents  | Nodes, edges, unknown | Metrics, logs |
|                      | components, edits     | hypotheses    |
+----------------------+------------------------+---------------+
| Action Tray / Context Inspector / Timeline                    |
+---------------------------------------------------------------+
```

Recommended proportions:

- Evidence Locker: 24%
- Architecture Map: 50%
- Ops Console: 26%

Panels may be resizable on large screens but must have sensible default widths.

## 5.2 Header

Display:

- Case title
- Current phase
- Investigation points remaining
- Change budget remaining
- Number of simulation attempts
- Save status
- Pause/menu button
- Primary context action

Primary context action changes by state:

- `Start Investigation`
- `Submit Hypothesis`
- `Run Simulation`
- `Review Outcome`
- `Complete Case`

## 5.3 Briefing screen

Include:

- Narrative setup
- Customer impact
- Objectives
- Constraints
- Known architecture
- Learning mode label
- “Start Investigation” button

Do not put a wall of text on one screen. Use progressive disclosure and visual summaries.

## 5.4 Evidence Locker

Evidence cards show:

- Title
- Category icon
- Cost
- Locked/unlocked state
- Reliability level: confirmed, reported, inferred
- One-sentence preview
- Whether the item is new

Opening evidence shows a structured viewer appropriate to the item type:

- Log lines
- Metric chart
- Trace waterfall
- Text memo
- Configuration snippet
- Schema viewer
- Architecture fragment

Every evidence item must contain:

- A clear observation
- Optional interpretation hints
- Source reliability
- Tags used by the game engine
- A short educational annotation revealed only in debrief mode

## 5.5 Architecture Map

Do not implement unrestricted drag-and-drop diagramming in MVP.

Supported interactions:

- Select a node
- Inspect a node’s revealed properties
- Reveal a hidden node through evidence
- Add an allowed component from the action tray
- Update a limited configuration form
- Connect only valid source and target node types
- Remove player-added nodes
- Compare current design to baseline
- Highlight changed nodes
- Show data-flow animation during simulation

Recommended graph library choices, in order:

1. Use the graph library already present in the repository.
2. Otherwise use React Flow if the app is React-based.
3. Otherwise implement a simple SVG layout for the fixed tutorial topology.

Do not add a heavy graph dependency if the tutorial can be built with a fixed layout and small interaction layer.

## 5.6 Node visual states

Each node can be:

- `hidden`
- `silhouette`
- `revealed`
- `selected`
- `changed`
- `healthy`
- `warning`
- `critical`
- `disabled`

Use shape or icon plus text, not color alone.

## 5.7 Ops Console

Tabs:

1. **Symptoms**
2. **Metrics**
3. **Logs**
4. **Hypothesis**
5. **Simulation Report**

The hypothesis form should ask:

- What is the primary failure mechanism?
- Which evidence supports it?
- Which component or policy is responsible?
- What change do you expect to fix it?
- What tradeoff do you expect?

For MVP, use structured choices plus an optional free-text note. Do not require natural-language grading.

## 5.8 Action Tray

Group actions by type:

- Reliability
- Capacity
- Data integrity
- Traffic policy
- Messaging
- Observability

Each action card includes:

- Cost
- Effect summary
- Compatible target nodes
- Reversibility
- Operational risk
- Prerequisites

Disable invalid actions and explain why.

## 5.9 Simulation view

The simulation should feel active but remain understandable.

Show:

- A 60-second virtual incident timeline
- Animated request flow through the architecture map
- Live metrics for checkout requests, latency, errors, duplicates, and cost
- Incident event markers
- A compact event feed
- Pause, 1x, 2x, and skip-to-results controls

The simulation is calculated immediately. The animation is only a playback of the already calculated report. This avoids timing-dependent bugs.

## 5.10 Outcome review

Display:

- Objective pass/fail summary
- Before-versus-after metrics
- Root-cause verdict
- Positive effects
- New risks introduced
- Residual risks
- Change cost
- Complexity impact
- Suggested next step

Actions:

- Revise design
- Investigate more
- Roll back to baseline
- Accept solution

## 5.11 Debrief screen

The debrief should teach, not merely grade.

Include:

- Final score
- Star rating or rank
- Correct root-cause explanation
- Evidence chain
- Why the successful changes worked
- Why tempting alternatives failed
- Remaining production hardening steps
- Replay options
- “View ideal solution” after completion

---

# 6. Responsive behavior

## 6.1 Desktop

Use the three-panel layout.

## 6.2 Tablet

Use two visible panels and a tabbed drawer for the third.

Recommended default:

- Architecture map takes the main area.
- Evidence and Ops Console switch through tabs.

## 6.3 Mobile

Use a step-based layout:

1. Evidence
2. Architecture
3. Hypothesis
4. Changes
5. Simulation
6. Results

Do not show a cramped three-column interface.

All game functionality must remain available on mobile, but desktop may be the preferred experience.

---

# 7. Domain architecture

## 7.1 Architectural principle

Separate the feature into four layers:

```text
UI Layer
  -> Application Layer
      -> Domain Layer
          -> Infrastructure Adapters
```

### UI layer

Responsible for:

- Rendering
- User input
- Accessibility
- Animation playback
- Routing

Must not contain business formulas.

### Application layer

Responsible for:

- Orchestrating commands
- Loading cases
- Saving sessions
- Calling the simulation engine
- Managing state transitions
- Emitting analytics events

### Domain layer

Responsible for:

- Case rules
- Graph validation
- Commands and events
- Simulation
- Scoring
- Objective evaluation
- Content validation

Must be pure TypeScript with minimal dependencies.

### Infrastructure layer

Responsible for:

- Local storage
- Database/API access
- Analytics integration
- Feature flags
- Logging

## 7.2 Recommended feature folder

Adapt names to the repository, but keep equivalent boundaries.

```text
src/
  features/
    architecture-archaeologist/
      index.ts
      routes.ts
      domain/
        types.ts
        constants.ts
        errors.ts
        case-schema.ts
        case-validator.ts
        graph/
          graph-types.ts
          graph-utils.ts
          graph-validation.ts
          graph-diff.ts
        commands/
          command-types.ts
          apply-command.ts
          command-validation.ts
        simulation/
          simulation-types.ts
          simulate-case.ts
          seeded-rng.ts
          traffic-model.ts
          capacity-model.ts
          latency-model.ts
          reliability-rules.ts
          data-integrity-rules.ts
          cost-model.ts
          report-builder.ts
        scoring/
          score-case.ts
          objective-evaluator.ts
          feedback-builder.ts
        state/
          game-state.ts
          game-reducer.ts
          game-selectors.ts
          save-migrations.ts
      application/
        game-session-service.ts
        case-catalog-service.ts
        simulation-service.ts
        repositories.ts
      infrastructure/
        local-session-repository.ts
        api-session-repository.ts
        static-case-repository.ts
        analytics-adapter.ts
      content/
        cases/
          ghost-orders-at-midnight/
            case.json
            evidence.json
            actions.json
            expected-solutions.json
      ui/
        pages/
          GameLandingPage.tsx
          GameCasePage.tsx
        components/
          GameShell.tsx
          CaseHeader.tsx
          BriefingPanel.tsx
          EvidenceLocker.tsx
          EvidenceCard.tsx
          EvidenceViewer.tsx
          ArchitectureMap.tsx
          ArchitectureNode.tsx
          ArchitectureEdge.tsx
          UnknownNode.tsx
          NodeInspector.tsx
          OpsConsole.tsx
          HypothesisForm.tsx
          ActionTray.tsx
          ActionCard.tsx
          SimulationPlayer.tsx
          MetricsPanel.tsx
          EventFeed.tsx
          OutcomeReview.tsx
          DebriefPanel.tsx
          ResourceCounter.tsx
          SaveIndicator.tsx
        hooks/
          useGameSession.ts
          useCaseDefinition.ts
          useSimulationPlayback.ts
        accessibility/
          announcements.ts
      tests/
        fixtures/
        unit/
        integration/
        e2e/
```

If the repository uses a different convention, preserve the layer separation even if folder names change.

---

# 8. Core data model

Use explicit TypeScript types. Avoid `any`.

## 8.1 Identifiers

Use branded strings or clear aliases.

```ts
export type CaseId = string;
export type SessionId = string;
export type NodeId = string;
export type EdgeId = string;
export type EvidenceId = string;
export type ActionId = string;
export type ObjectiveId = string;
export type SimulationRunId = string;
```

## 8.2 Case definition

```ts
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
```

## 8.3 Briefing

```ts
export interface CaseBriefing {
  narrative: string;
  incidentWindow: string;
  customerImpact: string[];
  knownSymptoms: SymptomDefinition[];
  constraints: string[];
  missionObjectives: string[];
}
```

## 8.4 Architecture graph

```ts
export interface ArchitectureGraph {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

export interface ArchitectureNode {
  id: NodeId;
  type: ComponentType;
  label: string;
  description?: string;
  position: { x: number; y: number };
  visibility: "hidden" | "silhouette" | "revealed";
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
  visibility: "hidden" | "silhouette" | "revealed";
  tags: string[];
}
```

## 8.5 Supported component types

Keep the initial set small.

```ts
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
```

Do not use component types as behavior by themselves. Behavior comes from typed config and rules.

## 8.6 Component configuration

Use a discriminated union.

```ts
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
  | GenericConfig;
```

Example service config:

```ts
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
```

Example gateway config:

```ts
export interface GatewayConfig {
  kind: "api-gateway";
  timeoutMs: number;
  retryCount: number;
  retryBackoffMs: number;
  retryMethods: Array<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">;
  requireIdempotencyKeyForUnsafeRetries: boolean;
}
```

Example database config:

```ts
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
```

## 8.7 Evidence item

```ts
export interface EvidenceItem {
  id: EvidenceId;
  title: string;
  category: "metric" | "log" | "trace" | "memo" | "config" | "schema" | "diagram";
  cost: number;
  initiallyUnlocked: boolean;
  reliability: "confirmed" | "reported" | "inferred";
  preview: string;
  content: EvidenceContent;
  reveals: RevealEffect[];
  tags: string[];
  debriefExplanation: string;
}
```

`reveals` may:

- Reveal a node
- Reveal an edge
- Reveal a config property
- Unlock a hypothesis
- Unlock an action
- Add a metric series

## 8.8 Design action definition

```ts
export interface DesignActionDefinition {
  id: ActionId;
  title: string;
  category: "reliability" | "capacity" | "integrity" | "traffic" | "messaging" | "observability";
  description: string;
  cost: number;
  operationalRisk: "low" | "medium" | "high";
  reversible: boolean;
  targetRules: TargetRule[];
  prerequisites: ActionPrerequisite[];
  effects: ArchitectureMutation[];
  explanation: string;
}
```

## 8.9 Session state

```ts
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
  currentArchitecture: ArchitectureGraph;
  baselineArchitectureHash: string;
  commandLog: GameCommand[];
  hypothesis?: SubmittedHypothesis;
  simulationRuns: SimulationRun[];
  acceptedRunId?: SimulationRunId;
  score?: ScoreReport;
}
```

## 8.10 Commands

```ts
export type GameCommand =
  | InspectEvidenceCommand
  | RunProbeCommand
  | SubmitHypothesisCommand
  | ApplyDesignActionCommand
  | RevertDesignActionCommand
  | RunSimulationCommand
  | AcceptSolutionCommand;
```

Every command includes:

```ts
interface CommandMetadata {
  id: string;
  sessionId: SessionId;
  issuedAt: string;
  sequence: number;
}
```

## 8.11 Simulation report

```ts
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
  estimatedCostUnits: number;
  complexityUnits: number;
  newRisks: string[];
  residualRisks: string[];
}
```

---

# 9. Case content format

## 9.1 Content should be data-driven

A new case should require little or no UI code.

Case content may be split into several JSON files for maintainability, but it must compile into one validated `GameCaseDefinition` object.

## 9.2 Validation

Use Zod, Valibot, JSON Schema, or the repository’s existing schema library.

Validation must check:

- Unique IDs
- No missing node references in edges
- No action references to missing nodes or properties
- No evidence references to missing reveal targets
- No impossible resource costs
- At least one valid solution path
- Objectives use supported metric keys
- All hidden nodes can be revealed or are intentionally unrevealed
- All action effects are reversible when marked reversible
- No circular prerequisite dependency
- Supported schema version

Add a content-validation test that loads every case file.

## 9.3 Example case skeleton

```json
{
  "schemaVersion": 1,
  "id": "case_ghost_orders_v1",
  "slug": "ghost-orders-at-midnight",
  "title": "Ghost Orders at Midnight",
  "difficulty": "tutorial",
  "estimatedMinutes": 25,
  "learningGoals": [
    "Understand idempotency",
    "Recognize retry amplification",
    "Use database uniqueness as a safety layer"
  ],
  "resources": {
    "investigationPoints": 7,
    "changeBudget": 6,
    "incidentTolerance": 3
  }
}
```

This is only a skeleton. The implementation must contain the complete validated definition.

---

# 10. Simulation engine

## 10.1 Design goal

The engine should be:

- Deterministic
- Explainable
- Fast
- Testable
- Content-driven
- Accurate enough to teach the intended principle
- Simple enough to tune by hand

Do not build a packet-level simulator.

## 10.2 Simulation pipeline

```text
Input case + current architecture + seed
  -> Validate architecture
  -> Build effective topology
  -> Generate traffic timeline
  -> Route request cohorts
  -> Apply component capacity and latency rules
  -> Apply timeout and retry rules
  -> Apply data-integrity rules
  -> Apply queue-delivery rules
  -> Aggregate metrics
  -> Evaluate objectives
  -> Build explanations and event timeline
```

## 10.3 Determinism

The seed should derive from:

```text
caseId + sessionId + runNumber + architectureHash
```

Use a small seeded pseudo-random generator such as Mulberry32 or an existing deterministic library.

Do not use `Math.random()` directly.

The engine may use pseudo-random sampling for event distribution, but aggregate results should remain stable for a given seed.

## 10.4 Traffic model

For the tutorial, simulate 60 virtual seconds.

Traffic phases:

| Phase | Seconds | Checkout RPS | Description |
|---|---:|---:|---|
| Warm-up | 0–9 | 20 | Normal traffic |
| Sale begins | 10–24 | 80 | Sharp rise |
| Peak | 25–44 | 150 | Payment provider slows |
| Recovery | 45–59 | 60 | Traffic declines |

Represent traffic as cohorts rather than individual requests when possible.

Example cohort:

```ts
interface RequestCohort {
  second: number;
  route: "checkout";
  count: number;
  hasStableCheckoutAttemptId: boolean;
  manualRetryProbability: number;
}
```

## 10.5 Capacity model

For each component:

```text
effectiveCapacity = replicas * baseCapacityPerReplica * healthMultiplier
utilization = incomingRate / effectiveCapacity
```

Suggested latency multiplier:

```text
if utilization <= 0.70: multiplier = 1.0
if utilization <= 0.90: multiplier = 1.0 + ((utilization - 0.70) / 0.20) * 0.8
if utilization <= 1.00: multiplier = 1.8 + ((utilization - 0.90) / 0.10) * 2.2
if utilization > 1.00: multiplier = 4.0 + min(8.0, (utilization - 1.0) * 10)
```

Suggested overload error rate:

```text
if utilization <= 0.95: 0
if utilization <= 1.00: up to 2%
if utilization <= 1.20: 2% to 20%
if utilization > 1.20: 20% to 60%
```

The tutorial baseline should keep service and database utilization below overload so scaling is clearly not the correct fix.

## 10.6 Network and external dependency latency

Each edge contributes:

```text
edgeLatency = baseNetworkLatency + jitter
```

External payment provider profile during peak:

- Normal latency: 350–700 ms
- Peak latency: 1,400–3,000 ms
- Timeout completion ambiguity: some requests complete after the caller timeout

## 10.7 Timeout and retry model

For each checkout request:

1. The gateway sends the request to Order Service.
2. Order Service calls the payment provider.
3. If payment response arrives before gateway timeout, process normally.
4. If the gateway times out, determine whether the payment still completed.
5. Apply the gateway retry policy.
6. If the operation has a stable idempotency key and the order service supports idempotency, replay the stored result instead of creating a second order.
7. If no idempotency protection exists, each retry can create another charge and order.

Do not model retries as simple extra traffic only. They must carry semantic identity.

## 10.8 Request identity model

Each logical checkout has:

```ts
interface LogicalCheckout {
  checkoutAttemptId?: string;
  customerId: string;
  cartFingerprint: string;
  logicalRequestId: string;
}
```

Each network attempt has:

```ts
interface NetworkAttempt {
  attemptNumber: number;
  logicalRequestId: string;
  idempotencyKey?: string;
}
```

Duplicate detection should operate on logical checkout identity, not only network request IDs.

## 10.9 Idempotency rule

If all are true:

- A stable idempotency key exists.
- The Order Service supports idempotency.
- The idempotency entry has not expired.

Then repeated attempts return the original operation result and do not create a second charge or order.

Store the first terminal result:

- Success response
- Known failure response
- Pending/ambiguous state if the implementation supports reconciliation

For MVP, store successful responses and an explicit `processing` state to prevent concurrent execution.

## 10.10 Unique constraint rule

If a unique constraint exists on `checkoutAttemptId`, a repeated database insert fails with a conflict.

The order service must map that conflict to the existing order rather than returning an unexplained 500 error. The action definition can include this handling as part of the database-safety-layer action.

## 10.11 Manual retry model

Some users retry after a visible error.

Baseline manual retry probability after timeout: 35%.

If the client has a stable checkout attempt ID, manual retries share the same identity.

If it does not, manual retries appear as new operations and may still duplicate even after gateway retry changes.

This creates a meaningful distinction between:

- Disabling automatic retries
- Implementing end-to-end idempotency

## 10.12 Queue model

For the tutorial:

- Order events use at-least-once delivery.
- Redelivery probability is low.
- Fulfillment is idempotent by `orderId`.
- Queue behavior affects duplicate processing metrics but not duplicate charges.

This makes “the queue caused duplicate charges” an incorrect hypothesis.

## 10.13 Cost model

Use abstract cost units, not cloud-provider prices.

```text
baseline node cost
+ replica cost
+ managed component cost
+ operational complexity cost
+ migration risk cost
```

Each action definition contributes explicit cost and complexity values.

Example:

- Add replica: +1 runtime cost per replica
- Add idempotency store: +2 runtime cost, +1 complexity
- Add unique constraint: +0.5 runtime cost, +1 migration complexity
- Add queue: +2 runtime cost, +3 complexity

The score can use the action’s declared change-budget cost separately from simulated runtime cost.

## 10.14 Complexity model

Complexity is a game concept representing ongoing operational burden.

Increase complexity for:

- New stateful components
- Cross-service coordination
- Locks
- Queues
- Reconciliation jobs
- Custom retry policies

Decrease or avoid complexity for:

- Constraints that use an existing database
- Removing unsafe retries
- Reusing stable identifiers already present

## 10.15 Event timeline

The simulation report should generate human-readable events such as:

- `00:12 — Checkout traffic exceeded 80 RPS.`
- `00:27 — Payment-provider p95 latency crossed the gateway timeout.`
- `00:28 — Gateway retried 17 timed-out POST requests.`
- `00:28 — 9 retries created additional orders because no idempotency key was present.`
- `00:31 — Unique constraint prevented 7 duplicate inserts.`
- `00:31 — Order Service returned the original order for repeated checkout attempts.`

Every major metric change should be explainable through one or more timeline events.

## 10.16 Simulation result explanation codes

Do not build explanations solely from free text. Emit structured reason codes.

```ts
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
```

Map reason codes to localized user-facing messages in the UI layer.

---

# 11. Scoring

## 11.1 Scoring goals

Reward:

- Correct diagnosis
- Effective solution
- Efficient investigation
- Low-cost design
- Low-complexity design
- Minimal customer impact during experiments
- Recognition of tradeoffs

Do not reward adding the largest number of components.

## 11.2 Suggested 1,000-point score

| Category | Maximum |
|---|---:|
| Root-cause accuracy | 220 |
| Objective achievement | 300 |
| Investigation efficiency | 120 |
| Change-budget efficiency | 120 |
| Complexity discipline | 80 |
| Reliability margin | 80 |
| Tradeoff recognition | 50 |
| First-run bonus | 30 |
| **Total** | **1,000** |

## 11.3 Root-cause scoring

- Correct primary hypothesis: 160
- Correct contributing factor: up to 40
- Evidence support: up to 20

Do not require exact wording. Structured selections determine correctness.

## 11.4 Objective scoring

Award partial credit based on distance from target.

Example for duplicate-order rate:

```text
<= 0.05%: full points
0.05%–0.20%: 75%
0.20%–0.50%: 40%
> 0.50%: 0%
```

## 11.5 Investigation efficiency

```text
score = maxPoints * (unusedPoints / totalPoints)
```

Add a minimum base score so learning-oriented players are not punished too harshly for reading clues.

Recommended:

```text
base = 40% of category
remaining 60% depends on unused points
```

## 11.6 Change efficiency

Reward the smallest effective set of changes.

Do not calculate only from remaining budget. Also compare against a curated “solution family” so an elegant alternative can score well.

## 11.7 Rank labels

- 900–1000: Principal Archaeologist
- 760–899: Incident Detective
- 600–759: Systems Investigator
- 400–599: Apprentice Maintainer
- Below 400: Case Reopened

“Case Reopened” should be playful, not insulting.

---

# 12. State management

## 12.1 Preferred model

Use a reducer or explicit state machine.

Recommended options:

1. Existing repository state solution
2. XState if already installed
3. React reducer plus typed transition functions

Do not introduce XState only for this feature unless the team accepts the dependency.

## 12.2 Reducer principles

- State transitions are pure.
- Commands are validated before application.
- Invalid commands return a typed error.
- Resource deductions happen atomically with the successful command.
- Every accepted command is appended to the command log.
- Simulation reports are immutable.
- Accepted solution score is calculated once.

## 12.3 Example transition function

```ts
export function applyGameCommand(
  session: GameSession,
  command: GameCommand,
  caseDefinition: GameCaseDefinition
): Result<GameSession, GameRuleError> {
  const validation = validateCommand(session, command, caseDefinition);
  if (!validation.ok) return validation;

  const next = reduceValidatedCommand(session, command, caseDefinition);
  return { ok: true, value: withUpdatedTimestamp(next) };
}
```

## 12.4 Undo and rollback

MVP needs:

- Remove or reverse player-added design actions before simulation.
- Roll back to the baseline architecture after a simulation.
- Preserve evidence and simulation history after rollback.

A full arbitrary command undo is not required.

---

# 13. Persistence

## 13.1 Repository interface

```ts
export interface GameSessionRepository {
  create(session: GameSession): Promise<void>;
  get(sessionId: SessionId): Promise<GameSession | null>;
  save(session: GameSession): Promise<void>;
  listByCase(caseId: CaseId): Promise<GameSession[]>;
  delete(sessionId: SessionId): Promise<void>;
}
```

## 13.2 Local storage adapter

Use a namespaced key:

```text
architecture-archaeologist:session:<sessionId>
```

Store an index of active sessions separately.

Debounce saves after commands, but save immediately after:

- Evidence purchase
- Hypothesis submission
- Simulation completion
- Solution acceptance

## 13.3 Save versioning

Every save contains `schemaVersion`.

Provide migration functions:

```ts
migrateV1ToV2(oldSave): V2Save
```

If migration fails:

- Preserve the raw save in a backup key.
- Show a recoverable error.
- Offer reset only after explaining that local progress cannot be loaded.

## 13.4 Cross-device persistence

For server-backed mode, map session records to the app’s existing authenticated user ID.

Do not expose answer keys or hidden content through an insecure API if scores have value. For a learning-only MVP, client visibility is acceptable.

---

# 14. API design for server-backed mode

Use the application’s existing API style. Equivalent endpoints:

## 14.1 Case catalogue

```http
GET /api/system-design-game/cases
GET /api/system-design-game/cases/:slug
```

The public case response must omit internal answer-key fields when appropriate.

## 14.2 Sessions

```http
POST /api/system-design-game/sessions
GET /api/system-design-game/sessions/:sessionId
PATCH /api/system-design-game/sessions/:sessionId
DELETE /api/system-design-game/sessions/:sessionId
```

## 14.3 Commands

Prefer command submission over arbitrary full-state replacement:

```http
POST /api/system-design-game/sessions/:sessionId/commands
```

Request:

```json
{
  "expectedSequence": 12,
  "command": {
    "type": "INSPECT_EVIDENCE",
    "evidenceId": "evidence_gateway_retry_config"
  }
}
```

Response:

```json
{
  "session": {},
  "acceptedSequence": 13
}
```

`expectedSequence` prevents accidental double submission or stale writes.

## 14.4 Simulation

```http
POST /api/system-design-game/sessions/:sessionId/simulations
```

The server derives the seed. Do not accept arbitrary client metrics.

## 14.5 Completion

```http
POST /api/system-design-game/sessions/:sessionId/complete
```

Return the final score and debrief.

---

# 15. UI component contracts

## 15.1 `GameShell`

Responsibilities:

- Layout
- Phase-aware panel composition
- Global keyboard shortcuts
- Mobile navigation
- Error boundary integration

Props should contain view models and callbacks, not repositories.

## 15.2 `EvidenceLocker`

Props:

```ts
interface EvidenceLockerProps {
  items: EvidenceCardViewModel[];
  selectedEvidenceId?: EvidenceId;
  pointsRemaining: number;
  onInspect: (id: EvidenceId) => void;
  onSelect: (id: EvidenceId) => void;
}
```

## 15.3 `ArchitectureMap`

Props:

```ts
interface ArchitectureMapProps {
  graph: ArchitectureGraphViewModel;
  selectedNodeId?: NodeId;
  simulationFrame?: SimulationFrame;
  interactionMode: "inspect" | "edit" | "playback";
  onSelectNode: (id: NodeId) => void;
  onApplyAction: (actionId: ActionId, targetId?: NodeId) => void;
}
```

## 15.4 `SimulationPlayer`

The player receives a precomputed report and produces playback frames.

```ts
interface SimulationPlayerProps {
  report: SimulationRun;
  speed: 1 | 2;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (virtualSecond: number) => void;
  onComplete: () => void;
}
```

Do not recalculate the simulation during playback.

## 15.5 View-model layer

Build selectors that transform domain state into UI-specific view models.

Examples:

- `selectEvidenceCards`
- `selectArchitectureGraphView`
- `selectAvailableActionsForNode`
- `selectCurrentObjectives`
- `selectCanRunSimulation`
- `selectOutcomeComparison`

This keeps components simple and testable.

---

# 16. Accessibility

Minimum requirements:

- Full keyboard navigation
- Visible focus states
- Semantic buttons and headings
- Architecture node list alternative to visual graph
- Screen-reader announcement when evidence is unlocked
- Screen-reader announcement when resources change
- Text summary for every chart
- Patterns/icons in addition to color for health state
- Reduced-motion mode for simulation playback
- No critical information shown only on hover
- Minimum touch target size of 44 by 44 CSS pixels

Suggested keyboard shortcuts:

- `E`: focus Evidence Locker
- `A`: focus Architecture Map
- `O`: focus Ops Console
- `R`: open Run Simulation confirmation
- `Esc`: close modal or drawer

Provide a shortcut help dialog.

---

# 17. Analytics and observability

Use the app’s existing analytics system. Do not send sensitive free text.

Recommended events:

- `system_game_case_started`
- `system_game_evidence_inspected`
- `system_game_hypothesis_submitted`
- `system_game_action_applied`
- `system_game_simulation_run`
- `system_game_simulation_passed`
- `system_game_simulation_failed`
- `system_game_case_completed`
- `system_game_case_abandoned`
- `system_game_save_recovered`

Useful properties:

- `case_id`
- `session_id`
- `phase`
- `evidence_id`
- `action_id`
- `run_number`
- `score_band`
- `elapsed_seconds`
- `investigation_points_spent`
- `change_budget_spent`

Do not log the full command payload if it can contain free-text reasoning.

Add internal error logs for:

- Case validation failure
- Save migration failure
- Impossible graph state
- Simulation invariant failure
- Unknown reason code

---

# 18. Security and abuse considerations

The MVP is low risk, but still follow these rules:

- Treat case JSON as untrusted data and validate it.
- Render evidence text as text, not raw HTML.
- Sanitize any rich content.
- Do not use `eval` or execute case-authored code.
- Cap command-log length.
- Cap free-text hypothesis length.
- Rate-limit simulation endpoints in server mode.
- Authorize every session by user ID in server mode.
- Do not trust client-submitted scores.
- Do not expose internal stack traces to users.

---

# 19. Error handling

## 19.1 User-facing recoverable errors

Examples:

- Save failed
- Simulation could not run
- Case content failed to load
- Action became invalid after another change
- Browser storage quota exceeded

Every recoverable error should offer a concrete action:

- Retry
- Reload case
- Export debug snapshot
- Reset current design
- Continue without saving

## 19.2 Developer errors

In development, show detailed case-validation paths.

Example:

```text
CaseValidationError: availableActions[4].effects[0].targetNodeId
references unknown node "order-db-primary".
```

## 19.3 Error boundary

Wrap the game route in a feature-specific error boundary so a game error does not break the whole application.

---

# 20. Testing strategy

## 20.1 Unit tests

### Content validation

- Valid tutorial case passes.
- Duplicate IDs fail.
- Missing node references fail.
- Invalid action prerequisites fail.
- Unsupported metric objective fails.

### Graph operations

- Add valid node.
- Reject duplicate node ID.
- Add valid edge.
- Reject edge to missing node.
- Remove player-added component.
- Prevent deletion of protected baseline component.
- Produce stable architecture hash.

### Commands and reducer

- Inspecting evidence deducts points once.
- Inspecting already unlocked evidence does not double-charge.
- Invalid action does not modify state.
- Valid action updates graph and command log atomically.
- Cannot run simulation without hypothesis if the case requires one.
- Accepted solution cannot be modified without explicit replay.

### Simulation

- Same seed and architecture produce identical report.
- Adding replicas changes capacity but not duplicate semantics.
- Unsafe retry without idempotency increases duplicates.
- Stable idempotency key reduces duplicates.
- Unique constraint blocks duplicate inserts.
- Disabling retries reduces duplicate rate but can lower success rate.
- Queue redelivery does not create duplicate charges in the tutorial.
- Metrics stay within valid ranges.

### Scoring

- Correct diagnosis scores higher than incorrect diagnosis.
- Efficient passing solution scores higher than overbuilt passing solution.
- Failed objectives reduce score.
- Score never exceeds 1,000 or drops below 0.

### Save migrations

- Load current version.
- Migrate previous version.
- Preserve backup when migration fails.

## 20.2 Integration tests

- Start case and create session.
- Purchase evidence and reveal hidden architecture property.
- Submit hypothesis.
- Apply design action.
- Run simulation.
- Review outcome.
- Save and reload session.
- Roll back design while preserving evidence.

## 20.3 End-to-end test: happy path

Use the repository’s E2E tool, preferably Playwright if already available.

Scenario:

1. Open game landing page.
2. Start `Ghost Orders at Midnight`.
3. Inspect the gateway retry configuration.
4. Inspect the distributed trace.
5. Inspect the orders schema.
6. Submit the correct hypothesis.
7. Apply client checkout attempt ID.
8. Apply order-service idempotency support.
9. Run simulation.
10. Confirm duplicate-order objective passes.
11. Accept solution.
12. Confirm debrief and score render.
13. Reload and confirm completion persists.

## 20.4 End-to-end test: tempting wrong solution

1. Start case.
2. Add service replicas.
3. Increase database size.
4. Submit overload hypothesis.
5. Run simulation.
6. Confirm duplicate rate remains high.
7. Confirm report explains that capacity was healthy.
8. Revise design and continue.

## 20.5 Accessibility tests

- Automated accessibility scan for main states.
- Keyboard-only completion of tutorial.
- Screen-reader labels for graph nodes and charts.
- Reduced-motion simulation path.

## 20.6 Performance tests

Targets for a typical modern laptop:

- Initial game route usable in under 2 seconds after assets are cached.
- Simulation computation under 100 ms for the tutorial case.
- Playback remains smooth at 60 FPS when animations are enabled.
- No more than one graph re-layout per architecture mutation.

---

# 21. Implementation sequence

Follow this order. Do not skip directly to polish.

## Phase 0: Repository integration plan

Tasks:

1. Inspect the existing application.
2. Select the route.
3. Select frontend-only or server-backed mode.
4. Identify reusable UI primitives.
5. Identify graph/chart dependencies already installed.
6. Write a short mapping from this specification to repository folders.
7. Add a feature flag or isolated route.

Exit criteria:

- The game route can be enabled and disabled.
- No gameplay code has been written before repository conventions are understood.

## Phase 1: Domain types and validated case fixture

Tasks:

1. Add domain types.
2. Add case schema.
3. Create the complete `Ghost Orders at Midnight` case data.
4. Add validation tests.
5. Add architecture hashing.
6. Add a static case repository.

Exit criteria:

- The case loads as a typed object.
- Invalid fixtures fail with readable errors.
- No UI is required yet.

## Phase 2: Session state and command reducer

Tasks:

1. Add session creation.
2. Add phase state machine.
3. Add evidence-inspection command.
4. Add hypothesis command.
5. Add design-action command.
6. Add simulation placeholder command.
7. Add reducer tests.

Exit criteria:

- A test can play through the case as commands without a browser.

## Phase 3: Basic game shell

Tasks:

1. Add landing page or entry card.
2. Add case route.
3. Add briefing screen.
4. Add three-panel shell.
5. Add placeholder evidence, map, and ops panels.
6. Add responsive layout.
7. Add route error boundary.

Exit criteria:

- A user can start a case and see the workspace.
- Layout works at desktop, tablet, and mobile breakpoints.

## Phase 4: Evidence system

Tasks:

1. Render evidence cards from content.
2. Implement point spending.
3. Implement evidence viewers.
4. Apply reveal effects.
5. Add “new evidence” indicators.
6. Add accessibility announcements.
7. Persist evidence state.

Exit criteria:

- The player can investigate and reveal hidden properties.
- Double-clicking or repeated requests cannot double-charge points.

## Phase 5: Architecture map and design actions

Tasks:

1. Render baseline graph.
2. Render unknown nodes.
3. Add node inspector.
4. Add action catalogue.
5. Filter actions by valid target.
6. Apply graph mutations.
7. Highlight changes from baseline.
8. Add reset-to-baseline.
9. Add graph-operation tests.

Exit criteria:

- Every tutorial action can be applied and reverted.
- Invalid connections or configs cannot be created.

## Phase 6: Hypothesis workflow

Tasks:

1. Add structured hypothesis form.
2. Require evidence selection.
3. Save hypothesis.
4. Permit revision before simulation.
5. Show hypothesis in outcome comparison.

Exit criteria:

- The case can transition from investigation to design.

## Phase 7: Deterministic simulation engine

Tasks:

1. Add seeded RNG.
2. Add traffic timeline.
3. Add capacity and latency rules.
4. Add payment timeout ambiguity.
5. Add gateway retry behavior.
6. Add logical request identity.
7. Add idempotency behavior.
8. Add unique-constraint behavior.
9. Add queue redelivery behavior.
10. Aggregate metrics.
11. Emit reason codes and timeline events.
12. Add comprehensive unit tests.

Exit criteria:

- Baseline reliably reproduces duplicate orders.
- Correct design reliably reduces duplicates.
- Scaling-only design does not solve the case.
- Identical inputs produce byte-equivalent normalized reports.

## Phase 8: Simulation playback and outcome review

Tasks:

1. Create precomputed playback frames.
2. Animate request flow.
3. Render live metrics.
4. Render event feed.
5. Add speed and skip controls.
6. Add reduced-motion mode.
7. Add before-versus-after result view.
8. Add revise and rollback actions.

Exit criteria:

- The player understands what happened without reading raw JSON.

## Phase 9: Scoring and debrief

Tasks:

1. Add objective evaluation.
2. Add scoring.
3. Add rank labels.
4. Add evidence-chain explanation.
5. Add incorrect-alternative explanations.
6. Add ideal-solution reveal after completion.
7. Persist completion.

Exit criteria:

- A completed case produces a stable score and useful lesson.

## Phase 10: Analytics, hardening, and launch checklist

Tasks:

1. Add analytics events.
2. Add error logging.
3. Add save migrations.
4. Add E2E tests.
5. Add accessibility audit.
6. Add performance checks.
7. Confirm feature flag behavior.
8. Remove debug-only controls from production.
9. Add product documentation.

Exit criteria:

- All acceptance criteria pass.
- The feature can be enabled safely in production.

---

# 22. Detailed acceptance criteria

The MVP is complete only when all items below are true.

## 22.1 Entry and navigation

- A discoverable entry point exists in the web app.
- Opening the route does not affect unrelated routes.
- The user can leave and return without losing progress.

## 22.2 Case content

- The tutorial case is loaded from validated data.
- The UI contains no tutorial-specific branching beyond presentation assets.
- Hidden content is revealed only through defined effects.

## 22.3 Investigation

- Evidence costs are displayed before purchase.
- Points are deducted exactly once.
- Insufficient points disables purchase with explanation.
- Evidence can be revisited for free.
- Relevant architecture data is revealed immediately after inspection.

## 22.4 Architecture changes

- The player can inspect every revealed node.
- Only case-approved actions are available.
- Invalid targets are disabled.
- Applied actions visibly change the graph.
- The player can compare current and baseline designs.
- The player can reverse reversible changes.

## 22.5 Hypothesis

- The player can select a primary hypothesis.
- The player can cite inspected evidence.
- The player can select a contributing factor.
- The player can revise the hypothesis before simulation.

## 22.6 Simulation

- Simulation is deterministic.
- Baseline architecture produces the intended incident.
- Correct solution passes the key objectives.
- Wrong scaling solution fails for the correct reason.
- Simulation provides metric and event explanations.
- Playback can be skipped without changing results.

## 22.7 Debrief

- Score is stable for the same command history.
- Correct root cause is explained.
- Red herrings are explained.
- Tradeoffs are explained.
- The player can replay from the beginning.

## 22.8 Persistence

- Progress survives reload.
- A completed case remains completed.
- Corrupt saves do not crash the entire web app.
- Save version is present.

## 22.9 Quality

- Domain modules have unit tests.
- Main flow has an E2E test.
- No TypeScript errors.
- No lint errors.
- No high-severity accessibility errors.
- No direct `Math.random()` in the simulation engine.
- No `any` in public domain contracts.

---

# 23. Tutorial balancing targets

Use these initial targets and tune after playtesting.

## 23.1 Baseline metrics

- Successful checkout rate: 94%–96%
- p95 latency: 2.4–2.9 seconds
- Duplicate-order rate: 1.5%–2.2%
- Duplicate-charge rate: 1.1%–1.8%
- Service peak utilization: 50%–65%
- Database peak utilization: 40%–60%

## 23.2 Correct idempotency solution

- Successful checkout rate: 98%–99.5%
- p95 latency: 2.0–2.8 seconds
- Duplicate-order rate: below 0.05%
- Duplicate-charge rate: below 0.02%
- Slight cost and complexity increase

## 23.3 Disable-retries-only solution

- Successful checkout rate: 94%–97%
- Duplicate-order rate: 0.2%–0.8%
- Duplicate-charge rate: 0.1%–0.6%
- More visible transient failures
- Debrief: improvement but not robust end-to-end idempotency

## 23.4 Scaling-only solution

- Successful checkout rate: nearly unchanged
- p95 latency: small improvement at most
- Duplicate-order rate: nearly unchanged
- Higher cost

## 23.5 Queue-before-service solution

- Smoother service traffic
- Higher checkout latency
- Duplicate semantics remain unless identity is preserved
- Higher complexity

---

# 24. Content-writing guide for future cases

Every future case should include:

1. A concrete customer-facing symptom
2. One primary failure mechanism
3. Two or three contributing factors
4. At least one plausible red herring
5. A partially hidden architecture
6. A limited investigation budget
7. Multiple solution families
8. At least one fix that improves one metric while hurting another
9. A clear debrief lesson
10. Deterministic simulation rules

## 24.1 Case quality checklist

A case is weak if:

- One clue gives away the entire answer.
- Every clue is necessary.
- The only solution is adding a named component.
- The player can pass by buying every upgrade.
- The wrong answers are obviously silly.
- The simulation cannot explain its result.
- The debrief relies on authority instead of evidence.

## 24.2 Suggested future cases

### The Celebrity Fan-Out Meltdown

A celebrity posts to 80 million followers. Teach fan-out-on-write versus fan-out-on-read, hot keys, and degraded feeds.

### The Cache That Ate Monday

A popular key expires simultaneously across regions. Teach cache stampede protection, request coalescing, jittered TTLs, and stale-while-revalidate.

### The Silent Partition

One tenant receives most traffic because of a poor partition key. Teach sharding, skew, adaptive partitioning, and tenant isolation.

### Poison in the Queue

One malformed message repeatedly crashes a worker fleet. Teach dead-letter queues, retry budgets, poison-message isolation, and observability.

### The Region That Would Not Fail

Traffic remains pinned to a degraded region. Teach health checks, failover policy, recovery-point objectives, and split-brain risk.

### Search Results From Yesterday

Writes succeed but search remains stale. Teach asynchronous indexing, lag monitoring, user expectations, and read-your-writes strategies.

---

# 25. Suggested visual and audio direction

Keep visuals professional, mysterious, and technical rather than cartoonish.

## 25.1 Visual language

- Dark operations-room atmosphere or use the host app’s theme
- Blueprint/grid texture used subtly
- Architecture nodes resemble recovered system artifacts
- Unknown nodes appear as redacted silhouettes
- Evidence cards feel like logs, traces, tickets, and incident notes
- Simulation health states animate clearly but not excessively

## 25.2 Motion

- Use short transitions for revealing evidence
- Show request pulses moving across edges during simulation
- Use gentle warning shakes only for critical events
- Respect reduced-motion settings

## 25.3 Audio

Audio is optional after MVP.

Potential sounds:

- Evidence unlock
- Simulation start
- Warning threshold crossed
- Objective passed
- Case solved

All audio must be muted by default unless the host application already uses sound.

---

# 26. Recommended implementation decisions when the repository is ambiguous

Use these defaults only when the existing codebase does not provide a clear answer.

- Language: TypeScript
- UI: React functional components
- State: `useReducer` plus context for MVP
- Validation: Zod
- Graph: React Flow only if a graph library is justified
- Charts: existing chart library; otherwise lightweight SVG
- Unit tests: Vitest
- E2E: Playwright
- Persistence: local storage adapter
- Styling: existing design system; otherwise CSS modules
- IDs: `crypto.randomUUID()` for session and command IDs
- Time: ISO 8601 strings at boundaries
- Hashing: stable JSON serialization plus a non-cryptographic stable hash

Do not install all of these blindly. Reuse existing dependencies first.

---

# 27. Implementation guardrails for a coding agent

The coding agent must not:

- Replace the application’s router.
- Introduce a second global state library just for this feature.
- Put all game logic in one component.
- Store mutable case data in component state.
- Recalculate simulation outcomes during animation frames.
- Use unseeded randomness.
- Hardcode answer correctness in button click handlers.
- Treat every evidence item as plain text.
- Allow negative resource balances.
- Allow applying the same non-repeatable action twice.
- Trust client-submitted scores in server mode.
- Ship without a baseline-vs-correct-solution simulation test.
- Add a second case before the first case is complete.

The coding agent should:

- Make small, reviewable commits or logical change sets.
- Keep domain logic independent from the rendering framework.
- Add fixture builders for tests.
- Add comments only where behavior is non-obvious.
- Prefer descriptive names over abbreviations.
- Surface assumptions in code or documentation.
- Run type checking, linting, unit tests, and E2E tests before declaring completion.

---

# 28. Example simulation invariants

Assert these in tests and optionally during development.

1. Request counts are non-negative integers.
2. Successful plus failed logical checkouts equals total logical checkouts.
3. Duplicate-order count cannot exceed total created orders minus unique logical checkouts.
4. Duplicate-charge count cannot exceed total charges minus unique successful logical payments.
5. p50 latency is less than or equal to p95 latency.
6. p95 latency is less than or equal to p99 latency.
7. Rates are between 0 and 1.
8. Resource balances never become negative.
9. Architecture hashes are stable across key ordering.
10. An idempotent replay cannot create a new order.
11. A unique-constraint block cannot increase created-order count.
12. Playback frames cannot modify the underlying simulation report.

---

# 29. Example feedback rules

Feedback should be generated from facts, not generic praise.

```ts
if (
  report.summary.duplicateOrderRate < 0.0005 &&
  architectureHasIdempotencySupport
) {
  addFeedback({
    tone: "positive",
    reasonCode: "IDEMPOTENCY_REPLAYED_RESULT",
    title: "Repeated checkouts now resolve to one operation",
    body: "The stable checkout identity lets the Order Service return the original result instead of charging and inserting again."
  });
}

if (addedServiceReplicas && servicePeakUtilization < 0.7) {
  addFeedback({
    tone: "warning",
    reasonCode: "SERVICE_NOT_CAPACITY_BOUND",
    title: "More replicas did not address the failure mechanism",
    body: "The service had spare capacity. The duplicate orders came from repeated non-idempotent execution, not CPU saturation."
  });
}
```

Keep feedback rules in the domain or application layer, not inside JSX.

---

# 30. Launch checklist

Before enabling the feature for users:

- [ ] Tutorial can be completed from a clean browser profile.
- [ ] Wrong-solution path produces useful feedback.
- [ ] Save and restore works.
- [ ] Case reset works.
- [ ] Feature flag disables all entry points.
- [ ] Mobile flow is usable.
- [ ] Keyboard-only flow is usable.
- [ ] Reduced-motion flow is usable.
- [ ] Case JSON validates in CI.
- [ ] Simulation determinism test passes.
- [ ] Baseline incident metrics are within balancing targets.
- [ ] Correct solution passes all minimum objectives.
- [ ] Scaling-only solution does not pass.
- [ ] Analytics events contain no sensitive free text.
- [ ] Error boundary has a recovery action.
- [ ] No production console errors.
- [ ] No new high-severity dependency vulnerability is introduced.
- [ ] Product copy has been reviewed.
- [ ] Debrief accurately teaches idempotency and retry semantics.

---

# 31. Definition of done for the coding agent

Do not report “done” because the route renders.

The feature is done when:

1. The game is integrated behind an isolated route or feature flag.
2. The complete tutorial case is playable end to end.
3. The case is driven by validated data.
4. The architecture map supports all tutorial actions.
5. The player can investigate, form a hypothesis, change the design, simulate, revise, and complete.
6. The simulation is deterministic and explains its outcomes.
7. The correct solution works for the correct reason.
8. Tempting incorrect solutions fail for understandable reasons.
9. Progress persists safely.
10. Tests cover the domain, main flow, wrong-solution flow, and accessibility basics.
11. Type check, lint, tests, and production build pass.
12. No unrelated application behavior is broken.

---

# 32. Suggested prompt to give the coding agent with this file

Use the text below when starting implementation:

```text
Implement the Architecture Archaeologist feature described in the attached Markdown specification.

First inspect this repository and write a brief integration mapping: framework, route, design system, state pattern, persistence, tests, and which specification folders map to existing repository folders. Do not modify unrelated code.

Then implement only the vertical slice for “Ghost Orders at Midnight” in the exact phase order defined in the specification. Reuse existing dependencies and conventions. Keep simulation logic pure and deterministic. Validate all case content. Add tests as required.

At the end of each phase, run the relevant type checks and tests. Do not add a second case, multiplayer, leaderboards, AI grading, or a general diagram editor.

Before declaring completion, verify every item in the specification’s acceptance criteria and definition of done. Report any deliberate deviation, its reason, and the smallest follow-up needed.
```

---

# 33. Final product principle

The game is successful when the player does not merely learn that “idempotency is good.” The player should experience why retries, timeouts, identity, data constraints, and operational tradeoffs interact—and should be able to explain the failure after solving it.

Build the learning loop first. Build the spectacle second.
