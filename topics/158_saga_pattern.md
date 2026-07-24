# Saga Pattern

> **Category:** Distributed Systems

---

The Saga Pattern manages **distributed transactions across microservices as a sequence of local transactions**. If any local step fails, the Saga executes a series of **compensating transactions** to roll back prior state changes.

### Choreography vs Orchestration Architecture

```
Choreography (Event-Driven):
[Order Service] --- OrderCreated ---> [Payment Service] --- PaymentCharged ---> [Inventory Service]
       ^                                     | (Fails!)                                 |
       +--- CancelOrder <--- PaymentFailed --+                                          v

Orchestration (Central Coordinator):
                               +-----------------------+
                               | Saga Orchestrator     |
                               +-----------------------+
                                   |       ^       |
                     1. CreateOrder|       |       | 3. Charge (Fails!)
                                   v       |       v
                             +---------------------------+
                             | Services (Order / Payment)|
                             +---------------------------+
                                   |
                                   v 4. Execute Compensating Rollback (Cancel Order)
```

### Saga Execution Modes Matrix

| Variant | Control Flow | Coupling Level | Complexity | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Choreography** | Decoupled Pub/Sub Events | Extremely Low | Hard to trace workflows | Simple 2-3 step microservice pipelines |
| **Orchestration**| Centralized State Controller | Low-Medium | Easy to visualize and audit | Complex enterprise e-commerce checkout flows |

### Forward & Backward Recovery

- **Forward Recovery**: Retries a failed transaction step until it succeeds (used when failure is transient).
- **Backward Recovery (Compensating Transactions)**: Executes explicit undo actions (e.g., `RefundPayment`, `ReleaseInventory`) in reverse order when a step fails permanently.

### Key takeaway

The Saga pattern replaces blocking locks with **local transactions and compensating actions**, achieving eventual consistency across decoupled microservices.
