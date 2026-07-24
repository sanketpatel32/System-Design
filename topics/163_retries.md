# Retries

> **Category:** Reliability and Fault Tolerance

---

Retries are a fault-tolerance mechanism where a client **automatically re-issues a failed network request** under the assumption that the failure is transient (e.g., brief network packet drop, transient load spike, or pod failover). Retries must be implemented cautiously to prevent amplifying network congestion through "retry storms".

### Retry Mechanism Architecture

Retries handle transient network errors by retrying requests after brief intervals while filtering non-retryable errors.

```
+----------------+      1. HTTP POST /payments (Network Glitch)     +--------------------+
| Client App     | -----------------------------------------------> | Payment Gateway    |
|                | <----------------------------------------------- | (Connection Drop)  |
+----------------+      2. Returns 503 Service Unavailable          +--------------------+
        |
        | 3. Evaluate Retry Policy:
        |    - Error is Transient (503)? YES.
        |    - Retries Left? (1 of 3).
        |    - Is Request Idempotent? YES (Idempotency-Key header).
        |
        | 4. Wait Backoff Interval -> Issue Retry Attempt #2
        v
+----------------+      5. HTTP POST /payments (Success)            +--------------------+
| Client App     | -----------------------------------------------> | Payment Gateway    |
|                | <----------------------------------------------- | 200 OK             |
+----------------+                                                  +--------------------+
```

### Retryable vs Non-Retryable Errors Matrix

| HTTP / RPC Error Code | Transient Status | Recommended Action | Example Scenario |
| :--- | :--- | :--- | :--- |
| **`429 Too Many Requests`** | Transient | **Retry with Backoff** | Client rate limited by API Gateway |
| **`503 Service Unavailable`** | Transient | **Retry with Backoff** | Backend service restarting / pod failover |
| **`504 Gateway Timeout`** | Transient | **Retry if Idempotent** | Downstream proxy timeout |
| **`400 Bad Request`** | Permanent | **DO NOT RETRY** | Invalid JSON payload format |
| **`401 Unauthorized`** | Permanent | **DO NOT RETRY** | Invalid API Key or expired JWT token |
| **`404 Not Found`** | Permanent | **DO NOT RETRY** | Non-existent resource ID |

### The Three Golden Rules of Retries

1. **Mandate Idempotency**: Only retry requests that are safe to repeat without causing duplicate side-effects (or send explicit `Idempotency-Key` headers).
2. **Limit Max Attempts**: Cap retries at 2-3 attempts to prevent infinite execution loops.
3. **Use Exponential Backoff with Jitter**: Never retry immediately in a tight loop; introduce exponential delays randomized with jitter.

### Key Trade-offs & Production Risks

- ✅ **Self-Healing Automation**: Seamlessly recovers from temporary network drops without user disruption.
- ❌ **Retry Storm Risk**: If thousands of clients simultaneously retry requests against a struggling server, the surge of retries creates a **Retry Storm**, driving server CPU to 100% and prolonging outage duration.
### Concrete Python Retry Implementation with Jitter (Tenacity Library)

```python
from tenacity import retry, stop_after_attempt, wait_random_exponential, retry_if_exception_type
import requests

# Retry up to 3 times with Exponential Backoff + Full Jitter for 5xx errors
@retry(
    stop=stop_after_attempt(3),
    wait=wait_random_exponential(multiplier=1, max=10),
    retry=retry_if_exception_type(requests.exceptions.RequestException)
)
def call_downstream_service(url, payload):
    response = requests.post(url, json=payload, headers={"Idempotency-Key": payload["transaction_id"]}, timeout=2.0)
    response.raise_for_status()
    return response.json()
```

### Key takeaway

Retries smooth over transient network failures, but must be paired with **idempotency checks, strict max attempt limits, and exponential backoff with jitter** to avoid retry storms.
