# Authentication
> **Category:** Security

---

### Overview
**Authentication (AuthN)** is the security mechanism of validating and verifying the claimed identity of a user, service, or system component. Unlike Authorization (which checks permissions), Authentication answers the core identity question: *"Who are you?"*

Modern system design uses multi-layered authentication patterns ranging from password hashing, Multi-Factor Authentication (MFA), OAuth2/OIDC federated identity, WebAuthn passkeys, and mutual TLS (mTLS) for system-to-system verification.

### Enterprise Multi-Factor Authentication Topology

```
+-------------------+       1. Credentials (User/Pass)      +--------------------+
|  Client Device    | -----------------------------------> | API Gateway        |
+-------------------+                                      +--------------------+
         ^                                                            |
         | 2. Challenge (MFA Prompt)                                  v 3. Validate Hash
         |                                                 +--------------------+
         +------------------------------------------------ | Identity Provider  |
                                                           | (IdP / Auth Service)|
                                                           +--------------------+
                                                                      |
                                                                      v 4. Lookup User Record
                                                           +--------------------+
                                                           | User Credentials DB|
                                                           | (Argon2id Hash)    |
                                                           +--------------------+
```

### Authentication Mechanics & Primary Methods

| Method | Verification Factor | Security Profile | Typical Application |
|---|---|---|---|
| **Passwords / Passphrases** | Something you know | Vulnerable to credential stuffing & phishing; requires Argon2id / Bcrypt hashing. | Basic web logins & legacy systems. |
| **TOTP (Time-Based One-Time)**| Something you have | Resilient to basic password leaks; vulnerable to real-time proxy phishing. | Standard 2FA authenticator apps (Google Authenticator). |
| **FIDO2 / WebAuthn Passkeys**| Something you have + are | Cryptographically phishing-resistant; hardware-bound public-key cryptography. | Modern web apps, Apple TouchID/FaceID, YubiKeys. |
| **Mutual TLS (mTLS)** | Cryptographic Certificate | High security; automated asymmetric certificate exchange. | Service-to-Service microservice RPC communication. |

### API Interface & Authentication Contracts

| Endpoint | Method | Request Payload | Response Payload / Result |
|---|---|---|---|
| `/api/v1/auth/login` | POST | `{"username": "user", "password": "PlainTextPassword"}` | `{"status": "MFA_REQUIRED", "mfa_token": "tmp_sess_123"}` |
| `/api/v1/auth/mfa/verify` | POST | `{"mfa_token": "tmp_sess_123", "totp_code": "849201"}` | `{"access_token": "eyJhbG...", "expires_in": 3600}` |
| `/api/v1/auth/passkey/auth`| POST | `{"credential_id": "pk_99", "signature": "304502..."}` | `{"status": "SUCCESS", "session_id": "sess_8832"}` |

### User Credential Storage Schema

| Field Name | Data Type | Storage Engine | Security Constraint |
|---|---|---|---|
| `user_id` | UUID | PostgreSQL / CockroachDB | Primary Key |
| `email` | String (Indexed) | Relational DB | Unique index; normalized lowercase. |
| `password_hash` | String | Relational DB | Hashed via Argon2id ($m=65536, t=3, p=4$) + unique salt. |
| `mfa_secret` | Encrypted String | Relational DB | Encrypted at rest via KMS envelope encryption. |
| `failed_login_attempts` | Integer | Redis Cache | Counter for rate limiting & account lockout policy. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Centralized Identity Provider (Keycloak, Auth0)** | Offloads auth complexity; centralized audit logging and compliance management. | Becomes single point of failure (SPOF) for all service logins. | Enterprise organizations and multi-application platforms. |
| **Decentralized Service Authentication** | Fast local token validation without external IdP HTTP round trips. | Complex key rotation handling across multiple microservice teams. | High-throughput distributed microservice systems. |
| **FIDO2 / WebAuthn Passkeys** | Complete immunity against phishing attacks and password leaks. | User recovery challenges when physical hardware keys are lost. | High-security financial apps and privileged admin portals. |

### Key takeaway
**Authentication** confirms identity before granting access. Secure authentication architectures enforce salted cryptographic hashing (Argon2id), phase out legacy plaintext credentials, and prioritize phishing-resistant FIDO2/WebAuthn standards.
