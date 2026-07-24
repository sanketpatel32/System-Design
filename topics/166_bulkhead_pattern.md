# Bulkhead Pattern

> **Category:** Reliability and Fault Tolerance

---

The Bulkhead Pattern isolates application elements into **independent resource pools (thread pools, memory, connection pools)** so that a failure in one component does not drain shared resources or crash the entire system.

### Bulkhead Thread Pool Isolation Architecture

```
                                  +---------------------------------+
                                  | Shared API Gateway / App Host   |
                                  +---------------------------------+
                                                  |
                    +-----------------------------+-----------------------------+
                    | Isolated Thread Pool A                    | Isolated Thread Pool B
                    v                                           v
        +-------------------------+                 +-------------------------+
        | Payment Service Pool    |                 | Analytics Service Pool  |
        | (10 Worker Threads)     |                 | (5 Worker Threads)      |
        +-------------------------+                 +-------------------------+
                    |                                           |
                    v (Healthy / Fast)                          v (Hangs / Overloaded!)
        +-------------------------+                 +-------------------------+
        | Payment Service DB      |                 | Slow Analytics Engine   |
        +-------------------------+                 +-------------------------+
                                                    (Exhausts only its 5 threads!
                                                     Payment Pool remains 100% fine!)
```

### Bulkhead Isolation Strategies

| Isolation Mechanism | How It Works | Resource Overhead | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **Thread Pool Isolation** | Dedicated fixed-size thread pools per dependency | Medium (Context switching) | Isolating slow remote HTTP/gRPC clients |
| **Semaphore Isolation** | Caps concurrent execution count per dependency | Extremely Low | In-memory limits for fast local calls |
| **Process / Container Isolation**| Deploys services into separate Docker pods/VMs | High | Microservice cluster fault isolation |

### System Engineering Benefits

- **Blast Radius Containment**: A single hanging third-party API call (e.g. slow recommendation engine) cannot drain threads needed by core revenue APIs (e.g. checkout).

### Key takeaway

Apply the Bulkhead pattern to **isolate thread and connection pools per service dependency**, containing failures within a single pool without crashing the broader application.
