# JWT Authentication
> **Category:** Security

---

### Overview
**JSON Web Token (JWT)** Authentication is a stateless authentication pattern defined by RFC 7519. A JWT is a self-contained, digitally signed JSON object that securely transmits claims (such as user identity and permissions) between a client and a server.

Because JWTs are signed using symmetric secrets (HMAC SHA-256) or asymmetric key pairs (RSA / ECDSA), microservices can verify token authenticity in-memory without querying a centralized session database.

### JWT Cryptographic Structure & Transmission Flow

```
+--------------------------------------------------------------------------+
|                               JWT STRUCTURE                              |
|  [ HEADER: Algo & Type ] . [ PAYLOAD: Claims & Exp ] . [ SIGNATURE ]     |
|   eyJhbGciOiJSUzI1Ni...   .  eyJzdWIiOiIxMjM0NT...   .   SflKxwRJSMe...  |
+--------------------------------------------------------------------------+
                                     |
                                     v
CLIENT                                                              SERVER / MICROSERVICE
  |                                                                    |
  | 1. Request with Header: "Authorization: Bearer <JWT>"             |
  | -----------------------------------------------------------------> |
  |                                                                    |
  |                                 2. Parse Header, Payload & Signature|
  |                                 3. Verify Signature using Public Key|
  |                                 4. Check Expiration: `exp > now()` |
  |                                                                    |
  | <----------------------------------------------------------------- |
  | 5. Response 200 OK (No Database Lookup Required)                   |
```

### Dual-Token Architecture (Access + Refresh Tokens)

| Token Type | Lifespan | Storage Location | Defensive Strategy |
|---|---|---|---|
| **Access Token** | Short-Lived (e.g., 5 to 15 minutes) | In-Memory (JS Variable) or Secure Cookie | Sent in `Authorization: Bearer` header on every request; contains scopes & identity. |
| **Refresh Token** | Long-Lived (e.g., 7 to 30 days) | `HttpOnly`, `Secure`, `SameSite` Cookie | Exchanged at `/auth/refresh` endpoint to issue new Access Tokens; stored in Redis for revocation. |

### Claims Payload Schema

| Key Name | Claim Standard | Data Type | Purpose / Description |
|---|---|---|---|
| `iss` | Registered | String | Issuer identifier (e.g., `https://auth.example.com`). |
| `sub` | Registered | String | Subject identifier (Unique User ID `u_8841`). |
| `exp` | Registered | Int64 (Unix Epoch) | Expiration timestamp; token becomes invalid after this epoch. |
| `iat` | Registered | Int64 (Unix Epoch) | Issued At timestamp. |
| `roles` | Private Custom | Array of Strings | User access roles (e.g., `["editor", "billing_admin"]`). |

### API Endpoint Specification

| Endpoint | Method | Input Payload | Output Payload |
|---|---|---|---|
| `/api/v1/auth/token` | POST | Credentials / OAuth Code | `{"access_token": "eyJhb...", "refresh_token": "ref_992", "expires_in": 900}` |
| `/api/v1/auth/refresh` | POST | `Cookie: refresh_token` | `{"access_token": "eyJhb...", "expires_in": 900}` |
| `/api/v1/auth/revoke` | POST | `{"token": "ref_992"}` | Removes refresh token record from backend database. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Stateless Access Tokens** | Zero database lookups required on resource microservices; scales horizontally effortlessly. | Inability to immediately revoke compromised access tokens until `exp` passes. | Distributed high-throughput microservices and SPA backends. |
| **Asymmetric RS256 / ES256 Signing**| Public keys can be distributed safely via JWKS endpoints; isolated private key. | Signature verification takes slightly higher CPU overhead than symmetric HS256. | Multi-service enterprise architectures with third-party consumers. |
| **JWT Revocation Blacklist in Redis**| Allows immediate revocation of compromised JWT tokens. | Re-introduces stateful Redis lookup bottleneck to stateless JWT architecture. | Systems requiring emergency session revocation capabilities. |

### Key takeaway
**JWT Authentication** enables stateless identity verification across microservices using cryptographically signed claims. Use short-lived Access Tokens paired with secure, rotated Refresh Tokens to balance horizontal scalability with security revocation controls.
