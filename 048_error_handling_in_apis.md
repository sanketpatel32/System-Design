# Error Handling in APIs

> **Category:** API Design

---

Good error handling turns "the API broke" into "the client knows exactly what to do." Bad
error handling fills your support inbox.

### Principles
1. **Use proper HTTP status codes** (4xx = client fix, 5xx = server fix).
2. **Consistent error body** across all endpoints.
3. **Machine-readable codes** — clients branch on these, not on messages.
4. **Human-readable details** — for developers debugging.
5. **Don't leak internals** (stack traces, SQL, hostnames).

### Standard error envelope
```json
{
  "error": {
    "code": "INVALID_PAYMENT_METHOD",
    "message": "The provided card was declined.",
    "details": {
      "field": "card.number",
      "decline_code": "insufficient_funds"
    },
    "request_id": "req_abc123"
  }
}
```

### Common codes
| HTTP | Code | Meaning |
|------|------|---------|
| 400  | INVALID_INPUT | Malformed payload |
| 401  | UNAUTHENTICATED | No / bad token |
| 403  | FORBIDDEN | Authenticated, no permission |
| 404  | NOT_FOUND | Resource doesn't exist |
| 409  | CONFLICT | Duplicate / version mismatch |
| 422  | VALIDATION_FAILED | Syntactically valid, semantically bad |
| 429  | RATE_LIMITED | Quota exceeded |
| 500  | INTERNAL | Unexpected server bug |
| 503  | UNAVAILABLE | Maintenance / overload |

### Idempotency of errors
If a request fails, the client retries. The error response itself should be **idempotent** — same
request, same error, until the underlying problem is fixed.

### Operational tips
- **Log every 5xx** with a request_id.
- **Alert** on 5xx rate > threshold.
- **Don't expose stack traces** in production.
- **Return Retry-After** with 429 / 503.

### Key takeaway
Errors are part of the API contract. Use **correct status codes + machine-readable error codes +
consistent envelope + request_id for tracing**. Clients should be able to recover automatically
from 4xx and retry safely on 5xx.
