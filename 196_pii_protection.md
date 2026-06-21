# PII Protection

> **Category:** Security

---

PII (Personally Identifiable Information) = **data that identifies a person**: name, email,
SSN, phone, IP address, biometrics, location.

### Why protect
- **Privacy regulations**: GDPR (EU), CCPA (California), HIPAA (health), PCI (cards).
- **User trust**: leaks damage brand.
- **Fines**: GDPR up to 4% of global revenue.

### Principles
1. **Minimize**: collect only what you need.
2. **Anonymize / pseudonymize**: replace with IDs where possible.
3. **Encrypt**: at rest + in transit.
4. **Access control**: only those who need it.
5. **Audit**: track who accessed what.
6. **Retain minimally**: delete when no longer needed.
7. **Honor deletion**: GDPR right to erasure.

### Techniques

#### Pseudonymization
- Replace PII with a token; mapping stored separately.
- Reversible with access to vault.
- Reduces risk if main DB leaks.

#### Anonymization
- Irreversibly remove identifying info.
- Hard to do well (re-identification possible with correlated data).

#### Encryption
- Field-level encryption for sensitive columns.
- Tokenization for PCI.

#### Data masking
- Show partial data to support agents (`**** **** **** 1234`).

#### Differential privacy
- Add noise to aggregates so individuals can't be identified.
- Used by Apple, Census.

### Access control
- **RBAC**: only roles that need PII can access.
- **Audit logs**: track every read.
- **Just-in-time access**: temporary elevated permissions.

### Lifecycle
- **Collection**: consent, purpose limitation.
- **Storage**: encrypted, access-controlled.
- **Use**: minimal access.
- **Deletion**: scheduled, on request.

### Compliance
- Map data flows.
- Data Processing Agreements with vendors.
- Data residency (EU data in EU).
- Breach notification within 72 hours (GDPR).

### Key takeaway
PII protection = minimize, encrypt, control access, audit, delete. Pseudonymize where you can.
Comply with regulations (GDPR, CCPA). Treat PII as a liability, not just an asset.
