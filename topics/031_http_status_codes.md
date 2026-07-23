# HTTP Status Codes

> **Category:** Networking Basics

---

Status codes communicate the outcome of an HTTP request. They're grouped by leading digit.

### The 5 classes
| Range | Meaning |
|-------|---------|
| 1xx   | Informational |
| 2xx   | Success |
| 3xx   | Redirection |
| 4xx   | Client error |
| 5xx   | Server error |

### Must-know codes
| Code | Meaning | When |
|------|---------|------|
| 200  | OK | Successful GET, PUT, DELETE |
| 201  | Created | POST that created a resource |
| 202  | Accepted | Async — request queued, not done |
| 204  | No Content | Success with no body (DELETE, PUT) |
| 301  | Moved Permanently | URL changed permanently |
| 302  | Found | Temporary redirect |
| 304  | Not Modified | Cache hit (conditional GET) |
| 400  | Bad Request | Malformed input |
| 401  | Unauthorized | Not authenticated (no login) |
| 403  | Forbidden | Authenticated but no permission |
| 404  | Not Found | Resource doesn't exist |
| 409  | Conflict | Concurrent update / duplicate |
| 422  | Unprocessable Entity | Valid syntax, invalid semantics |
| 429  | Too Many Requests | Rate limited |
| 500  | Internal Server Error | Bug in app |
| 502  | Bad Gateway | Upstream returned invalid response |
| 503  | Service Unavailable | Overloaded / maintenance |
| 504  | Gateway Timeout | Upstream timed out |

### Rules of thumb
- **4xx**: client did something wrong (fix your request).
- **5xx**: server did something wrong (fix your code).
- Use **401 vs 403** precisely: 401 = "who are you?", 403 = "you can't do that".
- **429** with `Retry-After` header for rate limiting.

### Why it matters
- Clients (and SDKs) branch on status codes — wrong codes break retry / auth logic.
- Monitoring dashboards key off 5xx rate for alerting.
- Idempotent retries rely on 2xx semantics.

### Key takeaway
Pick the **specific** code, not just 200-or-500. Proper status codes make your API self-
describing and let clients react intelligently.
