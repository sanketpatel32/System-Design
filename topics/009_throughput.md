# Throughput

> **Category:** System Design Basics

---

Throughput measures the **volume of work a system processes within a given time frame**. Depending on the system layer, throughput is expressed in **Queries Per Second (QPS)**, **Requests Per Second (RPS)**, **Transactions Per Second (TPS)**, or **Megabits Per Second (Mbps)**.

### Throughput Processing Architecture

```
+-------------------------------------------------------------------------+
|                  PARALLEL THROUGHPUT PROCESSING ENGINE                  |
+-------------------------------------------------------------------------+

  [ Ingress Stream ] (100k msg/sec)
          |
          v
  +----------------+
  | Load Balancer  |
  +----------------+
    |            |            |
    v            v            v
  +----+       +----+       +----+
  | Worker 1 | | Worker 2 | | Worker 3 |  (Parallel Batch Processing)
  +----+       +----+       +----+
    |            |            |
    +------------+------------+
                 |
                 v
  +--------------------------------+
  | Partitioned Storage Engine     |  (High-Throughput Append Log)
  +--------------------------------+
```

### Throughput Metrics across System Layers

| System Component | Primary Throughput Metric | Scale Target Example | Key Bottleneck |
| :--- | :--- | :--- | :--- |
| **Web Server / API** | Requests Per Second (RPS) | 50,000 RPS | CPU context switching, event loop thread pool |
| **Relational DB (SQL)** | Transactions Per Second (TPS) | 2,000 - 5,000 TPS | Disk I/O, row locking, WAL write contention |
| **NoSQL DB (Cassandra)**| Writes Per Second | 100,000+ Write QPS | Disk write bandwidth, SSTable compaction |
| **Message Broker (Kafka)**| Messages / MBs Per Second | 1,000,000 msg/sec | Network NIC bandwidth, page cache flush |
| **Network Infrastructure**| Gbps / Bandwidth | 100 Gbps | Physical switch backplane, router packet processing |

### Little's Law & Throughput Dynamics

The fundamental relationship between Throughput ($L$), Latency ($W$), and Concurrency ($N$) is defined by **Little's Law**:

$$N = L \times W \quad \implies \quad \text{Throughput } (L) = \frac{\text{Concurrency } (N)}{\text{Latency } (W)}$$

- To double throughput ($L$), you must either **double system concurrency ($N$)** by adding workers, or **halve execution latency ($W$)** by optimizing code and queries.

### Throughput Optimization Techniques

1. **Batching & Chunking**: Combine small individual writes into a single large batch to reduce disk I/O and network overhead (e.g., Kafka batching).
2. **Asynchronous Non-blocking I/O**: Use event loops (Node.js, Netty, epoll) to process thousands of concurrent connections on few threads.
3. **Partitioning & Sharding**: Distribute data horizontally so multiple database nodes process writes in parallel without shared locks.
4. **Read Replicas & In-Memory Caching**: Divert read traffic away from the primary database node to increase total aggregate QPS.

### Key takeaway

Increasing system throughput requires **eliminating serial execution bottlenecks** through batching, horizontal sharding, non-blocking asynchronous I/O, and parallel message processing pipelines. Always balance throughput goals with latency targets using Little's Law.
