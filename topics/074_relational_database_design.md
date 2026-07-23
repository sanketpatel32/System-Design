# Relational Database Design

> **Category:** Databases

---

Relational DB design = **modeling data as tables (relations) with rows and columns**,
following normalization rules and integrity constraints.

### Core concepts
- **Table** (relation): a set of rows, each with the same columns.
- **Row** (tuple): one record.
- **Column** (attribute): one field with a type.
- **Primary key**: uniquely identifies a row.
- **Foreign key**: references a row in another table.
- **Index**: speeds up queries on a column.

### Design steps
1. **Identify entities** (User, Order, Product).
2. **Identify relationships** (one-to-many, many-to-many).
3. **Create a table per entity**.
4. **Add foreign keys** for relationships.
5. **Junction tables** for many-to-many.
6. **Normalize** (1NF, 2NF, 3NF).
7. **Add indexes** for query patterns.
8. **Denormalize selectively** for performance.

### Example: e-commerce
```
users (id PK, name, email)
orders (id PK, user_id FK, total, created_at)
products (id PK, name, price)
order_items (id PK, order_id FK, product_id FK, qty, price)
```

### Data types (Postgres)
- `BIGSERIAL` auto-incrementing ID.
- `VARCHAR(n)`, `TEXT`.
- `INTEGER`, `BIGINT`, `NUMERIC(p,s)`.
- `TIMESTAMP`, `DATE`.
- `BOOLEAN`.
- `JSONB` (indexed JSON for semi-structured).
- `UUID` for globally unique IDs.

### Constraints
- `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`.
- `FOREIGN KEY ... REFERENCES ...` with `ON DELETE CASCADE` / `SET NULL`.

### Indexing strategy
- Index columns used in `WHERE`, `JOIN`, `ORDER BY`.
- Don't over-index (slows writes).
- Composite indexes for multi-column filters.

### Key takeaway
Model entities as tables, relationships as foreign keys, many-to-many via junction tables.
Normalize for correctness; denormalize selectively for hot paths. Index for the queries you
actually run.
