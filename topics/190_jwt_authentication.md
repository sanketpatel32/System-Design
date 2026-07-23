# JWT Authentication

> **Category:** Security

---

JWT (JSON Web Token) = **a self-contained, signed token** carrying claims (user ID, roles,
expiry).

### Structure
```
header.payload.signature
eyJhbGciOi...eyJzdWIi...SflKxw...
```
- **Header**: algorithm (HS256, RS256).
- **Payload**: claims (sub, exp, iat, custom).
- **Signature**: HMAC or RSA signature over header + payload.

### Flow
```
1. User logs in.
2. Server validates, creates JWT signed with secret/private key.
3. Server sends JWT to client.
4. Client includes JWT in Authorization: Bearer header.
5. Server verifies signature, extracts claims, identifies user.
```

### Pros
- ✅ **Stateless**: server doesn't store sessions.
- ✅ **Scales**: any instance can verify.
- ✅ **Mobile-friendly**: token in header, not cookie.
- ✅ **Decentralized**: multiple services can verify.

### Cons
- ❌ **Can't revoke** easily (until expiry).
- ❌ **Larger** than session ID.
- ❌ **Stale claims** (role changes need new token).
- ❌ **Storage**: client must store securely (XSS risk).

### Refresh tokens
- Access token: short-lived (15 min).
- Refresh token: long-lived (7 days), used to get new access tokens.
- Refresh token stored server-side (can be revoked).
- Limits exposure window if access token leaked.

### Signatures
- **HS256**: HMAC with shared secret (simple, secret must be shared).
- **RS256**: RSA, private key signs, public key verifies (better for multi-service).
- **ES256**: ECDSA (modern, smaller signatures).

### Security best practices
- Short TTL on access tokens.
- Don't store in localStorage (XSS) — use httpOnly cookie or secure storage.
- Always verify signature + expiry.
- Use refresh tokens for revocability.
- Don't put sensitive data in payload (it's base64, not encrypted).

### Key takeaway
JWTs are self-contained signed tokens. Great for stateless APIs and mobile. Use **short-lived
access tokens + long-lived refresh tokens** to balance usability and revocation. Sign with RS256
for multi-service. Never store in localStorage.
