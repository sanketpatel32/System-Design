# Authentication
> **Category:** Security

---

### Overview
**Authentication (AuthN)** is the mechanism of verifying the claimed identity of a user, service, or system component. It answers the fundamental security question: *"Who are you?"*

### Authentication Architectural Pattern

```
+--------+       1. Credentials (ID + Secret)       +-----------------------+
| Client | ---------------------------------------> | Authentication Service |
+--------+                                          +-----------------------+
    ^                                                           |
    |                                                           | 2. Validate Credential
    |                                                           v
    |                                               +-----------------------+
    | 3. Issue Token / Session Cookie               | Identity Store / DB   |
    +---------------------------------------------- | (Hashed Passwords)    |
                                                    +-----------------------+
```

### Primary Authentication Factors

| Factor Type | Mechanism | Examples | Security Level |
|---|---|---|---|
| **Knowledge** | Something you know | Password, PIN, Security Question | Low (vulnerable to phishing/reuse) |
| **Possession** | Something you have | Hardware Key (YubiKey), TOTP App, SMS | Medium - High |
| **Inherence** | Something you are | Fingerprint, FaceID, Iris Scan | High (hard to forge, non-transferable) |

### Modern Authentication Strategies

| Strategy | Architecture | Pros | Cons |
|---|---|---|---|
| **Session-Based** | Server-side session state stored in Redis/DB | Instant revocation, high control | State scale complexity across clusters |
| **Token-Based (JWT)** | Stateless signed JWT payload verified via public key | Highly scalable, stateless backends | Revocation requires blacklist/short TTL |
| **OAuth 2.0 / OIDC** | Delegated identity provider (Google, GitHub, Okta) | Offloads user security, zero password storage | Third-party identity provider dependency |
| **Passwordless (WebAuthn)**| FIDO2 public key cryptography via Passkeys | Immune to phishing, zero secret sharing | Device sync & recovery complexity |

### Password Storage Security Guidelines
- **Hashing Standard**: Never store plaintext passwords. Use memory-hard key derivation algorithms: **Argon2id**, **bcrypt**, or **scrypt**.
- **Salting**: Apply a unique, cryptographically random salt per user to defeat precomputed Rainbow Table attacks.

### Key takeaway
**Authentication** proves identity. Production systems must implement **Multi-Factor Authentication (MFA)**, enforce memory-hard password hashing (Argon2id), and prefer stateless OpenID Connect or Passkeys for scale and security.
