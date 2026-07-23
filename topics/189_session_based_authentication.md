# Session-Based Authentication

> **Category:** Security

---

Session-based auth = **server stores session state; client holds a session ID cookie.**

### Flow
```
1. User logs in with username/password.
2. Server validates, creates a session (in DB / Redis / memory).
3. Server sends session ID to client as a cookie.
4. Client includes cookie on every request.
5. Server looks up session, identifies user.
6. On logout, server destroys session.
```

### Cookie attributes
- **HttpOnly**: JavaScript can't read it (XSS protection).
- **Secure**: only sent over HTTPS.
- **SameSite=Strict/Lax**: CSRF protection.
- **Domain, Path**: scope.

### Storage
- **In-memory**: fast, lost on restart, not shared.
- **Redis**: shared across instances, fast, TTL.
- **DB**: persistent, slower.
- **Cookie-signed**: state stored in cookie itself (signed).

### Pros
- ✅ **Simple** for browsers.
- ✅ **Revocable**: server can kill sessions instantly.
- ✅ **Server controls state**.
- ✅ MFA, idle timeout easy to enforce.

### Cons
- ❌ **Stateful**: server must store sessions.
- ❌ **Scaling**: shared session store (Redis) needed.
- ❌ **Not great for mobile / API**: cookies awkward.
- ❌ **CSRF** risk (mitigate with SameSite / tokens).

### vs JWT
| | Sessions | JWT |
|--|----------|-----|
| State | Server | Stateless (token has data) |
| Revocation | Easy | Hard (need blacklist) |
| Mobile API | Awkward | Native |
| Size | Small cookie | Large token |
| Security | Server-controlled | Self-contained |

### Key takeaway
Session-based auth is the classic browser pattern: server stores state, client holds a session
ID cookie with HttpOnly + Secure + SameSite. Great for revocation; harder for mobile APIs. JWT
often preferred for APIs.
