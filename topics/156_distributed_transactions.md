# Distributed Transactions

> **Category:** Distributed Systems

---

A distributed transaction = **a transaction that spans multiple services or databases**,
needing atomicity across them.

### The problem
- Transfer $100: debit in Account Service (Postgres), credit in Ledger Service (separate DB).
- Both must succeed, or both must roll back.

### Two broad approaches

#### 1. Two-Phase Commit (2PC)
- Coordinator asks all participants to "prepare."
- If all yes: "commit." If any no: "abort."
- Synchronous, strong, slow, blocking.

#### 2. Saga pattern
- Break into a sequence of local transactions.
- Each step has a **compensating action** (undo).
- If any step fails, run compensations to roll back.
- Asynchronous, eventual, more available.

### Other approaches

#### Outbox pattern
- Write business data + event to same DB (atomic).
- CDC streams event to message broker.
- Effectively-once delivery across systems.

#### Transactional outbox + idempotent consumer
- App writes order + "publish event" row in one transaction.
- Worker reads outbox, publishes to Kafka.
- Consumer dedups by event ID.

### Trade-offs
| | 2PC | Saga |
|--|-----|------|
| Consistency | Strong | Eventual |
| Latency | High (synchronous) | Lower (async) |
| Availability | Low (blocking) | High |
| Complexity | Protocol-heavy | Compensation logic |
| Use case | Single-DB mostly | Microservices |

### Real-world
- Most microservice systems use **Saga** (or outbox) for cross-service transactions.
- 2PC used within a single distributed DB (CockroachDB, Spanner).

### Why 2PC is rare
- Blocking: if coordinator dies, participants hang.
- Slow: multiple round trips.
- Fragile: many failure modes.
- Couples services.

### Key takeaway
Cross-service atomicity is hard. Prefer **Saga + outbox** for microservices (eventual, available).
Reserve **2PC** for within a single distributed DB. Design every step with a compensating
action.
