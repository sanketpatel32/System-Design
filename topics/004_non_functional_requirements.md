# Non-Functional Requirements

> **Category:** System Design Basics

---

Non-Functional Requirements (NFRs) define **how well a system operates**. While functional requirements define specific features, NFRs specify quality attributes, system performance constraints, operational targets, security bounds, and SLA targets.

### The Non-Functional Requirement Trade-Off Spectrum

```
+-------------------------------------------------------------------------+
|                  NON-FUNCTIONAL REQUIREMENT MATRIX                      |
+-------------------------------------------------------------------------+
|                                                                         |
|         [ Latency ] <---------- Trade-off ----------> [ Consistency ]   |
|     Fast response (<100ms)                       Strong ACID Guarantees |
|                                                                         |
|      [ Availability ] <-------- Trade-off ----------> [ Partitioning ]  |
|     High Uptime (99.99%)                          Distributed Split     |
|                                                                         |
|         [ Throughput ] <------- Trade-off ----------> [ Resource Cost ] |
|     100k QPS Processing                          Cloud Spending         |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Core NFR Categories & SLA Definitions

| Metric / Quality Attribute | Definition | Typical Industry SLA / Standard Target |
| :--- | :--- | :--- |
| **Availability** | Percentage of operational time system responds to requests. | 99.99% ("Four Nines" = 52.6 min downtime/yr) |
| **Latency** | Time taken to process a single request end-to-end. | p99 < 200ms, p50 < 20ms |
| **Throughput** | Volume of work processed per unit of time. | Read: 50,000 QPS, Write: 5,000 QPS |
| **Durability** | Guarantee that saved data will not be lost or corrupted. | 99.999999999% (11 Nines for S3 storage) |
| **Fault Tolerance** | Ability to continue functioning despite component failures. | Zero downtime during single AZ failure |
| **Security & Compliance**| Protection of sensitive data in transit and at rest. | TLS 1.3, AES-256, GDPR / SOC2 compliance |

### The CAP & PACELC Connection
Non-functional requirements cannot all be maximized simultaneously. Architectural tradeoffs must be explicitly engineered:
- **CAP Theorem**: In the presence of a network partition (**P**), a system must trade off between Consistency (**C**) and Availability (**A**).
- **PACELC Theorem**: **If** there is a Partition (**P**), choose Availability (**A**) vs Consistency (**C**); **Else** (**E**), choose Latency (**L**) vs Consistency (**C**).

### Quantifying NFRs in System Design
- Avoid vague statements like "the system must be fast and highly available."
- Use quantifiable metrics: "p99 read latency under 50ms at 20,000 QPS with 99.99% availability."

### Key takeaway

Non-Functional Requirements determine the **operational success and scalability bounds** of an architecture. Always define measurable metrics (p99 latency, nines of availability, data durability) and explicitly state the engineering tradeoffs accepted to achieve them.
