# Foreign Key

> **Category:** Databases

---

A foreign key = **a column (or set of columns) referencing the primary key of another
table**, enforcing referential integrity.

### Purpose
- Ensure every `order.user_id` actually exists in `users.id`.
- Prevent orphaned rows (orders pointing to deleted users).
- Document relationships in the schema itself.

### Syntax
```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total NUMERIC(10,2)
);
```

### ON DELETE / ON UPDATE actions
| Action | Behavior |
|--------|----------|
| `CASCADE` | Delete dependent rows automatically |
| `SET NULL` | Set FK to NULL (must allow NULL) |
| `RESTRICT` | Prevent the delete (error) |
| `NO ACTION` | Same as RESTRICT (default) |
| `SET DEFAULT` | Set FK to its default value |

### Trade-offs
- ✅ **Data integrity** — DB enforces relationships.
- ✅ **Self-documenting** — schema shows the structure.
- ✅ **Optimizer hints** — query planner uses FK info.
- ❌ **Performance** — every insert/update checks the referenced row.
- ❌ **Lock contention** — cascading deletes can lock many rows.
- ❌ **Migrations** — adding/removing FKs on big tables is slow.
- ❌ **Sharding** — cross-shard FKs aren't enforceable.

### When teams skip FKs
- **Sharded databases** — can't enforce cross-shard.
- **Massive write throughput** — FK checks add overhead.
- **Distributed / microservice** — each service owns its DB.
- **Cassandra / DynamoDB** — no FK concept at all.

The trade: enforce integrity in the **application** instead.

### Key takeaway
Foreign keys are essential for **data integrity in a single relational DB**. Use them liberally
in OLTP schemas. Skip them in sharded / distributed / NoSQL systems where integrity moves to the
application.
