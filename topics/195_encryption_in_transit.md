# Encryption in Transit

> **Category:** Security

---

Encryption in transit = **encrypting data as it moves** between systems.

### Why
- Networks can be eavesdropped (coffee shop Wi-Fi, ISP).
- Traffic can be tampered.
- Compliance (PCI, HIPAA).
- Defense in depth.

### How
- **TLS** for HTTP, gRPC, SMTP — the standard.
- **mTLS** for service-to-service.
- **IPsec / WireGuard** for VPN / network-level.
- **SSH** for shell access.

### TLS recap
- Server cert proves identity.
- ECDHE for key exchange.
- AES-GCM / ChaCha20 for bulk encryption.
- TLS 1.3 is the modern standard.

### Layers
1. **External** (user → your edge): TLS via HTTPS.
2. **Edge → internal** (LB → services): TLS or mTLS.
3. **Service → service** (microservices): mTLS via service mesh.
4. **Service → DB**: TLS to Postgres / Redis / Kafka.
5. **Service → external API**: HTTPS.

### Internal TLS
- Internal services often run plain HTTP behind the LB.
- Risk: anyone on the network can sniff.
- **Service mesh** (Istio, Linkerd) adds mTLS everywhere transparently.

### Certificates
- Public: Let's Encrypt for external.
- Internal: private CA (cert-manager, step-ca, Vault PKI).
- Auto-renew via ACME.

### Trade-offs
- ✅ Confidentiality.
- ✅ Integrity.
- ✅ Authentication.
- ❌ Latency (handshake).
- ❌ CPU cost (encryption).
- ❌ Cert management complexity.

### Modern best practices
- HTTPS only (HSTS).
- TLS 1.3 only.
- mTLS between services (service mesh).
- Auto-rotating certs.

### Key takeaway
Encrypt all traffic, externally (HTTPS) and internally (mTLS). Use TLS 1.3. For internal
service-to-service, use a service mesh (Istio, Linkerd) to get mTLS without code changes.
Automate cert management.
