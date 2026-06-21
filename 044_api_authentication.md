# API Authentication

> **Category:** API Design

---

Authentication = **"who are you?"**. Proves the caller's identity before authorizing the
action.

### Common methods

#### 1. Basic Auth
```
Authorization: Basic base64(user:pass)
```
- Simple, ubiquitous.
- **Never without HTTPS** (sends creds in plaintext).
- No logout, no expiry. Mostly legacy.

#### 2. Session-based (cookies)
- Server stores session, browser gets a session ID cookie.
- Great for browser apps.
- Hard to scale across services (sticky sessions or shared session store).

#### 3. API Keys
```
Authorization: Bearer sk_live_xxx
```
- Long-lived secret per client.
- Simple, server-to-server.
- Rotate via revocation / rollover.

#### 4. JWT (JSON Web Token)
- Signed token containing claims.
- Stateless — server verifies signature, no lookup.
- Short-lived (access token) + long-lived refresh token.

#### 5. OAuth 2.0 / OIDC
- Delegate auth to a provider (Google, Auth0).
- User logs in once, gets access token for your API.
- Standard for "log in with X".

### Choosing
| Use case | Method |
|----------|--------|
| Browser SaaS app | Session or JWT |
| Mobile app | JWT + refresh |
| Server-to-server | API key or mTLS |
| Public "log in with Google" | OAuth 2.0 |
| Internal microservices | mTLS or JWT |

### Best practices
- **HTTPS always** — creds in transit.
- **Hash secrets at rest** (bcrypt for passwords).
- **Short-lived tokens** + refresh tokens.
- **Rotate keys** periodically.
- **Never put secrets in URLs** (they get logged).

### Key takeaway
Pick the auth method by client type. For modern web/mobile apps: **JWT access tokens + refresh
tokens**. For server-to-server: API keys or mTLS. Always over HTTPS.
