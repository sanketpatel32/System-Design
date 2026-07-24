# Filtering and Sorting

> **Category:** API Design

---

**Filtering, Sorting, and Searching** enable API consumers to query specific subsets of collection data without transferring unnecessary records over the network. Designing intuitive query parameter conventions balances client flexibility with backend database indexing efficiency.

### Query Processing & Index Execution Pipeline

```
+-------------------------------------------------------------------------+
|                  QUERY PROCESSING & INDEX EXECUTION                     |
+-------------------------------------------------------------------------+

  Client Query: GET /v1/products?category=electronics&min_price=100&sort=-created_at
          |
          v
  +-----------------------------------------------------------------------+
  | API GATEWAY / APPLICATION PARSER                                      |
  | Validates Allowed Fields -> Builds AST -> Sanitizes Input             |
  +-----------------------------------------------------------------------+
          |
          v
  +-----------------------------------------------------------------------+
  | DATABASE INDEX LOOKUP (Composite Index: category + created_at)        |
  | Scans B-Tree Index -> Fetches Bounded Result Set -> Returns JSON     |
  +-----------------------------------------------------------------------+
```

### Filtering & Sorting Parameter Conventions

| Query Type | Standard Parameter Syntax | Example Endpoint URL | Backend Execution |
| :--- | :--- | :--- | :--- |
| **Exact Value Match** | `?field=value` | `/v1/users?status=active` | SQL `WHERE status = 'active'` |
| **Multi-Value Filter**| `?field=v1,v2` or `?field[]=v1` | `/v1/orders?status=shipped,pending` | SQL `WHERE status IN ('shipped', 'pending')` |
| **Range Filter** | `?field_gte=X&field_lte=Y` | `/v1/products?price_gte=50&price_lte=200`| SQL `WHERE price BETWEEN 50 AND 200` |
| **Sorting (Asc / Desc)**| `?sort=field` (`-` for desc) | `/v1/items?sort=-created_at,price` | SQL `ORDER BY created_at DESC, price ASC` |
| **Full-Text Search** | `?q=search_term` | `/v1/articles?q=distributed+systems` | Elasticsearch / Postgres TSVector query |

### Security & Performance Safeguards

1. **Field Whitelisting**: Never pass raw query strings directly to database queries. Explicitly whitelist sortable and filterable column names to prevent SQL Injection and arbitrary table scans.
2. **Composite Index Alignment**: Ensure frequently combined filter parameters (e.g., `status` + `created_at`) have corresponding composite database indexes to prevent expensive full-table scans.

### Key takeaway

Design clean query parameters for collection endpoints: use prefix minus (`-sort`) for descending sorts, explicit comparison suffixes (`_gte`, `_lte`) for range filters, and **whitelist allowed query fields** to protect database indexes.
