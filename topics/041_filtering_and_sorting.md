# Filtering and Sorting

> **Category:** API Design

---

Filtering and sorting let clients narrow down large collections without bespoke endpoints.

### Filtering conventions
```
GET /products?category=electronics&price_min=100&price_max=500
GET /users?role=admin&active=true
GET /orders?status=paid&created_after=2024-01-01
```

### Three styles
1. **Query params per field**: `?status=paid&amount_gt=100` — simple, common.
2. **RSQL / FiQL-style**: `?filter=status==paid;amount>100` — expressive, complex.
3. **GraphQL**: client specifies filters in the query body — most flexible.

### Operators
- Equality: `status=paid`
- In: `status=paid,shipped` (comma-separated)
- Range: `price_min`, `price_max`, or `price=gte:100`
- Date: ISO-8601 (`2024-01-01T00:00:00Z`)

### Sorting
```
GET /users?sort=name            ascending
GET /users?sort=-name           descending (minus prefix)
GET /users?sort=-created_at,name  multi-field
```

### Indexes matter
- Filtering by a non-indexed column scans the whole table → slow.
- Multi-column filters want **composite indexes**.
- Sort columns want indexes too — or in-memory sort blows up.

### Validation
- **Whitelist** allowed filter/sort fields — don't let clients pass arbitrary SQL.
- Bound list sizes (`?in=1,2,...,1000` — max 1000).
- Reject unknown params with 400 (or ignore — be consistent).

### Key takeaway
Filtering and sorting are query-param conventions. Pick a style, whitelist fields server-side
(SQL injection!), and make sure your indexes support the queries clients will actually run.
