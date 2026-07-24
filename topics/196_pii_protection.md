# PII Protection
> **Category:** Security

---

### Overview
**Personally Identifiable Information (PII)** protection involves technical controls, tokenization, anonymization, and data isolation strategies designed to safeguard sensitive personal data (e.g., SSN, email, phone numbers, home address) and comply with privacy regulations (GDPR, CCPA, HIPAA).

### PII Data Isolation Architecture (Vault Pattern)

```
[ Application Service ] ---> Writes PII Data ---> [ Isolated PII Vault DB ]
        |                                                 |
        | Generates Unique Token                           | Encrypts with KMS
        v                                                 v
[ General App Database ] <--- Stores Token (UUID) <-------+
(Contains NO Raw PII)
```

### Anonymization & Protection Techniques

| Technique | Description | Reversible? | Primary Use Case |
|---|---|---|---|
| **Tokenization** | Replaces PII with non-sensitive surrogate tokens (UUIDs) | Yes (via Token Vault) | Credit Card Processing (PCI-DSS), User ID masking |
| **Pseudonymization** | Replaces direct identifiers with artificial identifiers | Yes (with secret key) | Analytics data pipelines, GDPR compliance |
| **Data Masking** | Hides parts of sensitive fields (e.g., `XXXX-XXXX-1234`) | No | Customer support UI, non-prod environments |
| **Differential Privacy** | Adds mathematical noise to statistical queries | No | Global analytics without exposing individuals |

### Regulatory & Data Lifecycle Requirements

| Requirement | Description | Technical Implementation |
|---|---|---|
| **Right to be Forgotten** | User request to delete all personal records | Soft deletion -> Async purge job across DBs and search indexes |
| **Data Residency** | PII must not leave specified geographic boundaries | Multi-region database partitioning (e.g., CockroachDB row-level loc) |
| **Field-Level Encryption** | Encrypt PII fields in database before write | Client-side envelope encryption with user-scoped KMS keys |

### Key takeaway
Protect PII by isolating sensitive fields into a dedicated **PII Vault**, replacing raw records with **tokens** in general application databases, and enforcing **field-level encryption** and strict audit trails.
