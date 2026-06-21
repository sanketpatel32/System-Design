# Secrets Management

> **Category:** Security

---

Secrets management = **securely storing, distributing, and rotating secrets** (passwords,
API keys, certs, tokens).

### What's a secret
- Database passwords.
- API keys (Stripe, GitHub, AWS).
- TLS private keys.
- OAuth client secrets.
- SSH keys.
- Encryption keys (KMS).

### Why dedicated management
- **Don't commit to git** (leaks).
- **Don't bake into images** (compromise = leak).
- **Rotate easily**.
- **Audit access**.
- **Centralize**.

### Approaches

#### 1. Secret manager (Vault, AWS SM, GCP SM)
- Centralized store.
- App fetches at startup.
- Auto-rotation.
- Audit logs.
- Encryption at rest (KMS).

#### 2. Cloud KMS / HSM
- For encryption keys (more sensitive than secrets).
- Hardware-backed (HSM) for highest security.
- AWS KMS, GCP KMS, Azure Key Vault.

#### 3. Environment variables
- Simple, but leak (process listings, container inspect).
- OK for non-sensitive config; bad for secrets.

#### 4. Config files with restricted permissions
- Works on single host.
- Doesn't scale, hard to rotate.

### Vault pattern
```
1. App authenticates to Vault (via k8s service account, etc.).
2. Vault returns secret (with TTL).
3. App uses secret.
4. Vault auto-rotates underlying DB password.
```

### Best practices
- **Least privilege**: each app gets only the secrets it needs.
- **Rotation**: automate where possible.
- **Audit**: log every access.
- **Encryption at rest**: KMS / HSM.
- **No secrets in code / git / images / logs**.
- **Separate environments**: dev/staging/prod keys.

### Leaks
- Scan git history for secrets (git-secrets, trufflehog).
- Revoke immediately on suspicion.
- Have an incident response plan.

### Key takeaway
Use a secret manager (Vault, AWS Secrets Manager). Apps fetch at startup, never hard-code.
Encrypt at rest with KMS, rotate regularly, audit access. Scan for leaks — assume secrets will
leak eventually.
