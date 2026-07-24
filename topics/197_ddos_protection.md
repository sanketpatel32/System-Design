# DDoS Protection
> **Category:** Security

---

### Overview
**Distributed Denial of Service (DDoS) Protection** encompasses the architectural defenses, network scrubbing mechanisms, and traffic filtering systems designed to keep web applications operational during malicious traffic floods. Attackers orchestrate botnets to saturate system bandwidth or exhaust server CPU/memory resources.

DDoS defenses operate across multiple OSI layers, countering **Layer 3/4 network floods** (SYN Floods, UDP Amplification) using Anycast network scrubbing, and **Layer 7 application floods** (HTTP GET/POST storms) using WAF rate limiting and challenge verification.

### Anycast Scrubbing & Multi-Layer DDoS Architecture

```
+--------------------------------------------------------------------------+
| ATTACK BOTNET / LEGITIMATE USERS (Global Traffic Traffic Flood)           |
+--------------------------------------------------------------------------+
                                     |
                                     v Anycast DNS Routing
+--------------------------------------------------------------------------+
| EDGE SCRUBBING NETWORK (Cloudflare / AWS Shield / Akamai Edge POPs)      |
|  [ Layer 3/4 BGP Route Scrubbing ] --> [ SYN Proxy & Rate Limiting ]      |
+--------------------------------------------------------------------------+
                                     |
                                     v Filtered Clean Traffic (L7 WAF)
+--------------------------------------------------------------------------+
| APPLICATION WAF & RATE LIMITER (JS Challenge / CAPTCHA Validation)       |
+--------------------------------------------------------------------------+
                                     |
                                     v Origin IP Hidden (mTLS / Cloudflare Tunnel)
+--------------------------------------------------------------------------+
| ORIGIN INFRASTRUCTURE (Load Balancer & Application Microservices)        |
+--------------------------------------------------------------------------+
```

### DDoS Attack Vectors & Defense Strategies

| OSI Layer | Attack Type | Attack Mechanism | Mitigating Technology |
|---|---|---|---|
| **Layer 3 (Network)** | ICMP Flood, IP Anomaly | Floods network interface with raw IP packets. | Anycast DNS BGP Route Scrubbing, ISP Blackholing. |
| **Layer 4 (Transport)**| SYN Flood, UDP Amplification| Exhausts OS TCP connection tables using spoofed IPs.| SYN Cookies, TCP Rate Limiting, Anycast Scrubbing. |
| **Layer 7 (Application)**| HTTP Request Storm, Slowloris| Exhausts backend worker threads and DB connection pools. | Web Application Firewall (WAF), JS Challenge, Rate Limiter. |

### DDoS Defense Rules Engine API Interface

| Endpoint | Method | Request Payload | Action / Description |
|---|---|---|---|
| `/v1/waf/rules` | POST | `{"rule": "rate_limit", "threshold": 100, "window_sec": 60, "action": "js_challenge"}` | Installs dynamic L7 rate limit rule on Edge WAF. |
| `/v1/waf/ip_block` | POST | `{"ip_range": "198.51.100.0/24", "duration": "1h", "reason": "SYN_FLOOD"}` | Automatically drops packets at BGP/Anycast edge scrubbing layer. |

### IP Reputation & Threat Intelligence Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `ip_address` | String (CIDR) | Redis / Edge KV | Attacking client IP or subnet identifier. |
| `threat_score` | Integer (0-100) | Redis / Memory | Calculated risk score based on request frequency and bot signatures. |
| `active_challenge` | Enum | Edge Cache | Challenge type currently served (`CAPTCHA`, `JS_CHALLENGE`, `BLOCK`). |
| `request_rate_1m` | Counter | Memory (Redis Cell) | Real-time rolling count of requests received per minute. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Cloud Edge Scrubbing (Anycast WAF)** | Absorbs terabit-scale floods at network edge; hides origin IP address. | High vendor cost; introduces slight network latency hop for legitimate users. | Public consumer web applications and mission-critical APIs. |
| **JavaScript Challenges (Cloudflare Turnstile)**| Silently filters automated L7 bot scripts without impacting real human users. | Fails on non-browser API clients unless bypass keys or SDK tokens are configured. | Browser-facing login forms and public landing pages. |
| **Origin IP Cloaking (Tunneling)** | Completely blocks direct-to-origin IP attacks bypassing edge proxies. | Requires strict firewall setups blocking all non-proxy IP ranges. | Backend APIs deployed behind public CDN proxy networks. |

### Key takeaway
**DDoS Protection** defends systems against traffic saturation using Anycast network scrubbing for L3/L4 volumetric floods and WAF rate limiting with JavaScript challenges for L7 application attacks.
