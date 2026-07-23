# Primary Key

> **Category:** Databases

---

A primary key = **a column (or set of columns) that uniquely identifies each row** in a
table. Every table should have one.

### Properties
- **Unique** — no two rows share the same PK.
- **NOT NULL** — required.
- **Immutable** (ideally) — changing PKs is painful.
- **Indexed** automatically (clustered index in many DBs).

### Choosing a PK

#### Natural key
Use a real-world identifier (email, SSN, ISBN).
- ✅ Meaningful.
- ❌ Can change (person changes email).
- ❌ May not actually be unique.
- ❌ Privacy concerns.

#### Surrogate key
Auto-generated, meaningless ID.
- ✅ Never changes.
- ✅ Guaranteed unique.
- ✅ Compact (BIGINT, UUID).
- Examples: `BIGSERIAL`, UUID, Snowflake.

### Surrogate ID strategies
| Strategy | Pros | Cons |
|----------|------|------|
| **Auto-increment** (BIGSERIAL) | Compact, ordered | Centralized, hard in sharded |
| **UUID v4** | Globally unique, decentralized | 16 bytes, random order (index fragmentation) |
| **UUID v7 / ULID** | Globally unique + time-ordered | Newer, less tooling |
| **Snowflake** | Time-ordered, decentralized | Needs coordination (worker ID) |
| **Composite** (tenant_id, seq) | Natural for sharding | Wider, app complexity |

### Sharded systems
- Auto-increment doesn't work — each shard would generate the same IDs.
- Use **UUID** or **Snowflake** for global uniqueness without coordination.

### Composite primary keys
```sql
CREATE TABLE enrollments (
    student_id BIGINT,
    course_id BIGINT,
    PRIMARY KEY (student_id, course_id)
);
```
Useful for junction tables. The PK also serves as a uniqueness constraint.

### Key takeaway
Every table needs a PK. Prefer **surrogate keys** (BIGSERIAL, UUID, Snowflake). For distributed
systems, use UUID or Snowflake to avoid coordination. Don't use natural keys that might change.
