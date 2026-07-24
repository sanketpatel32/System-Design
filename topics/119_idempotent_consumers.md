# Idempotent Consumers

> **Category:** Message Queues and Event Streaming

---

An **Idempotent Consumer** is a consumer application that produces the exact same system state regardless of how many times it processes the same duplicate message payload. In distributed systems with **At-Least-Once** delivery guarantees, idempotency is essential for preventing duplicate operations (e.g., charging a user twice for an order).

### Idempotent deduplication architecture

```
                     +-----------------------------------+
                     | Incoming Event (`Msg_ID: 998877`) |
                     +-----------------------------------+
                                       |
                                       v
                     +-----------------------------------+
                     |  Check Deduplication Table (DB)   |
                     |  `SELECT 1 FROM processed_ids`    |
                     +-----------------------------------+
                                  /         \
                  Already Exists /           \ First Time Seeing ID
                                v             v
                    +---------------+     +-------------------------------+
                    | Ignore Msg /  |     | 1. Execute Payment Operation  |
                    | Return ACK    |     | 2. Insert `Msg_ID` into DB    |
                    +---------------+     +-------------------------------+
                                          | 3. Return ACK                 |
                                          +-------------------------------+
```

### Implementation techniques

1. **Natural Unique Keys**: Use database unique constraints (`UNIQUE KEY`) on business identifiers (e.g., `payment_transaction_id`). Duplicate insertions trigger a unique constraint violation and are safely ignored.
2. **Distributed Deduplication Store**: Track processed message IDs in Redis or database tables. The consumer checks the store before processing, skipping execution if the ID is already present.
3. **Idempotent API Mutations**: Design operations using idempotent HTTP methods (`PUT`, `DELETE`) or pass unique idempotency keys in headers (`Idempotency-Key: uuid`).

### Idempotency Pattern Comparison

| Technique | Mechanism | Pros | Cons / Challenges |
| :--- | :--- | :--- | :--- |
| **Unique DB Constraints**| Database schema `UNIQUE` index | Absolute integrity guaranteed by database engine | Restricted to relational database writes |
| **Deduplication Key Store**| Checking Redis/DynamoDB for `Message_ID` | Fast, works across any service or storage engine | Distributed race conditions require atomic locks |
| **State Machine Guard** | Condition check (`WHERE status = 'PENDING'`) | Prevents invalid state transitions | Requires stateful tracking in entity tables |

### Key takeaway

Idempotent consumers guarantee safety under at-least-once message delivery. Use unique database constraints, distributed deduplication stores, or state machine checks to prevent duplicate message processing.
