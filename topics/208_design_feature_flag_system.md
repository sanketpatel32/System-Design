# Design Feature Flag System

> **Category:** Beginner System Design Problems

---

Design a system to toggle features on/off at runtime without deploys.

### Requirements
- **Functional**: per-user, per-segment, percentage rollout; instant toggle.
- **Non-functional**: low-latency eval (<10ms); HA.

### Architecture
```
[Admin UI] -> [Config Service] -> [DB]
                                   |
                                   v
                              [Config cache (Redis)]
                                   |
[App] <-- poll/push -- [SDK] <-----+
```

### Evaluation
- App fetches flags (or SDK caches).
- Per-request: evaluate flag → boolean / variant.
- Rules: user_id, segment, percentage.

### Rollout types
- **On/off**: simple boolean.
- **Percentage**: 10% of users.
- **Targeted**: specific users / segments.
- **A/B variants**: multiple values.

### SDK patterns
- **Polling**: SDK fetches config every N seconds.
- **Streaming**: server pushes updates (WebSocket/SSE).
- **Bootstrap**: bundle config at startup.

### Consistency
- Eventually consistent (seconds for changes to propagate).
- For instant rollbacks: short polling interval + cache.

### Data model
```
flags:
  key (PK)
  enabled
  rules (JSON)
  variants
  updated_at
```

### Real-world
- LaunchDarkly, Unleash, Flagsmith, GrowthBook.

### Key takeaway
Feature flags = config service + SDK + cache + admin UI. Enable per-user/percentage/targeted
rollouts. Eventually consistent (seconds latency). Critical for safe deploys and instant
rollbacks.
