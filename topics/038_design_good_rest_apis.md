# Design Good REST APIs

> **Category:** API Design

---

A good REST API is **consistent, predictable, and self-describing**. Clients should guess the
URL of the next resource without docs.

### Resource naming
- **Nouns, not verbs**: `/users`, `/orders`, not `/getUsers`.
- **Plural**: `/users/123`, not `/user/123`.
- **Nested for sub-resources**: `/users/123/orders`.
- **LowerCase, hyphenated**: `/order-items`, not `/orderItems`.

### HTTP verbs (recap)
```
GET    /users         list
POST   /users         create
GET    /users/{id}    fetch
PUT    /users/{id}    replace
PATCH  /users/{id}    partial update
DELETE /users/{id}    delete
```

### Status codes (use them properly)
- 200 success, 201 created, 204 no content.
- 400 bad input, 401 not auth'd, 403 forbidden, 404 missing, 409 conflict, 422 semantics, 429
  rate limited.
- 500 server bug, 502/503/504 upstream problems.

### Pagination (always)
- **Offset / limit**: `?offset=20&limit=20` — simple, slow for deep pages.
- **Cursor**: `?after=abc123&limit=20` — stable, fast, can't jump to page 50.
- Return `next_cursor` in the response body.

### Consistent envelope
```json
{
  "data": [...],
  "pagination": {"next_cursor": "..."},
  "errors": null
}
```
Same shape on every endpoint → clients parse once.

### Idempotency
- **Idempotency-Key** header on POST/PUT so retries don't double-charge.

### Versioning
- URL: `/v1/users` (most common).
- Header: `Api-Version: 1` (cleaner URLs, harder to test).

### Other must-haves
- **Rate limiting** with 429 + `Retry-After`.
- **Authentication** (OAuth 2 / JWT).
- **Errors with codes** — machine-parseable, not just messages.
- **Pagination, filtering, sorting** as query params.

### Key takeaway
Treat your API as a **product**, not a side-effect of code. Consistency beats cleverness — every
endpoint should behave the way clients guess it does.
