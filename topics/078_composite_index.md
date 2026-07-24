# Composite Index

> **Category:** Databases

---

A **Composite Index** (also known as a concatenated or multi-column index) is an index built on multiple columns of a database table. Composite indexes optimize queries that filter, join, or sort on multiple attributes simultaneously.

### Leftmost Prefix Rule architecture

```
                     Composite Index Key: (Country, City, Age)
                                        |
                 +----------------------+----------------------+
                 |                                             |
     Queries that USE the index:                  Queries that CANNOT use index:
     - WHERE Country = 'USA'                      - WHERE City = 'NYC'
     - WHERE Country = 'USA' AND City = 'NYC'     - WHERE Age = 30
     - WHERE Country = 'USA' AND City = 'NYC'     - WHERE City = 'NYC' AND Age = 30
       AND Age = 30                               (Violates Leftmost Prefix Rule)
```

### The Leftmost Prefix Rule

Database query optimizers utilize composite indexes based on the **Leftmost Prefix Rule**: an index defined on columns `(A, B, C)` can serve queries filtering by:
- `A`
- `A, B`
- `A, B, C`

However, the index **cannot** optimize queries filtering strictly by `B`, `C`, or `B, C` because the index keys are sorted primarily by column `A`, secondarily by `B`, and tertiarily by `C`.

### Column ordering strategies

1. **Equality columns first**: Place columns evaluated with equality conditions (`=`) before range conditions (`>`, `<`, `LIKE`). Range conditions prevent subsequent index columns from being utilized for index lookups.
2. **High-Cardinality first**: Place columns with high selectivity (large number of distinct values) earlier in the index prefix.
3. **Covering Queries**: Include selected output columns at the tail of the index to enable **Covering Index** execution, eliminating physical table lookups.

### Single-Column vs Composite Index Matrix

| Query Pattern | Two Separate Indexes on `(A)` and `(B)` | Single Composite Index on `(A, B)` |
| :--- | :--- | :--- |
| **`WHERE A = 1 AND B = 2`** | Moderately fast (Requires index merge step) | Extremely fast (Direct single-pass traversal) |
| **`WHERE A = 1 ORDER BY B`**| Slow (Requires filesort for B) | Fast (Results pre-sorted by B within A) |
| **`WHERE A = 1`** | Fast | Fast (Uses Leftmost Prefix) |
| **`WHERE B = 2`** | Fast | Unusable (Index skipped) |

### Key takeaway

Design composite indexes based on query access patterns, following the Leftmost Prefix Rule. Order columns by putting equality filters first, range filters second, and high-cardinality attributes early in the key list.
