# Encryption at Rest
> **Category:** Security

---

### Overview
**Encryption at Rest** protects data stored on persistent physical media (hard drives, SSDs, database files, object stores) from physical theft, unauthorized drive access, or compromised snapshot leaks.

### Envelope Encryption Architecture

```
+------------------------------------------------------------------------+
|                          Envelope Encryption                           |
+------------------------------------------------------------------------+
|                                                                        |
|  [ Data Key (DEK) ] ---> Encrypts Plaintext Data ---> [ Storage Disk ] |
|          |                                                             |
|          v                                                             |
|  [ Master Key (KEK) in KMS / HSM ] ---> Encrypts DEK ---> [ Stored DEK]|
+------------------------------------------------------------------------+
```

### Encryption Layers in Modern Infrastructure

| Layer | Encryption Technique | Components Protected | Trade-off |
|---|---|---|---|
| **Disk / Block Level** | LUKS, AWS EBS Encryption, BitLocker | Whole drive, OS, swap files | Fast, transparent; vulnerable if OS is live compromised |
| **Database Level** | Transparent Data Encryption (TDE) | Database tablespaces, WAL logs | Protects data files; minimal application changes |
| **Application Level** | Client-side cryptographic SDKs | Field-level sensitive data (SSN, Cards)| Maximum security; prevents DB admin from seeing raw data |

### Symmetric Encryption Algorithms

| Algorithm | Key Length | Security Profile | Usage |
|---|---|---|---|
| **AES-GCM** | 128 / 256 bits | **Gold Standard** (Authenticated Encryption AEAD) | Hardware accelerated (AES-NI), default for KMS |
| **ChaCha20-Poly1305** | 256 bits | AEAD alternative | Fast on hardware lacking AES-NI (Mobile devices) |
| **AES-CBC + HMAC** | 128 / 256 bits | Legacy symmetric | Requires manual MAC check; prone to padding oracle bugs |

### Key Management Best Practices
1. **Separate Keys from Data**: Master keys (KEK) must reside inside a dedicated **Hardware Security Module (HSM)** or Cloud KMS.
2. **Key Rotation**: Rotate Data Encryption Keys (DEKs) frequently (e.g., annually or automatically after $2^{32}$ block encryptions).

### Key takeaway
Implement **Envelope Encryption** for data at rest. Encrypt data payload using ephemeral Data Encryption Keys (**AES-256-GCM**) and protect those keys using a dedicated Hardware Security Module or Cloud KMS.
