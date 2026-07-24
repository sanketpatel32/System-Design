# API Keys
> **Category:** Security

---

### Overview
An **API Key** is a unique, long-lived secret string passed by a client application to identify and authenticate incoming API requests. API Keys act as both identity credentials and access control tokens, enabling backend platforms to track usage, enforce rate limits, and monetize API access tiers.

To prevent security breaches, system architectures never store plain-text API keys in databases. Instead, keys use cryptographically secure prefixes (e.g., `sk_live_...`) with only SHA-256 key hashes persisted in backend stores.

### API Key Ingestion & Verification Architecture

```
+------------------+     1. Request + Header ("Authorization: Bearer sk_live_abc123")
| Third-Party      | --------------------------------------------------------+
| Developer Client |                                                         |
+------------------+                                                         v
                                                           +--------------------+
                                                           | API Gateway / L7   |
                                                           +--------------------+
                                                                     |
                                                                     | 2. Extract Prefix & Hash Key
                                                                     v
                                                           +--------------------+
                                                           | Key Cache (Redis)  |
                                                           +--------------------+
                                                                     |
                                                                     | 3. Cache Miss -> Lookup Hash
                                                                     v
                                                           +--------------------+
                                                           | Key Store (Postgres|
                                                           +--------------------+
```

### Secure API Key Anomaly & Generation Flow
1. **Generation:** Cryptographically secure random string generation (e.g., 256-bit entropy).
2. **Prefixing:** Include recognizable routing prefix (`sk_live_` for production, `sk_test_` for sandbox).
3. **Display:** Show full API key to developer **once** during creation.
4. **Hashing:** Compute `SHA-256(api_key)` and persist only the hash and prefix in the database.

### API Interface Specifications

| Endpoint | Method | Input Body | Output Payload |
|---|---|---|---|
| `/api/v1/keys` | POST | `{"name": "Stripe Integration", "scopes": ["read:invoices"]}` | `{"id": "key_99", "secret_key": "sk_live_8f3a...", "warning": "Save this key now"}` |
| `/api/v1/keys/{id}/revoke`| POST | None | `{"status": "REVOKED", "key_id": "key_99"}` |
| `/api/v1/keys/verify` | POST | `{"api_key": "sk_live_8f3a..."}` | `{"valid": true, "account_id": "acc_441", "tier": "ENTERPRISE"}` |

### API Key Storage Schema & Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `key_id` | String / UUID | PostgreSQL | Unique ID representing the key metadata record. |
| `account_id` | String | PostgreSQL | Identifies the tenant / organization owner. |
| `key_prefix` | String (e.g. `sk_live_8f`) | PostgreSQL (Indexed) | Allows fast database prefix lookup without full hash scans. |
| `key_hash` | String (SHA-256) | PostgreSQL | Cryptographic hash of the raw API key secret. |
| `scopes` | Array of Strings | PostgreSQL | Permissions attached to the key (e.g., `["read", "write"]`). |
| `rate_limit_tier` | String | Redis Cache | Defines token bucket refill rate for rate limiting. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Hashed API Keys (SHA-256)** | Database leak does not compromise plain-text client secrets. | Cannot recover lost keys; developer must generate a new key if lost. | Developer-facing SaaS APIs (Stripe, Twilio, OpenAI). |
| **API Keys vs OAuth 2.0** | Simple integration for server-side scripts; no complex token exchange flows. | Vulnerable to key theft if embedded in public mobile or browser client code. | Server-to-server API integrations and developer SDKs. |
| **In-Memory Redis Key Cache** | Sub-millisecond lookup speeds; offloads database from heavy key verification queries. | Cache invalidation logic required when keys are revoked or scopes change. | High-volume public API gateways. |

### Key takeaway
**API Keys** provide simple authentication and rate-limiting controls for developer integrations. Always prefix keys for quick identification, store only cryptographic SHA-256 key hashes, and enforce strict scope limits and revocation capabilities.
