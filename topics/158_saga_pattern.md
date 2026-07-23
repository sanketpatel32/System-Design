# Saga Pattern

> **Category:** Distributed Systems

---

A Saga = **a sequence of local transactions, each with a compensating action** to undo on
failure. Replaces distributed transactions in microservices.

### Why
- 2PC is blocking and slow across services.
- Saga sacrifices atomicity for availability.
- Each service transaction commits locally.
- If something fails, run compensations.

### Example: order flow
```
1. Create order        (Order Service)         [compensation: cancel order]
2. Charge payment      (Payment Service)       [compensation: refund]
3. Reserve inventory   (Inventory Service)     [compensation: release]
4. Ship                (Shipping Service)      [compensation: cancel shipment]
```
If step 3 fails: refund (2), cancel order (1).

### Two flavors

#### Choreography (event-driven)
- Each service publishes events.
- Others react.
- No central coordinator.
- Pros: decoupled.
- Cons: hard to follow the flow.

#### Orchestration (central)
- An orchestrator calls each service in order.
- Handles failures, runs compensations.
- Pros: clear flow, easier debugging.
- Cons: orchestrator is a SPOF.

### Trade-offs
| | Saga | 2PC |
|--|------|------|
| Atomicity | Eventual (with compensation) | Strong |
| Availability | High | Low |
| Latency | Low | High |
| Complexity | Compensation logic | Protocol |
| Coupling | Loose | Tight |

### Pitfalls
- **Compensations must be idempotent** (retried).
- **Order of compensation** matters (reverse order).
- **Partial failure** during compensation is hard.
- **Isolation** — intermediate states are visible.

### Real-world
- Most microservices that span multiple services use Saga.
- Temporal, Cadence, AWS Step Functions orchestrate.

### Key takeaway
Saga = **chain of local transactions + compensations**. The microservice alternative to 2PC —
sacrifices atomicity for availability. Use **orchestration** for clarity, **choreography** for
decoupling. Always design idempotent compensations.
