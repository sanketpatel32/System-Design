# HTTPS
> **Category:** Security

---

### Overview
**HTTPS (Hypertext Transfer Protocol Secure)** is the secure version of HTTP that uses TLS to encrypt all communication between a client (e.g., browser or mobile app) and a server. It protects data against eavesdropping, tampering, and man-in-the-middle (MitM) attacks.

### Protocol Layering & Connection Lifecycle

```
+-------------------------------------------------------------+
| Application Layer            | HTTP / HTTP/2 / HTTP/3      |
+-------------------------------------------------------------+
| Security Layer               | TLS 1.3                      |
+-------------------------------------------------------------+
| Transport Layer              | TCP (or UDP via QUIC)        |
+-------------------------------------------------------------+
| Network Layer                | IP                           |
+-------------------------------------------------------------+

Lifecycle:
[ TCP 3-Way Handshake ] ---> [ TLS 1.3 Handshake ] ---> [ Encrypted HTTP Stream ]
```

### Public Key Infrastructure (PKI) Trust Chain

| Entity | Role in HTTPS |
|---|---|
| **Root CA** | Self-signed master authority embedded in browser/OS trust stores (e.g., DigiCert, Let's Encrypt). |
| **Intermediate CA** | Issued by Root CA to sign end-entity leaf certificates, isolating the Root CA key offline. |
| **Leaf / Server Certificate**| Issued to domain owner containing domain name (SAN), public key, and CA signature. |

### HTTPS Security Headers Matrix

| Header | Purpose | Example Value |
|---|---|---|
| **HSTS** (`Strict-Transport-Security`) | Forces browsers to load site strictly over HTTPS for specified duration | `max-age=31536000; includeSubDomains; preload` |
| **CSP** (`Content-Security-Policy`) | Prevents XSS by restricting origins for scripts/styles | `default-src 'self' https://trusted.cdn.com` |
| **X-Content-Type-Options** | Prevents MIME-sniffing vulnerabilities | `nosniff` |
| **Referrer-Policy** | Controls amount of referrer info sent with requests | `strict-origin-when-cross-origin` |

### Key System Design Trade-offs
- **Termination at Edge**: Terminating TLS at the API Gateway or Load Balancer offloads CPU-heavy decryption from internal microservices, but requires secure internal network networks (mTLS).
- **Session Caching**: Caching TLS session keys in distributed memory (Redis) reduces handshake overhead for repeat client connections.

### Key takeaway
**HTTPS** combines HTTP semantics with TLS encryption. Secure systems must mandate **HSTS** to eliminate downgrade attacks and perform TLS termination at edge load balancers for operational efficiency.
