# Timeouts

> **Category:** Reliability and Fault Tolerance

---

A timeout is a fundamental reliability control mechanism that **bounds the maximum time a client or service will wait for an asynchronous request or I/O operation to complete**. Setting explicit timeouts prevents cascading service hangs, thread pool exhaustion, and resource leaks when downstream dependencies slow down or crash.

### Timeout Mechanism Architecture

Without timeouts, slow downstream dependencies consume caller thread pools indefinitely, leading to total system collapse.

```
Without Timeout (Cascading System Freeze):
+----------------+      1. HTTP Call (No Timeout)      +------------------+      2. Slow SQL Query      +--------------------+
| API Frontend   | ----------------------------------> | Auth Service     | --------------------------> | Legacy Database    |
| (Worker Pool)  | <---------------------------------- | (Blocks Threads) | (Hangs indefinitely...)    | (Stuck on Lock)    |
+----------------+   Worker Threads Exhausted (OOM)    +------------------+                             +--------------------+

With Explicit Timeout Protection:
+----------------+      1. HTTP Call (Timeout: 500ms)  +------------------+
| API Frontend   | ----------------------------------> | Auth Service     |
| (Worker Pool)  | <---------------------------------- | (Processing...)  |
+----------------+   2. 500ms Expires! Returns 504     +------------------+
        |            Gateway Timeout to Client immediately!
        v
Worker Thread Freed! System Remains Available!
```

### Timeout Layers Matrix

| Timeout Level | Recommended Setting | Target Purpose | Primary Failure Prevented |
| :--- | :--- | :--- | :--- |
| **Connection Timeout** | 500ms - 2,000ms | Bounds TCP Handshake setup time | Waiting on unreachable IP / dead host |
| **Socket / Read Timeout**| 1,000ms - 5,000ms | Bounds time waiting for next data packet | Waiting on hung application server thread |
| **HTTP Request Timeout** | 2,000ms - 10,000ms | Bounds total end-to-end HTTP request duration | Slow multi-hop microservice chains |
| **Database Query Timeout**| 500ms - 3,000ms | Bounds SQL execution time on database | Runaway un-indexed table scans |

### Timeout Budgeting Across Microservice Chains

In a deep microservice call chain (A → B → C → D), the top-level API timeout must be distributed across downstream services:
**Timeout Budget** = Client Timeout - Σ Network Latency Overhead
- **Deadline Propagation**: Distributed tracing headers (e.g. gRPC deadlines or `X-Request-Deadline`) pass the remaining budget down the call stack. If Service C receives a request with 50ms remaining deadline, it cancels downstream calls if execution exceeds 50ms.

### Key Trade-offs & Production Tuning

- ✅ **Prevents Thread Exhaustion**: Releases connection pool threads quickly during downstream degradation.
- ❌ **False Positive Failures**: Setting timeouts too aggressively (e.g. 50ms on a 45ms P99 API) causes artificial request drops during minor latency spikes.
### Production HTTP Client Timeout Configuration Code (Go)

```go
package main

import (
    "net"
    "net/http"
    "time"
)

func CreateHttpClientWithTimeouts() *http.Client {
    dialer := &net.Dialer{
        Timeout:   500 * time.Millisecond, // TCP Connection Timeout
        KeepAlive: 30 * time.Second,
    }
    
    transport := &http.Transport{
        DialContext:           dialer.DialContext,
        TLSHandshakeTimeout:   500 * time.Millisecond, // TLS Timeout
        ResponseHeaderTimeout: 2000 * time.Millisecond, // Server Read Timeout
        MaxIdleConns:          100,
    }
    
    return &http.Client{
        Transport: transport,
        Timeout:   3000 * time.Millisecond, // Global Request Timeout
    }
}
```

### Key takeaway

Always set **explicit connection, read, and deadline-propagated timeouts** on all network I/O calls to prevent slow downstream dependencies from exhausting caller system resources.
