# Trade-offs in System Design

> **Category:** System Design Basics

---

System Design is fundamentally an **exercise in trade-off evaluation under constraints**. There is no single "perfect" architecture; every engineering choice creates trade-offs between speed, complexity, cost, consistency, and reliability.

### Architectural Trade-off Balance

```
+-------------------------------------------------------------------------+
|                    SYSTEM DESIGN TRADEOFF BALANCE                       |
+-------------------------------------------------------------------------+

             +-----------------------------------------------+
             |                LATENCY vs COST                |
             | In-Memory Caching (Fast) <-> High Cloud Cost  |
             +-----------------------------------------------+
                                    |
             +-----------------------------------------------+
             |           CONSISTENCY vs AVAILABILITY         |
             | Linearizable (CP) <-> High Availability (AP) |
             +-----------------------------------------------+
                                    |
             +-----------------------------------------------+
             |           NORMALIZED vs DENORMALIZED          |
             | Write Optimized (SQL) <-> Read Optimized NoSQL|
             +-----------------------------------------------+
```

### Fundamental Architectural Trade-offs

| Trade-off Pair | Option A | Option B | Decision Guideline |
| :--- | :--- | :--- | :--- |
| **Consistency vs. Availability** | **Strong Consistency**: Prevents stale data; increases latency or returns errors during partitions. | **High Availability**: Always responds; risks returning stale or conflicting data across nodes. | Use Strong Consistency for payments and inventory; High Availability for social feeds and activity logs. |
| **Latency vs. Throughput** | **Low Latency**: Processes requests instantly; lower batching efficiency and lower throughput. | **High Throughput**: Batches requests to maximize volume; increases individual request latency. | Low Latency for UI queries; High Throughput for analytics data pipelines. |
| **Normalized vs. Denormalized** | **Normalized Data**: Eliminates data redundancy; requires expensive $N$-table SQL JOINs. | **Denormalized Data**: Fast reads with single lookups; causes write fan-out & data duplication. | Normalized for transaction processing (OLTP); Denormalized for high-scale reads & analytics. |
| **SQL vs. NoSQL** | **SQL (Relational)**: Structured schema, ACID compliance, complex queries. | **NoSQL (Non-Relational)**: Unstructured schema, horizontal scale-out, high write velocity. | SQL for core structured business entities; NoSQL for document stores, key-value caches, and time-series. |
| **Sync vs. Async** | **Synchronous API**: Immediate feedback; blocks thread until processing completes. | **Asynchronous Queue**: Non-blocking fast acceptance; eventual notification via webhook/polling. | Sync for checkout verification; Async for video encoding and email notifications. |

### Structured Decision Framework

1. **Identify System Bottlenecks**: Determine if the bottleneck is CPU bound, Memory bound, Disk I/O bound, or Network bound.
2. **Evaluate Constraints**: Factor in team expertise, infrastructure budget, data compliance, and delivery timelines.
3. **Quantify Trade-offs**: Measure performance gain vs. operational overhead (e.g., adding Redis cuts latency by 80ms but introduces cache invalidation complexity).

### Key takeaway

Every architectural pattern has trade-offs. Senior system designers never argue for "the best technology", but rather **justify why a chosen trade-off optimal fits the functional requirements and system constraints**.
