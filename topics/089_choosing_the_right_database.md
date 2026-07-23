# Choosing the Right Database

> **Category:** Databases

---

No single database is best for everything. Pick by **access pattern**, **consistency
needs**, and **scale**.

### Decision tree
```
1. Do you need ACID transactions across rows?
   YES -> Relational (Postgres, MySQL)
   NO  -> continue

2. Is the data highly connected (graph-like)?
   YES -> Graph (Neo4j, Dgraph)
   NO  -> continue

3. Is the workload mostly key lookups?
   YES -> Key-value (Redis, DynamoDB)
   NO  -> continue

4. Flexible / nested schema (JSON)?
   YES -> Document (MongoDB, Couchbase)
   NO  -> continue

5. Massive write volume (events, logs)?
   YES -> Wide-column (Cassandra, HBase)
   NO  -> continue

6. Full-text search / faceted filtering?
   YES -> Search (Elasticsearch, OpenSearch)
   NO  -> continue

7. Time-series?
   YES -> Time-series (InfluxDB, TimescaleDB)
   NO  -> continue

Default: Relational (Postgres)
```

### Comparison table
| DB | Type | Strong for | Weak for |
|----|------|-----------|----------|
| PostgreSQL | Relational | OLTP, ACID, joins | Massive horizontal scale |
| MySQL | Relational | OLTP, simple apps | Advanced analytics |
| MongoDB | Document | Flexible schema | Multi-doc transactions (slower) |
| Redis | Key-value | Cache, sessions | Persistence, complex queries |
| DynamoDB | Key-value | Massive scale, ops-free | Joins, complex queries |
| Cassandra | Wide-column | Time-series, writes | Ad-hoc queries, strong consistency |
| Neo4j | Graph | Relationships | Anything not graph |
| Elasticsearch | Search | Full-text, analytics | Source of truth |
| Snowflake | OLAP | Analytics, BI | OLTP |
| InfluxDB | Time-series | Metrics, sensors | General purpose |

### Polyglot persistence
Most production systems use **multiple** databases:
- Postgres for source of truth.
- Redis for cache.
- Elasticsearch for search.
- S3 for files.
- Kafka for events.

### Key takeaway
Match the database to the **access pattern**, not the hype. Postgres is the right default for
most apps. Add specialized DBs (Redis, ES, Cassandra) when an access pattern demands it.
