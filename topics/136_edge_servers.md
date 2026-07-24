# Edge Servers

> **Category:** CDN and Media Delivery

---

Edge servers are high-performance computing nodes positioned at the **periphery of the network (Points of Presence - PoPs)**, close to end users. They terminate TLS/TCP connections, cache static assets, enforce rate limiting and WAF security rules, and execute serverless code at the edge.

### Edge Server Functional Architecture

An edge server operates as a multi-layered proxy handling incoming client requests before they ever reach the central cloud origin.

```
                                +---------------------------+
                                |        End User           |
                                +---------------------------+
                                              |
                                    TCP / TLS Handshake
                                              v
+----------------------------------------------------------------------------------------------------+
|                                    Edge Server (Point of Presence)                                 |
| +-------------------------+ +-------------------------+ +-------------------------+                |
| | Anycast BGP Routing     | | TLS Termination & HTTP/3| | WAF & Rate Limiting     |                |
| +-------------------------+ +-------------------------+ +-------------------------+                |
| +-------------------------+ +-------------------------+ +-------------------------+                |
| | In-Memory RAM Cache     | | SSD Disk Storage Cache  | | Edge Compute Workers    |                |
| | (Hot Assets)            | | (Warm Assets)           | | (Cloudflare Workers)   |                |
| +-------------------------+ +-------------------------+ +-------------------------+                |
+----------------------------------------------------------------------------------------------------+
                                              |
                                  Persistent Keep-Alive Connection
                                              v
                                +---------------------------+
                                |       Origin Server       |
                                +---------------------------+
```

### Core Capabilities of Modern Edge Servers

1. **Anycast IP Routing**: BGP Anycast routes client IP packets to the topologically nearest edge server automatically.
2. **TLS Termination & Offloading**: Performs heavy RSA/ECDSA TLS handshakes at the edge, maintaining pre-warmed persistent TCP connections back to origin.
3. **Edge Compute (Serverless at the Edge)**: Executes lightweight V8 Javascript runtime code (e.g., Cloudflare Workers, AWS Lambda@Edge) for A/B testing, header modification, and JWT validation.
4. **Web Application Firewall (WAF)**: Filters malicious SQL injection, XSS, and volumetric DDoS attacks before traffic reaches origin infrastructure.

### Edge Server vs Origin Server Matrix

| Dimension | Edge Server | Origin Server |
| :--- | :--- | :--- |
| **Geographic Location** | Distributed globally across 300+ PoPs | Centralized in specific Cloud Regions (e.g. `us-east-1`) |
| **Primary Focus** | Caching, Connection Termination, Fast Delivery | Business Logic Execution, Transaction Processing |
| **Storage Capacity** | Transient Ephemeral RAM/SSD Cache | Authoritative Persistent Databases & Storage |
| **Compute Constraints** | Bounded CPU/RAM (Sub-50ms execution timeouts) | Heavy compute instances, unconstrained memory |

### Key Trade-offs & Operational Rules

- ✅ **Sub-Millisecond TLS Handshakes**: Reduces RTT latency for global users by terminating TLS connections close to the user.
- ✅ **Distributed DDoS Protection**: Absorbs multi-terabit volumetric attacks across distributed PoP capacity.
- ❌ **Cold Cache Misses**: Initial requests to cold edge locations still incur full round-trip latency to origin.
- ❌ **Limited Compute State**: Edge workers are stateless; state persistence requires external distributed key-value stores.

### Key takeaway

Edge servers bring **caching, TLS termination, WAF security, and stateless serverless compute** directly to the network periphery, drastically cutting latency and protecting origin systems.
