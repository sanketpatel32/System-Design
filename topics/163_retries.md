# Retries

> **Category:** Reliability and Fault Tolerance

---

Retries automatically **re-issue failed network requests** to handle transient network blips, server restarts, or momentary rate limits without failing the parent user operation.

### Retry Flow with Idempotency Validation

```
+--------+          1. HTTP POST /orders (Key: ID-901)          +-------------------+
| Client | ---------------------------------------------------> | API Service       |
+--------+                                                      +-------------------+
    ^                                                                     |
    | (Transient 503 Service Unavailable)                                 | (Internal Error / Timeout)
    +---------------------------------------------------------------------+
    |
    | 2. Retry Attempt 1 (Same Idempotency Key: ID-901)
    +-------------------------------------------------------------------> +-------------------+
    |<------------------------------------------------------------------ | Returns 200 OK    |
    |           3. Processed Exactly Once                                +-------------------+
```

### Retry Decision Matrix

| HTTP Status / Error Type | Retry Recommendation | Strategy |
| :--- | :--- | :--- |
| **503 Service Unavailable** | Yes | Retry with Exponential Backoff + Jitter |
| **502 Bad Gateway / 504 Timeout**| Yes (If Idempotent) | Verify request status or use Idempotency Key |
| **429 Too Many Requests** | Yes | Respect `Retry-After` header value |
| **400 Bad Request / 401 Unauthorized**| No | Immediate failure (Permanent client error) |
| **404 Not Found** | No | Immediate failure |

### Dangerous Retry Anti-Patterns

- **Retry Storms**: Thousands of clients retrying simultaneously against an overloaded server, compounding system outage severity.
- **Non-Idempotent Retries**: Retrying non-idempotent HTTP POST endpoints (e.g. charging a credit card) without idempotency tokens can cause double-billing.

### Key takeaway

Execute retries **only on transient errors using idempotency keys**, combining retries with exponential backoff and jitter to prevent retry storms.
