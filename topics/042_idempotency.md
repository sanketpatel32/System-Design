# Idempotency

> **Category:** API Design

---

Idempotency = **calling an operation multiple times has the same effect as calling it once.**
The foundation of safe retries in distributed systems.

### Why it matters
Networks fail. Clients retry. Without idempotency, "submit order" called twice = two charges.

### Idempotent by HTTP method
- **GET, PUT, DELETE**: inherently idempotent (do it twice = same state).
- **POST, PATCH**: NOT idempotent (each call may create/modify).

### Making POST idempotent
**Idempotency-Key header** (Stripe's pattern, now RFC standard):
```
POST /charges
Idempotency-Key: client-generated-uuid
{amount: 100, currency: "usd"}
```
Server flow:
1. Check if `key` was seen → return cached result.
2. Else process, store `(key, user_id, result)` in DB.
3. Subsequent retries with same key return the same response (even if it was an error).

### Storage
- Store keys in a **fast, durable store** (Redis + Postgres, or DynamoDB).
- TTL: typically 24-48 hours (long enough for retries, short enough to bound storage).
- Scope keys to the **authenticated user** so different users can't collide.

### Implementation gotchas
- Store the key **before** processing — don't let two retries run in parallel.
- Wrap in a **unique constraint** or use SELECT FOR UPDATE to serialize.
- Return the **same response code** on retry, even if first was a failure.

### Database operations
- Use **INSERT ... ON CONFLICT DO NOTHING** or upserts.
- Use **optimistic concurrency** (version field + UPDATE WHERE version = N).

### Key takeaway
Every mutating API that clients can retry needs an **Idempotency-Key**. It's not optional for
payments, message sends, webhooks, or anywhere duplicates cause harm.
