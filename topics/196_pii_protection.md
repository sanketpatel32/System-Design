# PII Protection
> **Category:** Security

---

### Overview
**Personally Identifiable Information (PII)** protection encompasses technical mechanisms designed to safeguard sensitive user data—such as Social Security Numbers (SSN), credit card numbers (PAN), full names, email addresses, and phone numbers—from exposure, unauthorized access, and regulatory non-compliance (GDPR, CCPA, PCI-DSS, HIPAA).

Core architectural patterns rely on **Tokenization**, **Format-Preserving Encryption (FPE)**, data pseudonymization, dynamic masking, and isolated **Token Vaults**.

### PII Tokenization & Isolation Architecture

```
+--------------------+     1. Write User Record (with SSN)      +--------------------+
| Web Application /  | ---------------------------------------> | API Gateway        |
| Microservice       |                                          +--------------------+
+--------------------+                                                     |
         ^                                                                 | 2. Intercept & Tokenize PII
         | 4. Return Non-Sensitive Token ("tok_ssn_99812")                 v
         +------------------------------------------------------ +--------------------+
                                                                 | Tokenization Engine|
                                                                 | & Security Vault   |
                                                                 +--------------------+
                                                                           |
                                                                           v 3. Store Real PII
                                                                 +--------------------+
                                                                 | Isolated PII Vault |
                                                                 | (Encrypted DB)     |
                                                                 +--------------------+
```

### PII Protection Techniques Comparison

| Technique | Operating Mechanism | Reversibility | Best Use Case |
|---|---|---|---|
| **Tokenization** | Replaces PII with a random non-cryptographic surrogate key (`tok_123`). | Reversible (via Token Vault lookup) | Payment card numbers (PCI-DSS), SSN storage. |
| **Format-Preserving Encryption (FPE)**| Encrypts PII while preserving original data format/length (e.g., 16-digit CC remains 16 digits). | Reversible (with cryptographic key) | Legacy database columns requiring strict format validation. |
| **Dynamic Data Masking**| Obfuscates sensitive fields in query responses (e.g., `XXXX-XXXX-XXXX-1234`). | Non-reversible at client UI view | Customer support dashboards, analytics reporting. |
| **Irreversible Hashing**| Computes salted cryptographic hash (`HMAC-SHA256`). | Non-reversible | User email lookups without storing raw email text. |

### Tokenization API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/v1/tokenize` | POST | `{"pii_type": "SSN", "value": "000-12-3456"}` | `{"token": "tok_ssn_88219482", "masked": "XXX-XX-3456"}` |
| `/v1/detokenize` | POST | `{"token": "tok_ssn_88219482"}` | `{"value": "000-12-3456"}` (Requires Privileged Audit Scope) |

### Token Vault Schema & Data Model

| Field Name | Data Type | Storage Engine | Security Profile |
|---|---|---|---|
| `token_id` | String (Indexed) | Vault Storage Engine | RandomUUID non-sensitive surrogate token. |
| `encrypted_pii` | Byte Array (BLOB) | Isolated PostgreSQL DB | AES-256-GCM encrypted raw PII value. |
| `pii_type` | Enum | Relational DB | Category identifier (`EMAIL`, `SSN`, `PHONE`, `PAN`). |
| `created_at` | Timestamp | Relational DB | Record creation date for GDPR retention policies. |
| `access_audit_log` | JSONB | Audit Log Store | Tracks every detokenization request user, IP, and reason. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Isolated Token Vault** | General application database completely free of raw PII; minimizes GDPR audit scope. | Introduces HTTP latency hop to detokenize data during legitimate user workflows. | High-security financial payment systems and healthcare applications. |
| **Format-Preserving Encryption (FPE)**| Allows legacy applications to process encrypted data without schema alterations. | Cryptographic key management complexity; slightly lower security than random tokenization. | Legacy enterprise database migrations. |
| **Client-Side Hashing & Masking** | Prevents raw PII from ever reaching backend analytics or log aggregator systems. | Prevents backend systems from contacting user directly if raw value is lost. | User telemetry analytics and audit logging. |

### Key takeaway
**PII Protection** minimizes regulatory compliance risk by keeping raw personal data out of general microservices and logs. Use isolated **Token Vaults** and **Format-Preserving Encryption** to replace sensitive fields with non-sensitive surrogate tokens.
