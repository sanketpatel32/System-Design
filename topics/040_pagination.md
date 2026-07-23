# Pagination

> **Category:** API Design

---

Pagination = **returning large result sets in chunks** so clients and servers don't choke.

### Why pagination
- **Performance**: returning 1M rows kills DB, network, and client.
- **Cost**: bandwidth, compute.
- **UX**: progressive load (infinite scroll, page numbers).
- **API quotas**: per-request size limits.

### Three styles

#### 1. Offset / limit
```
GET /users?offset=20&limit=20
```
- ✅ Simple, jump to any page.
- ❌ Slow on deep pages (`OFFSET 100000` still scans 100k rows).
- ❌ Unstable: if data inserts/deletes, page 2 shifts.

#### 2. Cursor (keyset)
```
GET /users?after=eyJpZCI6MTAwfQ&limit=20
```
- ✅ Stable — uses an indexed column (`WHERE id > 100`).
- ✅ Fast even at deep pages.
- ❌ Can't jump to arbitrary page.
- ❌ Cursor must encode sort key (often base64-encoded JSON).

#### 3. Seek / search-after
Same idea as cursor but uses explicit field values:
```
GET /users?last_id=100&limit=20
```

### Response shape
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTIwfQ",
    "has_more": true
  }
}
```

### Infinite scroll
Frontend uses `next_cursor` from each response to fetch the next page as the user scrolls.

### Counting total
- `SELECT COUNT(*)` on large tables is expensive.
- Return `has_more: true/false` instead of total count where possible.

### Key takeaway
Default to **cursor pagination** for stable, scalable APIs. Use offset only when you must jump
to arbitrary pages. Always include a `has_more` flag and a `next_cursor`.
