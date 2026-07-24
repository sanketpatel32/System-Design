# Circuit Breaker

> **Category:** Reliability and Fault Tolerance

---

A Circuit Breaker is a stability pattern that **detects downstream RPC failures or high latency**, tripping to fail fast immediately and preventing cascading failure across distributed microservices.

### Circuit Breaker Finite State Machine

```
                        +-------------------------+
                        |         CLOSED          |  (Normal Operation)
                        | (Requests Flow Normally)|
                        +-------------------------+
                          /                     ^
      Error Threshold    /                       \  Success Threshold
      Exceeded          v                         \ Exceeded
                        +-------------------------+
                        |          OPEN           |  (Failing Fast)
                        | (Rejects Immediately)   |
                        +-------------------------+
                          \                     ^
        Sleep Window       \                   /  Failure Occurs
        Expires             v                 /
                        +-------------------------+
                        |        HALF-OPEN        |  (Testing Recovery)
                        | (Allows Probe Requests) |
                        +-------------------------+
```

### Circuit Breaker State Transition Matrix

| State | Operation Allowed? | Trigger to Next State | Fallback Action |
| :--- | :--- | :--- | :--- |
| **Closed** | Yes (100% Traffic) | Error rate exceeds threshold (e.g. > 50% failures in 10s) | N/A (Normal execution) |
| **Open** | No (Fails Fast Immediately)| Sleep timer window expires (e.g., after 30 seconds) | Returns fallback response / cached default |
| **Half-Open**| Partial (Probe Traffic) | Probe requests succeed -> Closed; Probe fails -> Open | Returns fallback if probe fails |

### Key Benefits

- **Prevent Resource Exhaustion**: Stops caller threads from blocking on unresponsive downstream microservices.
- **Proactive Fallbacks**: Returns static backup data or cached responses instantly during downstream outages.

### Key takeaway

Deploy circuit breakers to **fail fast during downstream service outages**, insulating core system threads and gracefully returning fallback responses.
