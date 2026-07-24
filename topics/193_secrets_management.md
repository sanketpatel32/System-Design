# Secrets Management
> **Category:** Security

---

### Overview
**Secrets Management** encompasses the tools, architectural patterns, and workflows used to securely store, transmit, rotate, and audit access to sensitive operational credentials—such as database passwords, API tokens, TLS private keys, and encryption keys.

Centralized secret managers (e.g., HashiCorp Vault, AWS Secrets Manager) replace dangerous hardcoded strings and plain-text configuration files with **KMS Envelope Encryption**, dynamic short-lived credentials, and strict audit logging.

### KMS Envelope Encryption & Vault Architecture

```
+--------------------+     1. Request Secret ("db_password")    +--------------------+
| Application Pod /  | ---------------------------------------> | Secret Manager     |
| Microservice Node  | <--------------------------------------- | (HashiCorp Vault)  |
+--------------------+     4. Return Decrypted Secret Payload   +--------------------+
                                                                           |
                                                                           | 2. Request DEK Decryption
                                                                           v
                                                                +--------------------+
                                                                | Key Management     |
                                                                | Service (KMS)      |
                                                                | Master KEK         |
                                                                +--------------------+
```

### Core Mechanics: Envelope Encryption
1. **Master Key (KEK):** Stored inside Hardware Security Modules (HSM) in AWS KMS / GCP KMS; never leaves the HSM.
2. **Data Encryption Key (DEK):** Generated locally to encrypt the secret payload.
3. **Envelope Packaging:** The secret is encrypted with the DEK, and the DEK is encrypted with the Master KEK.
4. **Decryption:** Vault requests KMS to decrypt the DEK using the KEK, then decrypts the secret payload in memory.

### Vault API Interface Specifications

| Endpoint / Command | Method | Request Payload | Response Payload / Description |
|---|---|---|---|
| `/v1/secret/data/db` | GET | `X-Vault-Token: s.881a...` | `{"data": {"data": {"username": "admin", "pass": "s3cr3t"}}, "lease_duration": 3600}` |
| `/v1/sys/leases/renew`| POST | `{"lease_id": "database/creds/readonly/lease_1"}`| Renews lease duration for dynamic credentials. |
| `/v1/database/creds/role`| GET | `X-Vault-Token: s.881a...` | Generates dynamic, single-use database credentials valid for 1 hour. |

### Secrets Storage & Lease Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `secret_path` | String (Indexed) | Vault Storage Engine (Raft) | Namespace route identifying the target secret (e.g., `secret/prod/payment`). |
| `encrypted_payload` | Byte Array (BLOB) | Storage Engine (Raft) | Secret payload encrypted via AES-256-GCM using local DEK. |
| `version` | Integer | Vault Storage Engine | Secret revision number for version tracking and rollback. |
| `lease_id` | String | Vault Engine | Tracking ID for dynamic short-lived credentials. |
| `ttl_seconds` | Integer | Vault Engine | Expiration countdown before dynamic credentials automatically expire. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Dynamic Short-Lived Secrets** | Credential leaks expire automatically in minutes; eliminates static long-lived passwords. | Requires application services to handle secret lease renewal and reconnect logic. | Production microservices connecting to SQL databases and cloud resources. |
| **Static Secrets in Vault** | Simple drop-in replacement for environment variables; supports versioning. | Leaked secrets remain valid indefinitely until manually rotated. | External third-party API keys that do not support dynamic generation. |
| **Environment Variables (K8s Secrets)**| Easy integration; readable by all standard language runtimes. | Exposed to all child processes and dumped in crash logs/memory dumps. | Non-sensitive runtime flags and development environments. |

### Key takeaway
**Secrets Management** protects operational credentials through centralized access controls, audit trails, and Envelope Encryption. Transition from static hardcoded credentials to dynamic, short-lived secrets automatically rotated via Secret Managers.
