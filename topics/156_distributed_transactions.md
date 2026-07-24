# Distributed Transactions

> **Category:** Distributed Systems

---

A distributed transaction is a set of **database operations executed across multiple independent databases, microservices, or network partitions** that must collectively satisfy ACID guarantees (Atomicity, Consistency, Isolation, Durability). The primary challenge is ensuring **Atomicity**: either all operations commit successfully across all nodes, or all operations roll back completely.

### Distributed Transaction Across Microservices Architecture

Executing a payment transaction across decoupled Payment, Inventory, and Order microservices requires distributed transaction coordination.

```
                                +---------------------------+
                                |  Order Checkout Gateway   |
                                +---------------------------+
                                  /           |                               1. Create Order     2. Reserve Credit    3. Deduct Stock
                                 /            |                                            v             v             v
                      +---------------+ +---------------+ +---------------+
                      | Order DB      | | Payment DB    | | Inventory DB  |
                      | (PostgreSQL)  | | (DynamoDB)    | | (MySQL)       |
                      +---------------+ +---------------+ +---------------+
                                \             |             /
                                 +------------+------------+
                                 Must Commit ALL or Rollback ALL!
```

### Distributed Transaction Patterns Comparison Matrix

| Pattern | Coordination Mechanism | Consistency Model | Isolation Level | Complexity | Best Fit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Two-Phase Commit (2PC)** | Centralized Coordinator (Prepare/Commit) | Strong (Immediate Linearizable) | Strict (Holds locks) | High (Blocking risk) | Monolithic RDBMS sharding |
| **Saga Pattern (Orchestrated)**| Central Orchestrator + Compensating Transactions | Eventual Consistency | Local Isolation Only | Moderate | Microservice workflows |
| **Saga Pattern (Choreographed)**| Event-Driven Pub/Sub Messages | Eventual Consistency | Local Isolation Only | Moderate | Event-driven microservices |
| **Transactional Outbox** | Database Table + CDC Log Relay | At-Least-Once Delivery | Local DB Isolation | Low | Microservice event publishing |

### Key Challenges in Distributed Transactions

1. **Dual-Write Problem**: Writing to a database and publishing a message queue event in a single HTTP request can fail halfway, leaving systems in an inconsistent state.
2. **Partial Network Failures**: If Database 1 and Database 2 commit, but Database 3 drops off the network, the overall transaction atomicity is violated.
3. **Lack of Isolation (Dirty Reads)**: Unlike single-node RDBMS transactions, distributed Sagas expose intermediate uncommitted state to external queries until compensating actions complete.

### Key Trade-offs & Architecture Direction

- Avoid 2PC in high-scale cloud-native architectures due to distributed lock blocking latencies.
- Embrace **Saga Patterns with Compensating Transactions** for long-running microservice business processes.
### Transactional Outbox Pattern Architecture

To safely mutate a database and publish an event to Kafka without dual-write inconsistency:

```
+----------------------------------------------------------------------------------------------------+
| Local Relational Database Transaction (PostgreSQL)                                                 |
|                                                                                                    |
|  BEGIN TRANSACTION;                                                                                |
|  INSERT INTO orders (id, user_id, amount) VALUES (101, 'usr_55', 99.00);                            |
|  INSERT INTO outbox_events (id, aggregate_type, payload)                                           |
|       VALUES (uuid(), 'ORDER', '{"order_id": 101, "event": "ORDER_CREATED"}');                     |
|  COMMIT;                                                                                           |
+----------------------------------------------------------------------------------------------------+
                                                  |
                     CDC Relay Worker (Debezium / Tailer) Reads Outbox Table
                                                  v
+----------------------------------------------------------------------------------------------------+
| Message Broker (Apache Kafka Topic: `order-events`)                                               |
+----------------------------------------------------------------------------------------------------+
```

### Key takeaway

Distributed transactions ensure **atomic cross-service state changes** using either synchronous blocking protocols (2PC) for strong consistency or asynchronous compensating workflows (Sagas) for eventual consistency.
