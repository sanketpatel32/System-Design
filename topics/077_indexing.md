# Indexing

> **Category:** Databases

---

An index = **a separate data structure that makes lookups on a column fast**, at the cost of
slower writes and extra storage.

### Without vs with an index
```sql
SELECT * FROM users WHERE email = 'alice@x.com';
-- No index: scan every row. O(n).
-- With index on email: look up in O(log n).
```

### How indexes work
- Most DBs use **B-trees** (balanced trees).
- Some use **hash indexes** (only equality), **GIN/GIST** (Postgres extensions), **LSM trees**
  (Cassandra).

### What to index
- Columns in **WHERE** clauses.
- Columns used for **JOIN** (`ON a.id = b.a_id`).
- Columns in **ORDER BY** / **GROUP BY**.
- **Foreign keys** (often not auto-indexed — do it manually).

### When indexes hurt
- **Writes** — every INSERT/UPDATE/DELETE updates all indexes.
- **Small tables** — sequential scan may be faster.
- **High-churn tables** — index maintenance overhead.
- **Low-selectivity columns** (e.g. boolean) — index rarely used.

### Types
| Type | Use |
|------|-----|
| B-tree | Default, range + equality |
| Hash | Equality only |
| Composite | Multiple columns (order matters!) |
| Partial | `WHERE active = true` subset |
| Covering (INCLUDE) | Stores extra cols to avoid table lookup |
| Unique | Enforces uniqueness + index |
| Full-text | Text search (tsvector) |

### EXPLAIN is your friend
```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'x';
-- Shows the plan: seq scan vs index scan, cost, rows.
```

### Key takeaway
Index for your **queries**, not your schema. Every index speeds reads but slows writes.
Measure with `EXPLAIN ANALYZE`. Don't index low-selectivity columns. Composite indexes are
powerful but column order matters.
