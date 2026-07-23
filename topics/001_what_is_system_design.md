# What is System Design?

> **Category:** System Design Basics

---

System Design is the **process of defining the architecture, components, modules, interfaces,
and data flow** of a system to satisfy specified requirements. It bridges the gap between a vague
product idea ("build Twitter") and a concrete blueprint engineers can build and scale.

### Why it matters
- Production systems serve **millions of users** — a design that works for 100 users can collapse
  at 1M.
- Almost every senior engineering interview tests it.
- It forces you to think about **trade-offs** (consistency vs availability, latency vs cost) before
  writing code.

### The two layers
```
High Level Design (HLD)            Low Level Design (LLD)
--------------------------------   --------------------------------
Boxes & arrows of services         Classes, interfaces, design patterns
Data stores, queues, caches        Object relationships, SOLID principles
Capacity & scalability             API contracts, threading models
"What" the system does             "How" each component is built
```

### Core dimensions you always balance
1. **Scalability** — handle growth in users/data/traffic.
2. **Availability** — stay up (measured in "nines": 99.9%, 99.99%).
3. **Latency** — respond quickly.
4. **Consistency** — every read sees the latest write.
5. **Cost** — don't bankrupt the company.

### Typical interview flow (≈45 min)
1. **Clarify requirements** (5 min) — functional + non-functional.
2. **Back-of-envelope estimation** (5 min) — QPS, storage, bandwidth.
3. **API + data model** (5 min).
4. **High-level diagram** (10 min).
5. **Deep dive** (15 min) — bottleneck, scale, trade-offs.
6. **Wrap up** (5 min) — SLOs, monitoring, failure modes.

### Key takeaway
System Design is less about memorizing tools and more about **structured reasoning under
constraints**. Always start with requirements, draw the simplest thing that works, then defend
every scaling decision.
