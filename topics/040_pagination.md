# Pagination

> **Category:** API Design

---

**Pagination** is the practice of splitting large datasets into smaller, manageable chunks (pages) returned across sequential API requests. It prevents database memory exhaustion, limits bandwidth overhead, and keeps response latencies low.

### Offset-Based vs. Cursor-Based Pagination Traversal

```
+-------------------------------------------------------------------------+
|                  OFFSET vs. CURSOR PAGINATION FLOW                      |
+-------------------------------------------------------------------------+

  OFFSET-BASED (DB: OFFSET 1000 LIMIT 20)
  Reads & Skips 1,000 Rows in DB Disk Index ---> Slow O(N) Degradation
  Vulnerable to Duplicate / Missed Items on Data Mutations

  CURSOR-BASED (DB: WHERE id > 'cursor_abc' LIMIT 20)
  Jumps directly to Indexed Cursor Position ---> Fast O(1) B-Tree Lookup
  Consistent & Resilient to Data Insertions / Deletions
```

### Pagination Strategies Technical Breakdown

| Dimension | Offset-Based Pagination | Cursor-Based (Keyset) Pagination | Keyset / Time-Based Pagination |
| :--- | :--- | :--- | :--- |
| **API Parameter Syntax**| `?page=5&limit=20` or `?offset=100&limit=20` | `?cursor=eyJpZCI6OTAxfQ==&limit=20` | `?created_before=2026-01-01T00:00:00Z` |
| **Database Query** | `SELECT * FROM items OFFSET 100 LIMIT 20` | `SELECT * FROM items WHERE id > 900 LIMIT 20` | `SELECT * FROM items WHERE created_at < T` |
| **Performance** | Degrades linearly ($O(N)$) as offset increases. | Constant time ($O(1)$) using B-Tree index lookups.| Constant time ($O(1)$) indexed lookup. |
| **Data Drift Resilience**| Poor (Skipped or duplicate items during edits).| High (Stable view across concurrent inserts).| High (Stable event timeline). |
| **Random Page Access** | Supported (Jump directly to Page 10). | Not Supported (Sequential traversal only). | Not Supported (Timeline bound). |
| **Best Use Case** | Admin dashboards with low row counts. | High-scale infinite scroll feeds (Twitter/Instagram).| Activity logs, time-series events. |

### Envelope Meta Response Payload Format

```json
{
  "data": [
    { "id": "item_901", "name": "Widget A" }
  ],
  "pagination": {
    "next_cursor": "eyJpZCI6OTAxfQ==",
    "has_more": true,
    "limit": 20
  }
}
```

### Key takeaway

Use **Cursor-Based Pagination** for high-scale, real-time datasets and infinite scrolling feeds to ensure $O(1)$ database index performance and prevent data drift. Reserve **Offset-Based Pagination** for internal administration tables requiring jump-to-page navigation.
