# Latency

> **Category:** System Design Basics

---

Latency is the **time elapsed between sending a request and receiving the response**. In distributed systems engineering, latency is a critical performance metric measured across multiple percentiles (p50, p95, p99) to evaluate responsiveness.

### Request Timeline & Latency Components

```
+-------------------------------------------------------------------------+
|                       END-TO-END LATENCY TIMELINE                       |
+-------------------------------------------------------------------------+

  [ Client ] --( Network RTT )--> [ API Gateway ] --( IPC )--> [ Microservice ]
                                                                     |
  [ Client ] <-- ( Network RTT )-- [ Storage / DB ] <-- ( Disk IO )---v
  
  |<------------------------ Total Latency -------------------------->|
  
  Total Latency = DNS Lookup + TCP/TLS Handshake + Network RTT + 
                  Server Processing Time + Database I/O + Serialization
```

### Latency Numbers Every Computer Scientist Should Know

| Operation | Access Time | Relative Scale |
| :--- | :--- | :--- |
| **L1 Cache reference** | 0.5 ns | 1 sec |
| **Branch mispredict** | 5 ns | 10 sec |
| **L2 Cache reference** | 7 ns | 14 sec |
| **Mutex lock/unlock** | 100 ns | 3.3 min |
| **Main Memory (RAM) reference** | 100 ns | 3.3 min |
| **NVMe SSD Random Read** | 150,000 ns (150 µs) | 3.5 days |
| **Read 1 MB sequentially from RAM** | 250,000 ns (250 µs) | 5.8 days |
| **Read 1 MB sequentially from NVMe SSD** | 1,000,000 ns (1 ms) | 23 days |
| **Network RTT within same Datacenter** | 500,000 ns (0.5 ms) | 11.5 days |
| **Send packet CA to NY (Cross-country RTT)**| 40,000,000 ns (40 ms) | 2.5 years |
| **Read 1 MB sequentially from Network** | 10,000,000 ns (10 ms) | 7.5 months |

### Understanding Latency Percentiles (p50, p95, p99)

Average (mean) latency is misleading because outlier requests hide severe performance drops. Engineers evaluate percentiles:

- **p50 (Median)**: 50% of requests are faster than this value. Represents typical user experience.
- **p95**: 95% of requests are faster than this value. Identifies moderate performance degradation.
- **p99 (Tail Latency)**: 99% of requests are faster than this value. Represents worst-case performance for 1 in 100 requests (often high-value power users executing complex queries).

### Architectural Strategies to Reduce Latency

1. **Edge Caching & CDNs**: Serve static assets and API responses geographically close to users.
2. **In-Memory Caching (Redis/Memcached)**: Offload disk I/O reads by serving hot data directly from RAM.
3. **Database Indexing & Query Tuning**: Replace full table scans (O(N)) with B-Tree or LSM-Tree index lookups (O(log N)).
4. **Asynchronous Execution & Message Queues**: Offload long-running operations (image processing, emails) to background workers.
5. **Connection Pooling & HTTP/2 Multiplexing**: Reuse TCP/TLS connections to eliminate connection setup overhead.

### Key takeaway

Focus on **p99 tail latency** rather than averages when measuring system performance. Reduce latency by leveraging multi-level caching (L1/L2, Redis, CDN), optimizing database indexing, and processing slow tasks asynchronously via message queues.
