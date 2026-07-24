# Database Scaling

> **Category:** Scaling

---

**Database Scaling** encompasses the techniques and patterns used to expand a database system's capacity to handle increased read throughput, write traffic, data storage volume, and concurrent connection counts while preserving system responsiveness, durability, and availability.

### Architecture spectrum

```
                                  [Database Scaling]
                                          |
                   +----------------------+----------------------+
                   |                                             |
          (Vertical Scaling)                            (Horizontal Scaling)
                   |                                             |
         +-------------------+                    +------------------------------+
         | Add CPU / RAM /   |                    | Read Replicas / CQRS        |
         | High-Speed NVMe   |                    | Database Sharding            |
         +-------------------+                    | Distributed NoSQL (Cassandra)|
                                                  +------------------------------+
```

### Primary scaling patterns

Database scaling requires matching the scaling dimension (reads vs writes vs storage) with the right architectural mechanism:

1. **Vertical Scaling (Scale-Up)**: Upgrading existing hardware (e.g., upgrading to 128 cores, 1TB RAM). Limited by hardware caps and vendor costs.
2. **Read Scaling (Read Replicas)**: Routing read operations to multiple read-only secondary nodes via asynchronous or synchronous replication.
3. **Write Scaling (Sharding)**: Horizontally partitioning datasets across multiple independent database nodes based on a partition key.
4. **Functional Decomposition**: Splitting a monolithic database into microservice-specific databases (e.g., Users DB, Orders DB).
5. **Caching & Offloading**: Using in-memory stores (Redis) or search engines (Elasticsearch) to bypass the primary database altogether.

### Scaling approach comparison

| Approach | Read Scaling | Write Scaling | Operational Complexity | Consistency Model |
| :--- | :--- | :--- | :--- | :--- |
| **Vertical Scale-Up** | Medium | Medium | Low | Strong (ACID) |
| **Read Replicas** | High | Low (Single Primary) | Low-Medium | Eventual (Replication Lag) |
| **Database Sharding** | Very High | Very High | High | Complex (Distributed Txns) |
| **NoSQL Distributed Cluster** | Very High | Very High | Medium-High | Eventual / Tunable (Cassandra) |
| **Search Engine Offload** | Extreme | N/A (Reads Only) | Medium | Eventual |

### Critical challenges in database scaling

- **Replication Lag**: Replicas serving stale data when primary writes are delayed.
- **Distributed Transactions**: Cross-shard queries requiring two-phase commit (2PC) or Saga patterns, which incur heavy latency penalties.
- **Schema Migration**: Modifying database schemas across hundreds of distributed shards without locking production tables.

### Key takeaway

Start scaling databases by optimizing indexes and introducing caching, move to read-replicas for read-heavy workloads, and reserve horizontal database sharding for severe write or storage bottlenecks due to its high operational complexity.
