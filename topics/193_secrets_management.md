# Secrets Management
> **Category:** Security

---

### Overview
**Secrets Management** refers to the architecture, tools, and processes used to securely store, transmit, rotate, and audit sensitive application credentials, including database passwords, API tokens, TLS private keys, and encryption keys.

### Centralized Secrets Architecture (e.g., HashiCorp Vault, AWS Secrets Manager)

```
+------------------+     1. Authenticate (K8s ServiceAccount / IAM)     +-------------------+
| App Microservice | -------------------------------------------------> | Vault / Secrets   |
+------------------+                                                    | Engine            |
        ^                                                               +-------------------+
        |                                                                         |
        |                2. Return Ephemeral Secret (TTL 1 hour)                  |
        +-------------------------------------------------------------------------+
                                                                                  |
                                                                                  v 3. Auto-Rotate
                                                                        +-------------------+
                                                                        | Target DB / API   |
                                                                        +-------------------+
```

### Core Security Principles

| Principle | Description | Implementation |
|---|---|---|
| **No Hardcoded Secrets** | Codebases & git repositories must contain zero plaintext secrets | Pre-commit hooks (TruffleHog, Gitleaks) |
| **Dynamic Ephemeral Secrets** | Generate short-lived credentials per application instance | Vault Database Secrets Engine |
| **Encryption at Rest & Transit** | Secrets encrypted with Envelope Encryption (KMS Master Key) | AES-256-GCM / Hardware Security Modules |
| **Strict Audit Logging** | Log every secret access attempt (who, when, which secret) | Tamper-proof SIEM logging |

### Secret Storage Solutions Comparison

| Solution | Storage Model | Auto-Rotation | Use Case |
|---|---|---|---|
| **HashiCorp Vault** | Multi-Cloud / On-Prem KMS | Native support for DBs, Cloud IAM | Multi-cloud enterprise infrastructure |
| **AWS Secrets Manager** | Managed AWS KMS | Integrated AWS Lambda rotation | AWS-native serverless & EC2 apps |
| **Kubernetes Secrets** | Base64 in `etcd` (Unencrypted by default) | Manual without external operator | Basic local dev (Requires KMS plugin in prod) |

### Key takeaway
Never store plaintext secrets in source code or environment variables. Implement a central **Secrets Manager** using **dynamic, ephemeral credentials**, automated key rotation, and KMS envelope encryption.
