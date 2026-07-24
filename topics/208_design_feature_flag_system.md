# Design Feature Flag System
> **Category:** Beginner System Design Problems

---

### Overview
A **Feature Flag System** (e.g., LaunchDarkly, Flagsmith) enables software teams to turn features on or off remotely in production without deploying new code. It supports targeted rollouts, A/B testing experiments, percentage-based canary releases, and emergency kill switches.

Core engineering requirements demand **sub-millisecond local SDK flag evaluation**, real-time flag rule streaming via WebSockets/SSE, and fault-tolerant local fallback defaults if the flag control plane goes down.

### System Architecture & In-Memory SDK Evaluation Topology

```
+--------------------------------------------------------------------------+
| CONTROL PLANE DASHBOARD (Admin configures rules: "50% rollout to Tier 1") |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Publish Rule Change
+--------------------------------------------------------------------------+
| FEATURE FLAG CONTROL SERVICE & CONFIG STORE (Redis Pub/Sub / etcd)       |
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Server-Sent Events (SSE) / Streaming Push
+--------------------------------------------------------------------------+
| APPLICATION MICROSERVICE NODE (Embedded SDK)                             |
|  [ In-Memory Flag Cache ] <--- 3. Sub-ms Local Rule Evaluation           |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **In-Memory SDK Evaluation:** The Feature Flag SDK downloads and maintains rulesets in memory locally. Evaluating `if (sdk.isEnabled("new-checkout", userContext))` takes **< 1 microsecond** with zero network calls.
2. **Server-Sent Events (SSE) Streaming:** The control plane pushes flag rule updates to application SDKs in real-time over persistent SSE or WebSocket connections, updating local SDK memory within milliseconds.
3. **Consistent Hashing for Percentage Rollouts:** Computes `MurmurHash3(user_id + feature_key) % 100`. If hash result $< 20$, the user consistently receives the 20% rollout feature without storing per-user state in a database.

### API Interface & SDK Specifications

| Endpoint / Method | Type | Input Context | Output Payload / Result |
|---|---|---|---|
| `GET /api/v1/flags/rules` | HTTP / SSE | Headers: `Authorization: Bearer <sdk_key>` | Streams full JSON configuration rule definitions to SDK cache. |
| `sdk.evaluate(flag_key, context)`| In-Memory | `context: {"user_id": "u99", "country": "US", "app_version": "2.4"}`| Returns `boolean` or `variant_value` instantly from local RAM. |

### Feature Flag Rule Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `flag_key` | String (Indexed) | PostgreSQL / Redis | Unique flag key identifier (`new-payment-flow`). |
| `is_enabled` | Boolean | Relational DB | Master kill-switch toggle. |
| `percentage_rollout`| Integer (0-100) | Relational DB | Targeted rollout percentage threshold. |
| `targeting_rules` | JSONB | Relational DB | Attribute targeting rules: `{"country": ["US", "CA"], "tier": "PREMIUM"}`. |
| `version` | Integer | Relational DB | Monotonically increasing version number for SSE cache invalidation. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Local In-Memory SDK Evaluation** | Zero network latency; complete insulation from central control plane outages. | Increases application process RAM usage slightly to store rule definitions. | Mandatory architecture for high-throughput production microservices. |
| **MurmurHash3 Percentage Hashing** | State-free deterministic user assignment; zero database read/write tracking required. | Cannot easily override individual user assignments unless explicit whitelist rule is added. | Percentage canary releases and A/B experiment rollouts. |
| **Server-Sent Events (SSE) Streaming**| Real-time push updates within milliseconds when a kill switch is flipped. | Requires maintaining persistent open HTTP connection sockets on control plane. | Enterprise feature management platforms. |

### Key takeaway
A **Feature Flag System** achieves sub-microsecond evaluation speed by evaluating rule definitions **in-memory inside application SDKs**, using **MurmurHash3 hashing** for state-free percentage rollouts and **Server-Sent Events (SSE)** for real-time rule streaming.
