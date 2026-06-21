# Trade-offs in System Design

> **Category:** System Design Basics

---

Every design decision has a cost. System Design is fundamentally **the art of choosing which
problems to have**.

### Classic trade-offs
| Choose | Get | Lose |
|--------|-----|------|
| Strong consistency | Correctness | Latency, availability |
| Eventual consistency | Latency, availability | Stale reads |
| Relational DB | ACID, joins | Horizontal scale ease |
| NoSQL | Scale, schema flexibility | Transactions, joins |
| Sync processing | Simplicity | Throughput, latency |
| Async (queue) | Throughput, decoupling | Operational complexity |
| Microservices | Independent deploys | Network calls, ops overhead |
| Monolith | Simple ops | Tight coupling, scale limits |
| Cache everything | Low latency | Consistency, eviction bugs |
| Strong typing | Safety | Velocity |

### How to talk about them
> "We chose eventual consistency because the cost of strong consistency (a cross-region quorum)
> would push p99 latency above our SLO, and stale reads are acceptable for a feed."

Each sentence: **decision → rationale → accepted cost**.

### Frameworks to think in
- **PACELC** — partition? choose A/C; else choose L/C.
- **ACID vs BASE** — strict vs eventually consistent.
- **Scale cube** — clone / split function / split data.

### Anti-pattern
"There's no trade-off, we just use Kubernetes / Kafka / microservices." Every tool introduces
complexity somewhere. Naming the cost shows maturity.

### Key takeaway
The right answer is rarely "best" — it's **most appropriate**. Justify every choice by the NFRs
and constraints you laid out.
