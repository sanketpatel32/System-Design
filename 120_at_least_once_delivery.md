# At-Least-Once Delivery

> **Category:** Message Queues and Event Streaming

---

At-least-once = **the message will definitely be delivered, but possibly more than once.**

### How it works
- Broker persists the message.
- Consumer ACKs after processing.
- If ACK is lost (network, crash), broker redelivers.

### Trade-off
- ✅ **No message loss** (durable + redelivery).
- ❌ **Duplicates** possible → consumers must be idempotent.

### When to use
- Most common delivery semantic.
- When losing a message is worse than duplicates.
- Notifications, emails, analytics.

### Examples
- **SQS standard**: at-least-once (some duplicates).
- **Kafka** default: at-least-once (consumers must be idempotent).
- **RabbitMQ**: at-least-once with manual ACK.

### How to make safe
- Make consumers idempotent (idempotency key).
- DB unique constraints.
- State machine rejects out-of-order / duplicate transitions.

### Failure scenarios
- Consumer crashes after processing, before ACK → redelivered → processed again.
- Network drops ACK → redelivered.
- Broker restarts after write, before replication → potential loss (mitigated with sync
  replication).

### Key takeaway
At-least-once is the **pragmatic default** — no loss, but possible duplicates. Design consumers
to be **idempotent** so duplicates are harmless. Most systems (Kafka, SQS, RabbitMQ) work this
way.
