# HTTP Methods

> **Category:** Networking Basics

---

HTTP methods (verbs) declare the intent of a request and whether it's **safe** and
**idempotent**.

### The core set
| Method | Purpose | Safe? | Idempotent? | Has body? |
|--------|---------|-------|-------------|-----------|
| GET    | Read | Yes | Yes | No |
| POST   | Create | No | No | Yes |
| PUT    | Replace (full) | No | Yes | Yes |
| PATCH  | Modify (partial) | No | No* | Yes |
| DELETE | Remove | No | Yes | No |
| HEAD   | Read headers only | Yes | Yes | No |
| OPTIONS | Discover allowed methods | Yes | Yes | No |

\* PATCH isn't strictly idempotent; depends on operation.

### Definitions
- **Safe**: doesn't change server state (GET, HEAD, OPTIONS). Cacheable, prefetchable.
- **Idempotent**: same call repeated has same effect (PUT, DELETE). Safe to retry.

### Common conventions
- `POST /users` — create new user, returns 201.
- `GET /users/123` — fetch one.
- `GET /users?limit=20` — list with pagination.
- `PUT /users/123` — replace user 123 entirely.
- `PATCH /users/123` — change just the email.
- `DELETE /users/123` — delete user 123.

### When POST vs PUT
- **POST** to a collection URI `/users` — server picks the ID.
- **PUT** to a specific URI `/users/123` — client picks the ID, idempotent.

### Why it matters
- Idempotency enables safe retries (big for distributed systems).
- Safe methods can be cached aggressively.
- Violating these conventions breaks proxies, CDNs, and clients.

### Key takeaway
Honor the verbs. GET should never mutate; PUT should be safe to retry; POST creates. Breaking
these conventions silently breaks caches and retry logic.
