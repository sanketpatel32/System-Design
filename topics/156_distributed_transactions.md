# Distributed Transactions

> **Category:** Distributed Systems

---

A Distributed Transaction executes operations across **multiple distinct databases, microservices, or network partitions**, ensuring ACID properties across all participating nodes.

### Distributed Transaction Architecture

```
+-----------------------------------------------------------------------------------+
|                           Transaction Coordinator                                 |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                | 2-Phase Commit / Saga Orchestration               |
                v                                                   v
    +-----------------------+                           +-----------------------+
    | Order Service DB      |                           | Payment Service DB    |
    | (SQL Transaction A)   |                           | (SQL Transaction B)   |
    +-----------------------+                           +-----------------------+
```

### Distributed Transaction Patterns Matrix

| Approach | Consistency | Isolation Level | Latency | Resilience | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Two-Phase Commit (2PC)** | Immediate (ACID) | Strict / Serializable | High (Locking) | Fragile to Coordinator failure | RDBMS Cross-Shard Transactions |
| **Saga Orchestration** | Eventual (BASE) | Read Committed (No Lock) | Low | Resilient with Compensating Actions| Microservice Workflows |
| **Three-Phase Commit (3PC)**| Immediate (ACID) | Strict | Very High | Handles Coordinator crashes | Specialized Telecom Systems |

### Key System Challenges

- **Dual Writes Problem**: Updating a database and pushing to a message queue in one block can fail halfway. Mitigated via the **Transactional Outbox Pattern**.
- **Performance Overhead**: Long-held distributed locks decrease system throughput exponentially as node counts grow.

### Key takeaway

Prefer **eventually consistent Saga patterns** for modern microservices, reserving heavy Two-Phase Commit (2PC) protocols for tight single-database shard transactions.
