# Encryption at Rest

> **Category:** Security

---

Encryption at rest = **encrypting stored data** so that physical disk theft or snapshot
access doesn't reveal plaintext.

### Why
- Disk theft (data center, lost laptop).
- Snapshot access (cloud snapshot leaks).
- Compliance (GDPR, HIPAA, PCI).
- Defense in depth.

### How it works
```
App writes data -> encrypt with DEK (data key) -> write ciphertext to disk.
DEK is encrypted with KEK (key encryption key) -> stored separately.
KEK is stored in KMS / HSM.
```

### Key hierarchy
- **DEK** (Data Encryption Key): encrypts actual data. One per object/file/volume.
- **KEK** (Key Encryption Key): encrypts DEKs.
- **Master key**: encrypts KEKs (in HSM).
- Allows rotating KEK without re-encrypting all data.

### Where to encrypt
| Layer | Example |
|-------|---------|
| Disk | EBS encryption, LUKS |
| DB | TDE (SQL Server), pgcrypto |
| Object storage | S3 SSE-S3, SSE-KMS |
| Application | encrypt before storing |

### Cloud-native
- **AWS**: KMS for keys, S3/EBS/RDS integration.
- **GCP**: Cloud KMS, CMEK.
- **Azure**: Key Vault, Storage Service Encryption.

### Application-level
- Encrypt sensitive fields before storing.
- More flexible (per-field keys, per-tenant keys).
- Harder to implement.

### Tokenization vs encryption
- **Encryption**: reversible with key.
- **Tokenization**: replace sensitive value with token; mapping in vault.
- Tokenization is preferred for PCI (credit cards).

### Trade-offs
- ✅ Compliance.
- ✅ Defense in depth.
- ✅ Snapshot / disk theft protection.
- ❌ Small performance overhead.
- ❌ Key management complexity.
- ❌ Doesn't protect against app compromise (attacker sees plaintext via app).

### Key takeaway
Encrypt everything at rest. Use cloud KMS (AWS KMS, GCP KMS) for key management. Layer: disk
encryption + DB encryption + field-level for highly sensitive data. Rotate keys. Doesn't
replace the need for app-level security.
