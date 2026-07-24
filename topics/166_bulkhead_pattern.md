# Bulkhead Pattern

> **Category:** Reliability and Fault Tolerance

---

The Bulkhead pattern is an architectural isolation technique named after the watertight compartments of a ship's hull. It **partition elements of a system into isolated pools (containers, thread pools, memory queues)** so that a failure in one compartment does not compromise or sink the entire system.

### Bulkhead Thread Isolation Architecture

Isolating connection pools per downstream service prevents a single failing service from starving thread capacity dedicated to other services.

```
Vulnerable Un-isolated Architecture (Shared Thread Pool):
+----------------------------------------------------------------------------------------------------+
| API Gateway Service (Shared Thread Pool: 100 Threads)                                              |
|                                                                                                    |
|  - 95 Threads Stuck Waiting on Hung Analytics Service!                                            |
|  - ONLY 5 Threads left for Order Service!                                                         |
|  ==> CRITICAL ORDERING SERVICE CRASHES DUE TO THREAD STARVATION!                                   |
+----------------------------------------------------------------------------------------------------+

Isolated Bulkhead Architecture (Dedicated Thread Pools):
+----------------------------------------------------------------------------------------------------+
| API Gateway Service                                                                                |
|                                                                                                    |
| +-----------------------------------+             +-----------------------------------+            |
| | Dedicated Order Pool (50 Threads) |             | Dedicated Analytics Pool (50 Thr) |            |
| | - Operating Normally (2ms RTT)    |             | - STUCK / SATURATED (Hangs!)      |            |
| +-----------------------------------+             +-----------------------------------+            |
|                   |                                                 |                              |
+-------------------|-------------------------------------------------|------------------------------+
                    v                                                 v
         Order Service (HEALTHY!)                       Analytics Service (FAILED ISOLATED!)
```

### Bulkhead Implementation Strategies Matrix

| Isolation Level | Mechanism | Scope of Fault Isolation | Implementation Technology |
| :--- | :--- | :--- | :--- |
| **Thread Pool Isolation** | Dedicated fixed-size thread pools per client service | Thread pool starvation | Resilience4j, Hystrix |
| **Semaphore Isolation** | Bounded count semaphores limiting concurrent requests | Concurrency limit | Java `Semaphore` |
| **Process / Container** | Isolated Docker containers & Kubernetes Pods | CPU & RAM OOM crashes | Kubernetes CPU/Memory Limits |
| **Cluster / Infrastructure**| Dedicated tenant node pools | Physical host failures | Cloud Auto-Scaling Groups |

### Key Differences: Bulkhead vs Circuit Breaker vs Rate Limiting

- **Bulkhead**: Isolates resources into separate pools so failure in one pool does not starve others.
- **Circuit Breaker**: Stops sending traffic to a failing downstream service.
- **Rate Limiting**: Protects a service from receiving more traffic than it can handle.

### Key Trade-offs & Engineering Best Practices

- ✅ **Fault Containment**: Guarantees core business flows (e.g. checkout) remain operational even if non-critical subsystems (e.g. recommendations) stall.
- ❌ **Capacity Fragmentation**: Unused threads in the Order pool cannot be dynamically borrowed by the Analytics pool during normal operation.
### Resilience4j Bulkhead Configuration Example (Java)

```java
// Java Resilience4j Thread Pool Bulkhead Configuration
ThreadPoolBulkheadConfig config = ThreadPoolBulkheadConfig.custom()
    .maxThreadPoolSize(20) // Maximum 20 concurrent threads for recommendations
    .coreThreadPoolSize(10)
    .queueCapacity(50)     // Bounded queue; drops requests if queue fills
    .keepAliveDuration(Duration.ofMillis(1000))
    .build();

ThreadPoolBulkhead bulkhead = ThreadPoolBulkhead.of("recommendationService", config);

// Executing task inside isolated bulkhead pool
CompletionStage<String> stage = ThreadPoolBulkhead.executeSupplier(
    bulkhead, 
    () -> recommendationClient.getRecommendations(userId)
);
```

### Key takeaway

The Bulkhead pattern **isolates thread pools, memory queues, and compute resources into distinct compartments**, ensuring that failure or saturation in one component cannot starve critical system paths.
