# Normalization

> **Category:** Databases

---

Normalization = **organizing tables to reduce redundancy and dependency**, following normal
forms (1NF, 2NF, 3NF, BCNF).

### Why
- **Avoid anomalies**: insert / update / delete problems caused by redundancy.
- **Save space**: store each fact once.
- **Maintain integrity**: change a fact in one place.

### The normal forms

#### 1NF: atomic values
Each column holds **one value per row**.
```
BAD:  user | phones
      alice | "123,456,789"        -- multi-valued cell
GOOD: user | phone
      alice | 123
      alice | 456
```

#### 2NF: no partial dependency
Non-key columns depend on the **whole** primary key (relevant for composite keys).
```
BAD:  (student_id, course_id) -> student_name   -- student_name depends only on student_id
GOOD: student_name lives in students table, not enrollments.
```

#### 3NF: no transitive dependency
Non-key columns don't depend on other non-key columns.
```
BAD:  order_id -> customer_id -> customer_name   -- customer_name transitively dependent
GOOD: customer_name lives in customers table.
```

#### BCNF (3.5NF)
Stricter version of 3NF. Every determinant must be a candidate key.

### Trade-offs
- ✅ **Integrity** — no anomalies.
- ✅ **Space** — minimal redundancy.
- ❌ **Joins** — normalized schemas need many joins → slow queries.
- ❌ **Complexity** — many tables.

### When to denormalize
- **Read-heavy** paths where joins hurt.
- **Reporting / OLAP** — denormalized star schemas are typical.
- **Materialized views** — denormalize selectively, refresh periodically.

### Key takeaway
Normalize to 3NF for OLTP schemas (integrity, no anomalies). Denormalize selectively for hot
read paths. Don't over-normalize — the join cost on read may exceed the savings on write.
