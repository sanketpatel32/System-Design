# SQL vs NoSQL

> **Category:** Databases

---

The fundamental database choice. SQL (relational) vs NoSQL (non-relational) — each optimized
for different access patterns.

### SQL (relational)
- **Schema**: rigid, table-based, schema-on-write.
- **Query**: SQL (declarative, joins, transactions).
- **ACID**: yes (Postgres, MySQL, Oracle).
- **Scale**: vertical → read replicas → sharding (hard).
- **Examples**: PostgreSQL, MySQL, SQL Server, Oracle.

### NoSQL families
| Family | Examples | Best for |
|--------|----------|----------|
| **Key-value** | Redis, DynamoDB, Riak | Simple lookups, sessions, caches |
| **Document** | MongoDB, Couchbase | Flexible schemas, nested data |
| **Wide-column** | Cassandra, HBase, DynamoDB | Time-series, write-heavy, massive scale |
| **Graph** | Neo4j, Dgraph | Relationships (social, fraud) |
| **Search** | Elasticsearch, Solr | Full-text, analytics |

### Comparison
| | SQL | NoSQL |
|--|-----|-------|
| Schema | Rigid | Flexible |
| Joins | Excellent | Limited / absent |
| Transactions | ACID | Often BASE / eventual |
| Scale | Vertical-first | Horizontal-first |
| Consistency | Strong | Tunable / eventual |
| Query language | SQL | Varies (some have SQL-ish) |
| Schema evolution | Migrations | Add fields freely |

### Choosing
| Use case | Pick |
|----------|------|
| Financial / transactional | SQL (ACID required) |
| CRUD app with relationships | SQL |
| Sessions, leaderboards, rate limits | Redis |
| User profiles with varying shape | MongoDB |
| Massive write-heavy logs/events | Cassandra |
| Recommendation graph | Neo4j |
| Search | Elasticsearch |

### The pragmatic truth
Most production systems use **both**: SQL for the source of truth, NoSQL (Redis, ES) for
specific access patterns.

### Key takeaway
Pick by **access pattern and consistency needs**, not hype. SQL for ACID and relationships;
NoSQL when you need massive horizontal scale, flexible schemas, or specialized access (cache,
graph, search). Polyglot persistence is the norm.
