# Idempotency

> **Category:** API Design

---

**Idempotency** guarantees that executing an API request **once or multiple times sequentially produces the exact same system state** on the server. In distributed systems where network retries are frequent, idempotency prevents duplicate charges, double orders, or repeated record mutations.

### Idempotency Key Processing Architecture

```
+-------------------------------------------------------------------------+
|                  IDEMPOTENCY KEY DEDUPLICATION FLOW                     |
+-------------------------------------------------------------------------+

  Client Request: POST /v1/payments (Header: Idempotency-Key: uuid-123)
          |
          v
  +-----------------------------------------------------------------------+
  | API GATEWAY / IDEMPOTENCY MIDDLEWARE                                  |
  +-----------------------------------------------------------------------+
          |
          v
  [ Redis Idempotency Store: Key = "idemp:uuid-123" ]
          |
          +-----------------------+-----------------------+
          | (Key Exists in Redis) | (Key New / Missing)   |
          v                       v                       v
  [ Return Cached 201 Response ]  [ Acquire Distributed Lock ]
  (Zero Duplicate Processing)     [ Execute Payment Logic    ]
                                  [ Save Result to Redis     ]
                                  [ Release Lock & Return    ]
```

### HTTP Verbs Idempotency Matrix

| HTTP Method | Native Idempotency | System Behavior on Duplicate Requests |
| :--- | :--- | :--- |
| **GET** | **Yes (Safe)** | Repeated reads return same data without state mutation. |
| **PUT** | **Yes** | Replaces target resource entirely; state remains identical. |
| **DELETE** | **Yes** | First call deletes item (204); subsequent calls confirm deletion (204/404). |
| **HEAD / OPTIONS**| **Yes (Safe)** | Inspects metadata/CORS without state mutation. |
| **POST** | **No** | Non-idempotent by default; creates duplicate entities unless guarded. |
| **PATCH** | **Depends** | Idempotent if setting fixed values (`status="active"`); non-idempotent if incrementing (`age=age+1`). |

### Implementation Blueprint for Non-Idempotent Endpoints (`POST`)

1. **Client Generates Unique Idempotency Key**: Client generates a V4 UUID and attaches it in the HTTP request header (`Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`).
2. **Atomic Check-and-Lock in Distributed Cache (Redis)**: API Gateway checks if the key exists:
   - If **Key Exists & Processed**: Return the cached HTTP response payload immediately without executing backend payment code.
   - If **Key Processing**: Return 409 Conflict or wait for lock.
   - If **Key New**: Save key in Redis with state `IN_PROGRESS` and 24-hour TTL, execute business logic, write final HTTP response into Redis, and return response to client.

### Key takeaway

Idempotency prevents duplicate state mutations during network retries. Enforce idempotency on non-idempotent `POST` operations by requiring an **`Idempotency-Key` request header** validated atomically against a Redis cache store.
