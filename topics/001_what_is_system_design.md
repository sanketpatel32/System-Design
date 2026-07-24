# What is System Design?

> **Category:** System Design Basics

---

System Design is the **structured architectural process of defining software components, modules, interfaces, data pipelines, and storage engines** to satisfy specified business and technical requirements. It bridges the gap between high-level product vision ("build a global video streaming platform") and actionable blueprint design that engineers can build, scale, and maintain under real-world constraints.

### Core System Design Pillars

```
+-----------------------------------------------------------------------+
|                         SYSTEM DESIGN PROCESS                         |
+-----------------------------------------------------------------------+
        |                                                 |
        v                                                 v
+-------------------------------+               +-------------------------------+
|  Functional Requirements      |               |  Non-Functional Requirements  |
|  - User Features & Workflows  |               |  - Scalability & Latency      |
|  - API Endpoint Definitions   |               |  - Availability & Consistency |
|  - Core Data Models           |               |  - Security & Cost Control    |
+-------------------------------+               +-------------------------------+
        |                                                 |
        +-----------------------+-------------------------+
                                |
                                v
+-----------------------------------------------------------------------+
|                        ARCHITECTURE BREAKDOWN                         |
+-----------------------------------------------------------------------+
|  +-------------------+   +--------------------+   +----------------+  |
|  | Client & Edge     |-->| Application Layer  |-->| Storage Layer  |  |
|  | (DNS, CDN, LB)    |   | (Services, Cache)  |   | (SQL, NoSQL)   |  |
|  +-------------------+   +--------------------+   +----------------+  |
+-----------------------------------------------------------------------+
```

### High-Level Design (HLD) vs. Low-Level Design (LLD)

System design operates at two distinct abstraction layers, both required to build production systems.

| Dimension | High-Level Design (HLD) | Low-Level Design (LLD) |
| :--- | :--- | :--- |
| **Focus** | Overall architecture, macro components, system boundaries | Micro component internals, class hierarchies, design patterns |
| **Artifacts** | Architecture diagrams, data flow charts, technology stack selection | Class diagrams, sequence diagrams, API contracts, DB schemas |
| **Scope** | Services, Load Balancers, Caches, Message Queues, Databases | Data structures, algorithms, interface definitions, threading |
| **Target Audience** | Solutions Architects, Engineering Directors, Tech Leads | Senior Engineers, Developers, Code Reviewers |
| **Primary Goal** | Scalability, fault tolerance, cost management, availability | Code maintainability, extensibility, modularity, readability |

### The System Design Framework for Interviews

1. **Requirement Clarification (5-7 mins)**: Define functional scope (what to build) and non-functional requirements (throughput, latency, SLAs, storage bounds).
2. **Back-of-the-Envelope Estimation (5 mins)**: Calculate QPS (queries per second), peak bandwidth, storage footprint over 5 years, and memory caching needs.
3. **API & Data Model Design (5-8 mins)**: Specify REST/gRPC endpoints, core database schema, primary keys, and indexing strategy.
4. **High-Level System Architecture (10-15 mins)**: Draw core services, database sharding, caching tiers, message brokers, and load balancing layers.
5. **Deep Dive & Bottlenecks (10 mins)**: Address single points of failure (SPOFs), race conditions, data consistency models, partition handling, and tail latencies.
6. **Observability & Edge Cases (3-5 mins)**: Detail logging, metric alerting, distributed tracing, rate limiting, and graceful degradation.

### Key Trade-offs in System Engineering

- **Latency vs. Throughput**: Optimizing for high throughput often requires batching, which increases individual request latency.
- **Consistency vs. Availability**: Enforcing strong consistency across distributed nodes limits availability during network splits (CAP theorem).
- **Read Heavy vs. Write Heavy**: Read-heavy workloads benefit from aggressive caching and read replicas, whereas write-heavy systems require append-only logs, message queues, and LSM-tree storage engines.

### Key takeaway

System Design is not about memorizing specific frameworks, but mastering **structured trade-off analysis under real-world constraints**. Always clarify functional requirements first, establish numeric scaling bounds, draw a minimal working system, and systematically iterate to resolve performance bottlenecks and failure modes.
