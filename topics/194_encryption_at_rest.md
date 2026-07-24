# Encryption at Rest
> **Category:** Security

---

### Overview
**Encryption at Rest** ensures that sensitive data stored on persistent media (solid-state drives, hard disks, object storage, and database tables) is unreadable without the corresponding cryptographic decryption keys. It protects organizations against physical storage device theft, unauthorized drive snapshots, and cloud infrastructure data leaks.

Standard implementations enforce **AES-256 (Advanced Encryption Standard)** in Galois/Counter Mode (GCM) paired with **Envelope Encryption** managed by Hardware Security Modules (HSM).

### Envelope Encryption Architecture for Storage Devices

```
+--------------------------------------------------------------------------+
| DATA FILE / DATABASE BLOCK (Plaintext Payload)                           |
+--------------------------------------------------------------------------+
                                     |
                                     v Encrypted via AES-256-GCM
+--------------------------------------------------------------------------+
| ENCRYPTED DATA FILE (Ciphertext Payload)                                 |
+--------------------------------------------------------------------------+
                                     ^
                                     | Data Encryption Key (DEK)
+--------------------------------------------------------------------------+
| ENCRYPTED DEK (Ciphertext Key)                                           |
+--------------------------------------------------------------------------+
                                     ^
                                     | Encrypted via Key Encryption Key (KEK)
+--------------------------------------------------------------------------+
| HARDWARE SECURITY MODULE (KMS HSM: Master Key - KEK)                     |
+--------------------------------------------------------------------------+
```

### Encryption Levels Comparison

| Encryption Tier | Operational Layer | Encryption Mechanism | Threat Mitigation |
|---|---|---|---|
| **Application-Level** | Application Code | Sensitive fields encrypted before sending to DB (Client-Side Encryption). | Protects against compromised DB admins, SQL injection leaks, and storage breaches. |
| **Database-Level (TDE)**| Database Engine | Transparent Data Encryption (TDE) encrypts tablespaces and log files. | Protects against compromised raw database disk backups and storage leaks. |
| **Block/Disk-Level** | Storage OS / Driver | LUKS, AWS EBS Encryption, BitLocker encrypts block storage volumes. | Protects against physical disk theft and cloud hypervisor volume theft. |

### KMS Data Key API Specifications

| API Endpoint | Operation | Input Parameters | Output Payload |
|---|---|---|---|
| `kms:GenerateDataKey` | RPC / API | `KeyId: "arn:aws:kms:..."`, `KeySpec: "AES_256"` | `{"Plaintext": "DEK_RAW_BYTES", "CiphertextBlob": "DEK_ENCRYPTED_BLOB"}` |
| `kms:Decrypt` | RPC / API | `CiphertextBlob: "DEK_ENCRYPTED_BLOB"` | `{"Plaintext": "DEK_RAW_BYTES"}` |

### Encrypted Record Database Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `record_id` | UUID | PostgreSQL / DynamoDB | Primary Identifier |
| `encrypted_payload` | Byte Array (BLOB) | Relational DB / S3 | AES-256-GCM encrypted ciphertext of sensitive record fields. |
| `iv_nonce` | Byte Array (12 bytes) | Relational DB | Unique Initialization Vector (IV) for GCM mode (never reused). |
| `auth_tag` | Byte Array (16 bytes) | Relational DB | Authentication tag validating ciphertext integrity and preventing tampering. |
| `kms_dek_encrypted` | Byte Array | Relational DB | Encrypted DEK bound to this specific data record. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Application-Level Encryption** | Ultimate security; data remains encrypted in database memory, backups, and logs. | Disables native database indexing, range queries, and substring SQL searches. | Highly sensitive PII, credit card numbers (PCI-DSS), and medical records (HIPAA). |
| **Transparent Data Encryption (TDE)**| Zero code changes required; native database engine performance optimization. | Database administrator with query access can view decrypted data. | Standard enterprise databases compliance requirements. |
| **Cloud Infrastructure Disk Encryption**| Negligible performance overhead; automatic cloud provider KMS integration. | Does not protect against application-level data exposure or compromised API keys. | Baseline security requirement for all cloud block storage volumes. |

### Key takeaway
**Encryption at Rest** safeguards stored data using symmetric AES-256 encryption. Combine Envelope Encryption (DEK + KMS KEK) with application-level field encryption to protect sensitive data against physical storage theft and database compromise.
