# Composite Index

> **Category:** Databases

---

A composite index = **an index on multiple columns**. Crucial for queries that filter by
more than one field.

### Syntax
```sql
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

### The golden rule: **column order matters**
The index is useful for queries that filter **left-to-right** on its columns.

```sql
-- Index: (user_id, status)

WHERE user_id = 1                       -- ✅ uses index
WHERE user_id = 1 AND status = 'PAID'   -- ✅ uses index fully
WHERE status = 'PAID'                   -- ❌ index NOT usable (leftmost missing)
WHERE user_id = 1 AND total > 100       -- ⚠️ partial use (user_id part only)
```

### Analogy
Think of a phone book sorted by (LastName, FirstName):
- Find all "Smith" — works.
- Find all "Smith, John" — works.
- Find all "John" (any last name) — must scan the whole book.

### When to use
- Multi-column filters (`WHERE a = ? AND b = ?`).
- Filter + sort (`WHERE user_id = ? ORDER BY created_at`).
- Covering index (add columns to avoid table lookup).

### Selectivity rule of thumb
- Order columns from **most selective to least** *if no range condition*.
- For range conditions, put equality columns first, then the range.

### Example: orders
```sql
-- Most queries: WHERE user_id = ? AND status = ?
-- user_id is highly selective (millions of distinct).
-- status has few values (PAID, SHIPPED, ...).
-- So (user_id, status) is correct.
```

### Covering index
```sql
CREATE INDEX idx ON orders(user_id) INCLUDE (total, status);
-- Query SELECT total FROM orders WHERE user_id = 1 can be served
-- entirely from the index, without touching the table.
```

### Key takeaway
Composite indexes follow **leftmost-prefix** rule: a query must filter on the leading columns.
Put selective/equality columns first, range/sort columns after. Use covering indexes for hot
queries.
