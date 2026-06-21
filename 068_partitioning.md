# Partitioning

> **Category:** Scaling

---

Partitioning = **splitting a logical table into smaller physical pieces**. Can be **within
one DB** (vertical/horizontal partitioning) or **across many DBs** (sharding).

### Two senses of the word
1. **Logical partitioning** (within one DB) — one table split into pieces, transparent to
   queries.
2. **Sharding** — partitioning across separate DB instances (see Sharding topic).

### Types of logical partitioning

#### Horizontal partitioning (by rows)
```
orders_2023  -- rows where year=2023
orders_2024  -- rows where year=2024
orders_2025  -- rows where year=2025
```
- Common for time-series data.
- Drop old partitions instantly (no slow DELETE).
- Each partition can have its own indexes.

#### Vertical partitioning (by columns)
- Split a wide table: hot columns in one table, cold in another.
- E.g. `users_basic (id, name, email)` + `users_profile (id, bio, avatar, ...)`.

### PostgreSQL declarative partitioning
```sql
CREATE TABLE orders (
    id BIGSERIAL,
    created_at TIMESTAMP,
    ...
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Benefits
- **Faster queries** — partition pruning skips irrelevant partitions.
- **Easier maintenance** — drop/archive old partitions.
- **Parallel scans** — each partition scanned in parallel.
- **Smaller indexes** — per-partition indexes fit in RAM.

### Partitioning vs sharding
| | Partitioning | Sharding |
|--|--------------|----------|
| Scope | One DB instance | Multiple DB instances |
| Network | Local | Cross-network |
| Cross-partition transactions | Easy | Hard |
| Use case | Manage large table | Scale beyond one machine |

### Key takeaway
**Partition within a DB** to manage large tables (faster queries, easy archival). **Shard across
DBs** when one machine can't handle the load. They're complementary, not competing.
