# API Authentication

> **Category:** API Design

---

**API Authentication** is the process of **verifying the identity of a client, user, or service** attempting to access an API. Authentication answers the core security question: *"Who are you?"*

### JWT Authentication Architecture

```
+-------------------------------------------------------------------------+
|                  STATELSS JWT AUTHENTICATION FLOW                       |
+-------------------------------------------------------------------------+

  [ Client ] --( 1. POST /v1/auth/login {user, pass} )--> [ Auth Service ]
       |                                                         |
       |<--( 2. Return Signed JWT Access Token )-----------------+
       |
       |--( 3. GET /v1/orders Header: Bearer <JWT> )-----> [ API Gateway ]
                                                                 |
  [ Microservice B ] <--( 4. Verify HMAC/RSA Signature locally )-+
  (No Auth DB Lookup Needed - High Scale Performance)
```

### API Authentication Strategies Comparison

| Authentication Method | Protocol Mechanism | Security Level | Scalability | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **HTTP Basic Auth** | Credentials sent base64-encoded in `Authorization: Basic ...` header. | Low (Vulnerable if HTTPS omitted) | High | Internal legacy admin utilities |
| **API Keys** | Opaque unique string sent in header (`X-API-Key: xyz`). | Medium | High | Server-to-server developer APIs (Stripe, Twilio) |
| **Session Cookies** | Server stores session ID in Redis/DB; client holds HTTP-only cookie. | High | Medium (Requires centralized session store lookup) | Traditional monolithic web apps |
| **JWT (JSON Web Tokens)** | Stateless Cryptographically Signed JSON Token (`Bearer <token>`). | High | **Extremely High (Stateless verification)** | Modern SPA, Mobile Apps, Microservices |
| **OAuth 2.0 / OIDC** | Delegated access framework using Access & Refresh Tokens. | Highest | High | Third-party login (Google/GitHub OAuth), enterprise SSO |

### JSON Web Token (JWT) Anatomy

A JWT consists of three dot-separated base64-encoded strings (`Header.Payload.Signature`):

1. **Header**: Declares hashing algorithm (`"alg": "RS256"`, `"typ": "JWT"`).
2. **Payload (Claims)**: Contains claims (`"sub": "user_42"`, `"exp": 1700000000`, `"roles": ["admin"]`).
3. **Signature**: Hashes `Header + Payload` using a private RSA key or secret key, allowing receivers to verify authenticity without contacting the issuer.

### Key takeaway

Use **JWT (JSON Web Tokens)** for stateless, scalable microservice authentication, and **OAuth 2.0 / OpenID Connect (OIDC)** for third-party delegated authorization. Protect tokens by setting appropriate TTLs and transmitting exclusively over **HTTPS**.
