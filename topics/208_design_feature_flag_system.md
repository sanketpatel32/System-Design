# Design Feature Flag System
> **Category:** Beginner System Design Problems

---

### Overview
A **Feature Flag System** (e.g., LaunchDarkly) enables real-time control over feature rollouts, A/B experimentation, and emergency kill switches without deploying new code to production servers.

### Architecture Topology

```
+---------------------+     1. Flag Changes (Rules)     +---------------------+
| Admin Console UI    | ------------------------------> | Flag Config Service |
+---------------------+                                 +---------------------+
                                                                   |
                                                                   v 2. Push Updates (SSE / WebSockets)
+------------------------------------------------------------------+
|                                                                  |
|   +----------------------------------------------------------+   |
|   | Application SDK (In-Memory Evaluation Engine)            |   |
|   | Local Flag Cache Rule Tree                               |   |
|   +----------------------------------------------------------+   |
|                                                                  |
|   Client Code: if (flagSDK.evaluate("new_ui", userContext))  |
|                                                                  |
+------------------------------------------------------------------+
```

### Rule Evaluation Engine Model
Flags must be evaluated **in-memory within the local SDK** in sub-milliseconds to avoid introducing API network calls into application execution paths.

```json
// Feature Flag Rule Definition
{
  "flag_key": "checkout_v2_redesign",
  "state": "ENABLED",
  "default_variation": false,
  "rules": [
    {
      "attribute": "email",
      "operator": "ENDS_WITH",
      "values": ["@company.com"],
      "variation": true
    },
    {
      "attribute": "user_id",
      "operator": "PERCENTAGE_ROLLOUT",
      "percentage": 10,
      "variation": true
    }
  ]
}
```

### Consistent Percentage Rollouts Algorithm
To ensure user `usr_123` consistently receives the exact same variation across sessions without database state storage, compute a hash of the user ID and flag key:

$$\text{Bucket} = \text{MurmurHash3}(\text{user\_id} + \text{flag\_key}) \pmod{100}$$

If $\text{Bucket} < \text{Rollout Percentage}$, evaluate to `true`.

### Key takeaway
Feature flags must evaluate **in-memory locally inside the application SDK** using deterministic hashing (e.g., **MurmurHash3**). Synchronize flag rule updates from the control plane using **Server-Sent Events (SSE)**.
