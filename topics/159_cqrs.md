# CQRS

> **Category:** Distributed Systems

---

CQRS (Command Query Responsibility Segregation) is an architectural pattern that **separates data modification operations (Commands) from data read operations (Queries)** into independent models and data stores.

### CQRS Architecture Diagram

```
                                  +-------------------+
                                  | Client App / UI   |
                                  +-------------------+
                                    /                             1. HTTP POST (Command)                 2. HTTP GET (Query)
                                  /                                                    v                     v
                    +-------------------+       +-------------------+
                    | Command Service   |       | Query Service     |
                    +-------------------+       +-------------------+
                              |                           ^
                              v Writes                    | Reads
                    +-------------------+       +-------------------+
                    | Write DB (RDBMS)  |       | Read DB (Elastic/ |
                    | Normalized Schema |       | Redis Cache)      |
                    +-------------------+       +-------------------+
                              |                           ^
                              +---> Async Event Sync -----+
                                   (Kafka Event Stream)
```

### Command vs Query Responsibility Matrix

| Dimension | Command Model (Write Side) | Query Model (Read Side) |
| :--- | :--- | :--- |
| **Primary Task** | Validates business logic, changes state | Renders UI views, returns fast search JSON |
| **Data Schema** | Highly normalized (3NF) relational tables | Denormalized document/search index schemas |
| **Database Engines**| PostgreSQL, MySQL, Oracle | Elasticsearch, MongoDB, Redis |
| **Consistency** | Strong ACID transactions | Eventual consistency via event streams |

### System Design Benefits & Trade-offs

- ✅ **Independent Scalability**: Scale read servers (Elasticsearch) to 100k QPS without overloading transactional write databases.
- ✅ **Optimized Schemas**: Write DB enforces strict integrity; Read DB pre-computes complex joins.
- ❌ **Eventual Consistency Lag**: Read models lag behind write commits while event sync streams process backlog.

### Key takeaway

CQRS maximizes performance by **decoupling transactional write models from read-optimized data stores**, synchronizing them asynchronously via event streams.
