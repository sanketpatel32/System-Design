# Dead Letter Queue

> **Category:** Message Queues and Event Streaming

---

A **Dead Letter Queue (DLQ)** is a specialized secondary queue used to store messages that cannot be processed successfully after exhausting all configured retry attempts, or messages that fail validation due to malformed payloads (poison pill messages).

### Failure & DLQ workflow

```
                        +-------------------------+
                        |  Primary Message Queue  |
                        +-------------------------+
                                     |
                                     v
                        +-------------------------+
                        |    Consumer Worker      |
                        +-------------------------+
                               /           \
                   Processing /             \ Processing Fails
                    Succeeds /               \ (Retry Count Exceeded)
                            v                 v
                   +---------------+   +-------------------------+
                   | ACK & Delete  |   | DEAD LETTER QUEUE (DLQ) |
                   +---------------+   +-------------------------+
                                                    |
                                       Alerting & Manual Inspection
                                                    v
                                       +-------------------------+
                                       | DevOps / Redrive Tool   |
                                       +-------------------------+
```

### Primary causes of DLQ messages

1. **Poison Pill Messages**: Payload syntax errors, missing fields, or invalid schemas that consistently cause consumer execution panics.
2. **Exhausted Retry Limits**: Messages that repeatedly encounter downstream service outages or persistent database timeouts.
3. **TTL Expiration**: Unconsumed messages that expire in primary queues without being processed.

### Operational DLQ Strategy Matrix

| Phase | Operational Action | Tools / Implementation |
| :--- | :--- | :--- |
| **Detection** | Fire high-priority alerts when DLQ metric > 0 | PagerDuty, Prometheus Alerts, CloudWatch Alarms |
| **Inspection** | Inspect message payload, headers, and stack trace error logs | DLQ Administrative Dashboard, CLI tools |
| **Remediation** | Fix underlying bug, deploy code patch, or fix schema mapping | CI/CD deployment pipeline |
| **Redrive / Replay**| Re-inject DLQ messages back into the primary queue for re-processing | Automated DLQ Redrive APIs or CLI scripts |

### Key takeaway

Dead Letter Queues isolate unprocessable or malformed messages, preventing queue blockage and data loss. Pair DLQs with active alerting and redrive tools to inspect and reprocess failed messages after resolving root causes.
