# HTTPS

> **Category:** Security

---

HTTPS = **HTTP over TLS**. Same protocol, encrypted.

### Why HTTPS
- **Confidentiality**: ISP can't read traffic.
- **Integrity**: traffic can't be modified.
- **Authentication**: cert proves the site is real.
- **Required for HTTP/2, HTTP/3** (modern perf).
- **Required for many browser features** (geolocation, camera, service workers).

### Setup
1. Get a certificate (Let's Encrypt, ACM, paid CA).
2. Configure web server (NGINX, Apache) to listen on 443 with the cert.
3. Redirect HTTP → HTTPS.
4. Set HSTS header.

### Let's Encrypt
- Free, automated certs.
- ACME protocol: Certbot, Lego, etc.
- Auto-renew via cron.
- 90-day cert lifetime (forces automation).

### Performance
- TLS handshake adds 1-2 round trips (TLS 1.3 = 1).
- HTTP/2 (and HTTP/3) multiplexing makes HTTPS faster than HTTP/1.1.
- Connection reuse (keep-alive) amortizes handshake.
- 0-RTT resumption skips handshake on repeat visits.

### HSTS
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
- Forces browser to use HTTPS for the domain.
- Prevents downgrade attacks.
- Preload list: built into browsers.

### Common issues
- Mixed content (HTTP subresources break HTTPS).
- Expired certs → browser warnings.
- Self-signed certs → warnings unless CA trusted.
- Old TLS versions (1.0/1.1) — deprecated.

### Key takeaway
HTTPS is mandatory. Get free certs from Let's Encrypt, automate renewal, set HSTS, use HTTP/2+
for performance. No excuses for HTTP today.
