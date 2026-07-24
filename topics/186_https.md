# HTTPS
> **Category:** Security

---

### Overview
**HTTPS (Hypertext Transfer Protocol Secure)** is the secure version of HTTP that encrypts all application layer communication using TLS/SSL. It guarantees three fundamental security principles across public networks: **Confidentiality** (preventing eavesdropping), **Integrity** (detecting payload tampering), and **Authenticity** (verifying server identity via CA signed certificates).

Operating over default port **443**, HTTPS protects sensitive data such as authentication tokens, personal identification information (PII), and financial payloads against Man-in-the-Middle (MitM) attacks.

### HTTPS Protocol Stack & Decryption Architecture

```
+--------------------------------------------------------------------------+
| HTTP / HTTP/2 / HTTP/3 Application Layer Payload (JSON, HTML, Headers)  |
+--------------------------------------------------------------------------+
                                    |
                                    v Encrypted by TLS
+--------------------------------------------------------------------------+
| TLS 1.3 Security Layer (Symmetric Encryption: AES-GCM / CHACHA20-POLY1305)|
+--------------------------------------------------------------------------+
                                    |
                                    v Transport Layer
+--------------------------------------------------------------------------+
| TCP (Port 443) OR QUIC (UDP Port 443 for HTTP/3)                         |
+--------------------------------------------------------------------------+
                                    |
                                    v Network Layer
+--------------------------------------------------------------------------+
| IP Layer (Routing & Packet Forwarding)                                   |
+--------------------------------------------------------------------------+
```

### Essential HTTPS Security Response Headers

| Security Header | Value Example | Defensive Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Forces browsers to convert all HTTP connections to HTTPS automatically (HSTS). |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' https://cdn.example.com` | Prevents Cross-Site Scripting (XSS) and unauthorized script execution. |
| `X-Content-Type-Options` | `nosniff` | Prevents browsers from MIME-sniffing responses away from declared content type. |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | Protects web applications against Clickjacking attacks inside iframes. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits sensitive URI query parameters leaked in HTTP Referer headers. |

### HTTP/1.1 vs HTTP/2 vs HTTP/3 over HTTPS Matrix

| Technical Metric | HTTPS over HTTP/1.1 | HTTPS over HTTP/2 | HTTPS over HTTP/3 (QUIC) |
|---|---|---|---|
| **Transport Layer** | TCP (Port 443) | TCP (Port 443) | UDP (Port 443) |
| **Multiplexing** | No (Head-of-Line Blocking per domain) | Yes (Multiplexed streams over single TCP stream) | Yes (Native independent streams over UDP) |
| **Handshake Latency** | 2-RTT to 3-RTT (TCP + TLS) | 2-RTT (TCP + TLS 1.3) | 1-RTT / 0-RTT combined QUIC+TLS handshake |
| **TCP HoL Blocking** | Severe | Present if TCP packet drop occurs | Completely eliminated |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **HSTS Preloading** | Eliminates initial unencrypted HTTP redirect vector on first domain visit. | Irreversible domain-wide HTTPS lock; broken staging domains if certificates expire. | Production public enterprise domains and SaaS applications. |
| **HTTP/3 (QUIC) Enabling** | Significantly improves mobile network performance during cell tower switching. | High CPU consumption on edge routers; blocked by strict enterprise UDP firewalls. | Mobile streaming apps and global consumer web applications. |
| **Full End-to-End HTTPS Encryption** | Complete Zero-Trust network protection inside internal datacenters. | CPU decryption overhead on every microservice hop; complex internal CA management. | FinTech, healthcare, and strictly compliant cloud architectures. |

### Key takeaway
**HTTPS** secures web application traffic by layering HTTP over TLS encryption. Mitigate Man-in-the-Middle vulnerabilities and protocol downgrade attacks by enforcing HSTS, modern TLS 1.3 suites, and security response headers.
