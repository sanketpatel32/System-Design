# Session-Based Authentication
> **Category:** Security

---

### Overview
**Session-Based Authentication** is a stateful authentication mechanism where the server creates and stores a session record in a backend data store after credential verification, sending a unique, cryptographically random `Session ID` to the client inside an HTTP cookie.

### Session Authentication Workflow

```
Client (Browser)                                    API Server                 Session Store (Redis)
   |                                                   |                                 |
   | --- 1. POST /login (Username + Password) --------> |                                 |
   |                                                   | --- 2. Verify Credentials ----> |
   |                                                   | --- 3. Save SessionData ------> |
   | <--- 4. 200 OK (Set-Cookie: session_id=xyz) ----- |                                 |
   |                                                   |                                 |
   | --- 5. GET /profile (Cookie: session_id=xyz) ----> |                                 |
   |                                                   | --- 6. Lookup session_id -----> |
   |                                                   | <--- 7. Return SessionData ---- |
   | <--- 8. 200 OK (User Profile Data) -------------- |                                 |
```

### Cookie Security Attributes Matrix

| Attribute | Recommended Value | Security Purpose |
|---|---|---|
| `HttpOnly` | `true` | Prevents Client-side JavaScript (`document.cookie`) from accessing session tokens, defeating XSS token theft. |
| `Secure` | `true` | Enforces cookie transmission exclusively over encrypted HTTPS connections. |
| `SameSite` | `Strict` or `Lax` | Restricts cross-site cookie transmission, defending against Cross-Site Request Forgery (CSRF). |
| `Domain` / `Path` | Strict target domain | Scopes cookie availability to specific domain subtrees. |

### Session Data Model (Redis Schema)
```json
// Key: session:c8f92a10-4e3b-4b11-9a7c
{
  "user_id": "usr_998124",
  "role": "admin",
  "ip_address": "203.0.113.195",
  "user_agent": "Mozilla/5.0 ...",
  "created_at": 1700000000,
  "expires_at": 1700086400
}
```

### Trade-off Evaluation

| Advantage | Disadvantage |
|---|---|
| **Instant Invalidation**: Deleting key from Redis revokes session instantly. | **Stateful Scaling**: Requires fast distributed storage (Redis cluster). |
| **Payload Concealment**: Sensitive data remains entirely on the server. | **CSRF Vulnerability**: Requires explicit CSRF token defense if `SameSite` isn't supported. |

### Key takeaway
**Session-Based Authentication** provides absolute control over user access through instant server-side revocation. Secure implementations require a low-latency Redis session cache and strict `HttpOnly`, `Secure`, `SameSite` cookie flags.
