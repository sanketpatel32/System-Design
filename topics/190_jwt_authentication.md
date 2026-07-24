# JWT Authentication
> **Category:** Security

---

### Overview
**JSON Web Token (JWT)** authentication is a stateless mechanism where the server issues a digitally signed JSON payload containing user identity and claims. Because the token is self-contained and verifiable via cryptography, resource servers do not need to perform database lookups to validate identity.

### Anatomy of a JWT

$$\text{JWT} = \underbrace{\text{Base64URL(Header)}}_{\text{Algorithm \& Type}} \, . \, \underbrace{\text{Base64URL(Payload)}}_{\text{Claims \& Identity}} \, . \, \underbrace{\text{Signature}}_{\text{Cryptographic Verification}}$$

```
+-------------------------------------------------------------------------+
|                               JWT Structure                             |
+-------------------------------------------------------------------------+
| Header:    {"alg": "RS256", "typ": "JWT"}                               |
| Payload:   {"sub": "usr_123", "name": "Alice", "exp": 1700086400}        |
| Signature: RS256( Base64(Header) + "." + Base64(Payload), PrivateKey )  |
+-------------------------------------------------------------------------+
```

### Stateless Verification Architecture

```
Client App                                   Auth Server                  Resource API Server
    |                                             |                                |
    | --- 1. POST /login (Credentials) ---------> |                                |
    | <-- 2. Return Signed JWT (PrivKey) -------- |                                |
    |                                                                              |
    | --- 3. GET /data (Authorization: Bearer <JWT>) ----------------------------> |
    |                                                                              | [ Verify Signature ]
    |                                                                              | [ Check Expire Claim ]
    | <-- 4. 200 OK (Data Response) ---------------------------------------------- |
```

### Standard Claims Reference

| Claim | Name | Description | Example |
|---|---|---|---|
| `iss` | Issuer | Principal issuing the JWT | `https://auth.example.com` |
| `sub` | Subject | Unique user / entity identifier | `usr_998241` |
| `exp` | Expiration Time | Unix timestamp after which JWT is invalid | `1700086400` |
| `iat` | Issued At | Unix timestamp when JWT was generated | `1700000000` |
| `aud` | Audience | Intended recipient of the JWT | `https://api.example.com` |

### Revocation & Security Trade-offs

| Mechanism | Implementation | Trade-off |
|---|---|---|
| **Short-lived Access Token**| Set `exp` to 5-15 minutes; use Refresh Tokens for renewal | Minimizes window of exposure for stolen tokens |
| **Redis Blacklist** | Store revoked `jti` (JWT ID) in Redis until expiration | Restores instant revocation, but reintroduces state |
| **Key Rotation** | Publish Public Key sets via JWKS (`/.well-known/jwks.json`) | Allows non-disruptive cryptographic key rotation |

### Key takeaway
**JWT Authentication** provides high horizontal scalability by eliminating session database lookups. Secure designs must use asymmetric algorithms (**RS256/EdDSA**), keep access token lifetimes short (5-15 mins), and expose public key sets via **JWKS**.
