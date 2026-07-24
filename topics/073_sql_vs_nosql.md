# SQL vs NoSQL

> **Category:** Databases

---

Selecting between **SQL (Relational)** and **NoSQL (Non-Relational)** databases is a fundamental architectural decision. SQL databases emphasize strict structure, ACID transactions, and complex queries via SQL. NoSQL databases prioritize horizontal scalability, flexible schema models, high write throughput, and low-latency key-value lookups.

### System architecture comparison

```
         +-------------------------------------------------------+
         |                    Client Application                 |
         +-------------------------------------------------------+
                     /                                                   /                                       Relational (SQL)                               NoSQL (Document/KV)
            v                                           v
   +-------------------+                       +-------------------+
   | SQL Database Node |                       | Distributed Cluster|
   | (Postgres/MySQL)  |                       | (Mongo/Cassandra) |
   | +---------------+ |                       | +----+ +----+ +----+|
   | | Relational    | |                       | |Node| |Node| |Node||
   | | Tables & FKs  | |                       | +----+ +----+ +----+|
   | +---------------+ |                       |  Horizontal Scale |
   +-------------------+                       +-------------------+
```

### Classification of database engines

NoSQL databases fall into four primary categories, each suited to specific access patterns:

1. **Document Stores (MongoDB, Couchbase)**: Store data in JSON/BSON format. Ideal for hierarchical payloads and flexible schemas.
2. **Key-Value Stores (Redis, DynamoDB)**: O(1) dictionary lookups by primary key. Suited for caching, sessions, and fast lookups.
3. **Wide-Column Stores (Cassandra, HBase)**: Store data in column families partitioned across nodes. Ideal for massive write volumes and time-series data.
4. **Graph Databases (Neo4j, Amazon Neptune)**: Store nodes and edges. Optimized for traversing complex social graphs and recommendation networks.

### SQL vs NoSQL Comparison Matrix

| Feature | Relational Databases (SQL) | Non-Relational Databases (NoSQL) |
| :--- | :--- | :--- |
| **Data Structure** | Structured tables with fixed schemas & types | Flexible (JSON documents, Key-Value, Column Families, Graphs) |
| **Scaling Model** | Primary Vertical (Scale-Up), Read Replicas | Primary Horizontal (Scale-Out Sharding across nodes) |
| **Transactions** | Strict ACID (Atomicity, Consistency, Isolation, Durability) | Eventual Consistency / BASE (Tunable ACID per operation) |
| **Query Language** | Standardized SQL with complex joins & subqueries | Proprietary APIs / Query DSLs (no native JOIN support) |
| **Best Used For** | Financial transactions, ERP, inventory, relational models | High-volume logs, real-time analytics, user sessions, rapid prototyping |

### Selection heuristics

- Choose **SQL** when data integrity is paramount, relationships are complex, schema changes are infrequent, and cross-entity transactions must be atomic.
- Choose **NoSQL** when write rates exceed single-node limits, schema fields evolve rapidly, data access occurs via key-value lookups, and horizontal scalability is a priority.

### Key takeaway

SQL provides strict consistency and complex querying capabilities over structured relational data. NoSQL provides horizontal scaling and schema flexibility at the cost of strict ACID guarantees and complex join capabilities.
