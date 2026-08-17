# Saga Pattern

> **Category:** Distributed Systems

---

The Saga pattern manages **distributed transactions across microservices as a sequence of local transactions**. Each local transaction updates the database within a single service and publishes an event or message to trigger the next local transaction in the saga. If a local transaction fails, the saga executes a series of **compensating transactions** in reverse order to undo changes.

### Saga Architecture: Orchestrated vs Choreographed

Sagas avoid distributed database locks by executing local transactions sequentially and relying on compensating workflows for failure recovery.

```
Orchestrated Saga Architecture:
+----------------------------------------------------------------------------------------------------+
|                                      Saga Orchestrator Service                                     |
+----------------------------------------------------------------------------------------------------+
     |                        ^                       |                       ^
  1. Execute Order         2. Success             3. Execute Payment       4. Payment FAILED!
     v                        |                       v                       |
+------------------+ +------------------+   +------------------+ +------------------+
| Order Service    | | Order DB         |   | Payment Service  | | Payment DB       |
| (Local Tx 1 OK)  | | (Order Created)  |   | (Tx 2 Fails!)    | | (Insufficient) |
+------------------+ +------------------+   +------------------+ +------------------+
     ^                                                                        |
     |                     5. Trigger Compensating Action                     |
     +------------------------------------------------------------------------+
       - Executes `CancelOrder()` to undo Local Tx 1! State restored eventually!
```

### Orchestration vs Choreography Matrix

| Aspect | Orchestrated Saga | Choreographed Saga |
| :--- | :--- | :--- |
| **Control Model** | Central Saga Orchestrator directs execution flow | Decentralized; services listen to event bus topics |
| **Coupling** | Services coupled to Orchestrator commands | Loosely coupled via domain events |
| **Visibility** | High (Orchestrator tracks state in one place) | Low (Saga state is distributed across services) |
| **Complexity** | Centralized coordinator logic | Harder to debug and trace circular dependency chains |
| **Best Fit** | Complex workflows with many steps | Simple workflows with 2-4 microservices |

### Forward Recovery vs Compensating Transactions

- **Compensating Transaction (Cᵢ)**: Undoes the semantic effect of local transaction Tᵢ (e.g. `RefundPayment` compensates `ChargePayment`). Compensating operations must be **idempotent and retryable**.
- **Forward Recovery**: If a transient failure occurs (e.g. service timeout), the saga retries the failed step until success rather than triggering compensation.

### Key Trade-offs & Isolation Challenges

- ✅ **High Scalability & Performance**: Eliminates long-held distributed database locks present in 2PC.
- ❌ **Lack of Isolation (ACID 'I')**: Intermediate uncommitted states are visible to external systems. Applications must handle anomalies like dirty reads using counter-measures (e.g. semantic locking states like `PENDING_APPROVAL`).
### Choreographed Saga Implementation Event Flow

```
1. Order Service creates Order in `PENDING` state -> Emits `OrderCreatedEvent`
2. Payment Service consumes `OrderCreatedEvent` -> Charges Credit Card -> Emits `PaymentProcessedEvent`
3. Inventory Service consumes `PaymentProcessedEvent` -> Discovers Item Out of Stock!
   -> Emits `InventoryAllocationFailedEvent`
4. Payment Service consumes Failure -> Executes Compensating Action `RefundPayment()`
5. Order Service consumes Failure -> Updates Order state to `CANCELLED`
```

### Rules for Designing Compensating Transactions

1. **Idempotency**: Compensating actions must be idempotent; retrying a refund 5 times must only yield 1 refund.
2. **Cannot Fail Unrecoverably**: Compensating steps must be guaranteed to eventually succeed via retries.

### Key takeaway

The Saga pattern breaks distributed transactions into **sequential local transactions coordinated via events or an orchestrator**, using idempotent compensating transactions to undo partial failures.
