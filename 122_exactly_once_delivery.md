# Exactly-Once Delivery

> **Category:** Message Queues and Event Streaming

---

Exactly-once = **each message is delivered once — neither lost nor duplicated.** The holy
grail, but expensive.

### Reality check
True exactly-once is **end-to-end hard**:
- Network can fail at any point.
- Consumer state + broker state must be atomic.
- Most "exactly-once" claims are actually **at-least-once + idempotency**.

### How systems approximate it

#### Kafka transactions
- Producer writes atomically (commit transaction).
- Consumer reads only committed messages (`isolation.level=read_committed`).
- Combined with idempotent producers → effective exactly-once **within Kafka**.

#### Transactions across store + queue (outbox pattern)
- App writes to DB + outbox table in one transaction.
- CDC streams outbox to queue.
- Effectively exactly-once from app's perspective.

#### Consumer-side idempotency
- At-least-once delivery + dedup at consumer.
- Most practical "exactly-once."

### Why it's hard
```
1. Consumer processes message.
2. Consumer updates DB.
3. Consumer ACKs to broker.
4. ACK is lost → broker redelivers → consumer processes again.
```
To prevent: steps 2 + 3 must be atomic. That requires the broker and DB to participate in a
distributed transaction — slow and brittle.

### When you need it
- Financial systems (no double-charges, no missed charges).
- Inventory (don't double-decrement).
- Strict audit requirements.

### Pragmatic approach
- Use at-least-once + **idempotent consumers**.
- Effectively exactly-once, without the distributed transaction overhead.

### Key takeaway
True exactly-once is rare and expensive. Most systems use **at-least-once + idempotency** for
the same effect. Kafka transactions deliver exactly-once within Kafka. For cross-system, the
**outbox pattern** is the practical answer.
