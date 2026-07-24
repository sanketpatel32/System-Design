# Timeouts

> **Category:** Reliability and Fault Tolerance

---

A Timeout is a boundary constraint that specifies the **maximum time a client or service will wait for a network call or task to complete**, terminating slow operations to free resources.

### Timeout Cascading Execution

```
+--------+      1. HTTP Call (Timeout: 5s)      +--------------------+      2. Remote Call (Timeout: 2s)    +-------------------+
| Client | -----------------------------------> | API Gateway        | ------------------------------------> | Backend Service   |
+--------+                                      +--------------------+                                       +-------------------+
    |                                                     |                                                           |
    |                                                     v                                                           |
    | (Times out at 5s!)                       (Times out at 2s!)                                              (Hanging SQL...)
    | Returns HTTP 504 Gateway Timeout          Cancels Downstream Context                                      Releases Thread Pool
```

### Types of Timeouts & Tuning Matrix

| Timeout Level | Recommended Value Range | Primary Purpose | Risk if Configured Too High |
| :--- | :--- | :--- | :--- |
| **Connection Timeout** | 500 ms - 2 seconds | Caps time to establish TCP/TLS handshake | Connection pool thread starvation |
| **Read / Request Timeout**| 2 seconds - 10 seconds | Caps time waiting for first/full response payload | Slow queries block caller pools |
| **Database Query Timeout**| 1 second - 5 seconds | Aborts hanging SQL transactions | DB locks held, connection pool OOM |
| **Circuit Breaker Timeout**| 1 second - 3 seconds | Opens circuit if downstream hangs | Cascading latency up call stack |

### Critical System Considerations

- **Deadlines Propagation (gRPC Context)**: Pass the remaining timeout budget downstream through HTTP/gRPC context headers so sub-services cancel early if the top-level client deadline has already expired.
- **Connection Pool Exhaustion**: Without tight timeouts, slow downstream dependencies consume all application worker threads, causing total system collapse.

### Key takeaway

Enforce explicit **connection, read, and request timeouts** across all network RPC calls, propagating deadline budgets downstream to prevent thread pool exhaustion.
