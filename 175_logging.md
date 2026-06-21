# Logging

> **Category:** Observability

---

Logging = **recording discrete events** that happen in your system, for debugging and
auditing.

### Why log
- **Debugging**: what happened before the error?
- **Auditing**: who did what, when?
- **Compliance**: regulations require audit trails.
- **Analytics**: derive metrics from logs.
- **Security**: detect intrusions.

### Log levels
| Level | Use |
|-------|-----|
| **DEBUG** | Detailed, dev only |
| **INFO** | Normal operation |
| **WARN** | Something unexpected, but recoverable |
| **ERROR** | Failure, needs attention |
| **FATAL** | Unrecoverable, process exits |

### What to log
- **Requests**: method, path, status, latency, user.
- **Errors**: stack trace, request ID, user context.
- **State changes**: "user X upgraded to plan Y."
- **Background jobs**: start, success, failure.
- **External calls**: outbound API call + response code.

### Structured logging
```json
{
  "timestamp": "2024-06-01T12:00:00Z",
  "level": "ERROR",
  "service": "checkout",
  "request_id": "abc123",
  "user_id": 42,
  "message": "Payment failed",
  "error": "card_declined",
  "stack": "..."
}
```
- Machine-parseable (JSON).
- Easy to query in ELK, Splunk, Datadog.
- Include **request ID** for tracing.

### Best practices
- **One event per line** (for parsers).
- **Include context**: user, request ID, transaction ID.
- **Don't log secrets** (passwords, tokens, PII).
- **Async** to avoid blocking the request path.
- **Sample** at high volume (don't log every request).

### Aggregation
- Logs from all services → central store (ELK, Splunk, CloudWatch, Datadog).
- Searchable, filterable, alertable.

### Retention
- Hot: 7-30 days (searchable).
- Cold: archive to S3 for compliance.

### Key takeaway
Structured logs (JSON) with **request IDs** and **context** are the foundation of debuggability.
Log at INFO for normal ops, ERROR for problems. Aggregate centrally. Don't log secrets. Sample
at high volume.
