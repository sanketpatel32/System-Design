# Session-Based Authentication
> **Category:** Security

---

### Overview
**Session-Based Authentication** is a stateful authentication pattern where the server creates and persists a session record in a backend database or cache (e.g., Redis) upon successful login, and returns a unique, random **Session ID** token to the client inside an HTTP-Only, Secure cookie.

Because state is retained on the server, session revocation is immediate and deterministic: deleting a session key from Redis instantly invalidates client access across all requests.

### Session Lifecycle & Sequence Diagram

```
CLIENT (Browser)                                         API GATEWAY / AUTH        REDIS SESSION STORE
  |                                                           |                          |
  | 1. POST /login (username, password)                       |                          |
  | --------------------------------------------------------> |                          |
  |                                                           | 2. Validate Credentials  |
  |                                                           | 3. Generate Session ID   |
  |                                                           |    ("sess_8f92a11b...")  |
  |                                                           | 4. SETEX sess_8f92a11b   |
  |                                                           | -----------------------> |
  | 5. 200 OK + Set-Cookie: sid=sess_8f92a11b; HttpOnly; Secure|                          |
  | <-------------------------------------------------------- |                          |
  |                                                           |                          |
  | 6. GET /user/profile (Cookie: sid=sess_8f92a11b)          |                          |
  | --------------------------------------------------------> |                          |
  |                                                           | 7. GET sess_8f92a11b     |
  |                                                           | -----------------------> |
  |                                                           | <----------------------- |
  |                                                           |    (Return User Data)    |
  | 8. 200 OK (User Profile JSON Payload)                     |                          |
  | <-------------------------------------------------------- |                          |
```

### Cookie Security Attributes

| Cookie Directive | Recommended Setting | Defensive Purpose |
|---|---|---|
| `HttpOnly` | `true` | Prevents client-side JavaScript access via `document.cookie` (Protects against XSS token theft). |
| `Secure` | `true` | Forces cookie transmission strictly over encrypted HTTPS channels. |
| `SameSite` | `Strict` or `Lax` | Restricts cookie inclusion in cross-site requests (Mitigates Cross-Site Request Forgery - CSRF). |
| `Domain` / `Path` | `.example.com` / `/` | Restricts session cookie visibility scope across subdomains. |

### Redis Session Data Model & Storage Schema

| Key Pattern | Data Structure | TTL | Stored Value Payload |
|---|---|---|---|
| `session:{session_id}` | Redis Hash / JSON | 86400s (24h) | `{"user_id": "u_9921", "ip": "192.168.1.1", "created_at": 1700000000, "roles": ["ADMIN"]}` |
| `user_sessions:{user_id}`| Redis Set | 86400s | Set of active session IDs (e.g., `["sess_1", "sess_2"]`) for multi-device logout. |

### API Endpoint Specification

| Endpoint | Method | Request Header / Cookie | Backend Action |
|---|---|---|---|
| `/api/v1/auth/login` | POST | Credentials in Body | Validates user, generates session in Redis, returns `Set-Cookie`. |
| `/api/v1/auth/logout` | POST | `Cookie: sid={session_id}` | Deletes `session:{session_id}` key from Redis immediately. |
| `/api/v1/auth/logout-all`| POST | `Cookie: sid={session_id}` | Fetches `user_sessions:{user_id}`, bulk deletes all keys from Redis. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Server-Side Session State** | Instant session revocation; centralized control over active logins; compact cookie payload. | Requires fast distributed cache (Redis); adds network lookup latency to every API call. | High-security financial apps, enterprise portals, and administrative tools. |
| **Stateless JWTs vs Sessions**| No backend database lookup required; highly scalable for cross-domain microservices. | Cannot revoke active JWT tokens instantly without complex blacklist state. | High-throughput public mobile APIs. |
| **Distributed Redis Cluster** | Sub-millisecond lookup speeds; scalable across multiple data centers. | Redis node failover can drop sessions if replication is asynchronous. | Standard web applications requiring active session management. |

### Key takeaway
**Session-Based Authentication** maintains stateful security via server-managed session stores (Redis) and client HTTP-Only cookies. It provides instant, granular session revocation and CSRF protection at the cost of backend cache lookups on every request.
