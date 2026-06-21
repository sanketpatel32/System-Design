# Maintainability

> **Category:** System Design Basics

---

Maintainability = **how easily the system can be changed** — to fix bugs, add features, scale,
or recover from failure. It's the quiet NFR that dominates long-term cost.

### Three sub-properties (from "Designing Data-Intensive Applications")
1. **Operability** — easy for ops/SRE to keep it running (monitoring, deploy, rollback).
2. **Simplicity** — easy for new engineers to understand (removing accidental complexity).
3. **Evolvability** — easy to change for new requirements.

### Practical enablers
- **Observability**: logs, metrics, traces, dashboards from day one.
- **CI/CD**: every commit deploys to staging; one-click prod rollback.
- **Feature flags**: decouple deploy from release.
- **Versioned APIs**: change contracts without breaking clients.
- **Modular boundaries**: microservices or clean module seams.
- **IaC** (Terraform): infra is repeatable, not hand-crafted.
- **Runbooks**: documented responses to common incidents.

### Anti-patterns
- Tightly coupled "distributed monolith".
- Manual deploy steps.
- Magic constants with no comments.
- One giant schema that everything depends on.

### Key takeaway
Treat maintainability as a **first-class NFR**. A system that's hard to change becomes a
liability — you'll spend more on operations than on features.
