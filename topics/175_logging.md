# Logging

> **Category:** Observability

---

Logging is the practice of **recording discrete, timestamped application events** to provide an immutable record for debugging, security auditing, and system behavior inspection.

### Distributed Log Collection Architecture

```
+-----------------------------------------------------------------------------------+
|                           App Pods (Microservices A/B/C)                          |
+-----------------------------------------------------------------------------------+
                                          | Write Structured JSON to stdout
                                          v
+-----------------------------------------------------------------------------------+
|                      Log Collectors / DaemonSets (Fluentbit / Vector)             |
+-----------------------------------------------------------------------------------+
                                          | Stream Events
                                          v
+-----------------------------------------------------------------------------------+
|                        Message Buffer (Kafka / Logstash)                          |
+-----------------------------------------------------------------------------------+
                                          | Ingest
                                          v
+-----------------------------------------------------------------------------------+
|                    Search & Analytics Store (Elasticsearch / Loki)                |
+-----------------------------------------------------------------------------------+
```

### Log Levels & Guidelines

| Log Level | Purpose | Example Event | Production Volume |
| :--- | :--- | :--- | :--- |
| **DEBUG** | Low-level developer diagnostic details | `Query execution time: 12ms` | Disabled in Prod |
| **INFO** | Normal business lifecycle milestones | `Order #1042 created for user_99` | High |
| **WARN** | Degraded state / recoverable issues | `Redis cache timeout; reading DB` | Medium |
| **ERROR** | Operation failure requiring attention | `Payment gateway 502 connection failed` | Low (Alertable) |
| **FATAL** | Unrecoverable crash | `Database connection pool exhausted; exiting`| Minimal |

### Structured Logging Best Practices

- **Structured Formats (JSON)**: Always log in structured JSON rather than unstructured plain text to allow search engines to index fields automatically.

```json
{
  "timestamp": "2026-07-24T12:00:00Z",
  "level": "ERROR",
  "service": "payment-service",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "user_id": 9042,
  "message": "Credit card processing failed",
  "error_code": "CARD_DECLINED"
}
```

### Key takeaway

Emit **structured JSON logs containing correlation trace IDs**, streaming them via lightweight log collectors to centralized search engines like Elasticsearch or Loki.
