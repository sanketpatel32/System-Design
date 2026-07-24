# API Keys
> **Category:** Security

---

### Overview
An **API Key** is a unique identifier used to authenticate and authorize requests originating from a client application or developer project calling an API. API keys identify the calling project rather than individual end-users.

### API Key Generation & Verification Architecture

```
Developer Console                                API Gateway                 Database / Cache
      |                                              |                             |
      | -- 1. Provision Key (e.g. sk_live_99a8) ---> |                             |
      |                                              | -- 2. Hash & Store (SHA-256)->|
      |<-- 3. Return Plaintext Secret (One-time) ----|                             |
                                                     |                             |
Client App                                           |                             |
      | -- 4. API Request (X-API-Key: sk_live_99a8)-> |                             |
      |                                              | -- 5. Hash & Lookup SHA256 ->|
      |                                              | <-- 6. Rate Limit & Scopes -|
      | <-- 7. 200 OK (API Data) -------------------|                             |
```

### API Key Format Specification
Modern API keys follow structured prefixes for security scanning (e.g., GitHub, Stripe):

$$\underbrace{\text{sk\_live}}_{\text{Prefix / Environment}}\_\underbrace{\text{8f9a2b}}_{\text{Secret Payload Random Bytes}}$$

### Security Controls Matrix

| Control Category | Implementation Strategy | Risk Mitigated |
|---|---|---|
| **Hashing at Rest** | Store only `SHA-256(api_key)` in database | Key leakage via DB compromise |
| **IP Whitelisting** | Restrict API key usage to specific CIDR blocks | Stolen key usage outside corporate network |
| **Scope Scoping** | Bind keys to explicit read/write permissions | Excess privilege abuse |
| **Key Rotation** | Support zero-downtime dual-key active windows | Key compromise remediation |

### Comparison: API Keys vs JWT vs OAuth 2.0

| Attribute | API Keys | JWT Authentication | OAuth 2.0 |
|---|---|---|---|
| **Identifies** | Calling Application / Project | Specific Authenticated User | Delegated Authorization & User |
| **State** | Stateful (DB/Redis lookup) | Stateless (Cryptographic Signature)| Hybrid |
| **Revocation** | Instant (Delete key in cache) | Delayed (Requires blacklist) | Instant |
| **Ideal For** | Developer SDKs, Public APIs | Stateless Internal Microservices | Third-Party Ecosystem Integrations |

### Key takeaway
**API Keys** identify projects and client apps. Secure API key systems must hash keys at rest with **SHA-256**, display the plaintext secret only once at creation, support instant revocation, and restrict usage via IP whitelisting and scopes.
