# HTTP vs HTTPS

> **Category:** Networking Basics

---

HTTPS is **HTTP over TLS** — same application protocol, but the bytes between client and
server are encrypted and authenticated.

### The difference
```
HTTP    : client --- plaintext --- server      (port 80)
HTTPS   : client --- TLS tunnel --- server     (port 443)
```

### Why HTTPS
1. **Confidentiality** — ISP / coffee-shop Wi-Fi can't read your traffic.
2. **Integrity** — packets can't be tampered with in transit.
3. **Authentication** — certificate proves you reached the real `bank.com`, not an imposter.

### TLS handshake (1.2)
```
ClientHello (proposed ciphers, random)
ServerHello (chosen cipher, cert, random)
Key exchange (RSA / ECDHE)  -> shared secret
Finished (encrypted) -> ready
```
2 round trips before first HTTP byte. TLS 1.3 reduces to 1 RTT (or 0-RTT with resumption).

### Modern best practice
- **HTTPS everywhere** — HSTS header forces HTTPS, browsers reject downgrade.
- **TLS 1.3** — faster, more secure, mandatory PFS.
- **Cert management** — Let's Encrypt (free, auto-renewing), ACM (managed).
- **OCSP stapling** — server bundles revocation status to avoid extra round trips.

### Performance
- TLS adds ~1-2 RTT latency on first connection.
- **Connection reuse** (keep-alive, HTTP/2 multiplexing) amortizes this.
- **Session resumption / 0-RTT** skips handshake on repeat visits.

### Key takeaway
There's no excuse for HTTP today. Always design for HTTPS from day one — let's Encrypt for free
certs, ACM for managed certs, and HTTP/2+ for performance.
