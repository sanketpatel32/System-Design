# DDoS Protection
> **Category:** Security

---

### Overview
**Distributed Denial of Service (DDoS) Protection** encompasses hardware, network routing, edge filtering, and software rate-limiting architectures designed to absorb, mitigate, and inspect malicious floods of traffic intended to exhaust target system resources and take services offline.

### Multi-Layer DDoS Mitigation Pipeline

```
+--------------------------------------------------------------------------+
| Layer 3 / Layer 4 (Network & Transport Flood Protection)                |
| [ Anycast DNS / BGP Anycast Routing ] --> [ Scrubbing Centers (Cloudflare)|
+--------------------------------------------------------------------------+
                                     |
                                     v Filtered Clean Traffic
+--------------------------------------------------------------------------+
| Layer 7 (Application Layer Protection)                                   |
| [ WAF Rules / Challenge Engine ] --> [ API Gateway Rate Limiter ]        |
+--------------------------------------------------------------------------+
                                     |
                                     v Legitimate Requests
                          [ Application Servers ]
```

### DDoS Attack Vectors & Defense Matrix

| OSI Layer | Attack Vector | Attack Mechanism | Mitigation Mechanism |
|---|---|---|---|
| **Layer 3 (Network)** | ICMP Flood, IP Protocol Flood | Saturation of network link bandwidth | BGP Anycast, Scrubbing Centers |
| **Layer 4 (Transport)**| SYN Flood, UDP Amplification | Exhaustion of TCP connection state tables | SYN Cookies, Anycast routing, Router rate-limiting |
| **Layer 7 (Application)**| HTTP Flood, Slowloris, GraphQL complexity | Exhaustion of CPU, memory, database connection pool | WAF JavaScript challenge, Rate Limiting, CAPTCHA |

### Mitigation Mechanisms Explained
1. **BGP Anycast Routing**: Routes incoming traffic across dozens of globally distributed edge PoPs (Points of Presence), scattering giant volumetric attacks across worldwide bandwidth capacity.
2. **SYN Cookies**: The server crafts a cryptographic sequence number in the TCP `SYN-ACK` response without allocating memory until the final `ACK` is returned, preventing SYN pool exhaustion.
3. **Web Application Firewall (WAF)**: Inspects Layer 7 request headers, IP reputation, and behavioral metrics to challenge suspicious traffic (JS Proof-of-Work, Managed Turnstile).

### Key takeaway
Effective DDoS protection relies on **defense-in-depth**: absorb volumetric Layer 3/4 attacks via **BGP Anycast scrubbing networks**, and block application Layer 7 floods using **WAF rate limiting, CAPTCHAs, and SYN cookies**.
