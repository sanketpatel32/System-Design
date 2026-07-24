# Edge Servers

> **Category:** CDN and Media Delivery

---

Edge Servers are computing and caching nodes placed at the **perimeters of network backbones** (PoPs) near internet service providers (ISPs) to execute caching, TLS termination, and serverless edge logic.

### Edge Server Architecture

```
+-----------------------------------------------------------------------------------+
|                            Edge Point of Presence (PoP)                           |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +--------------------+    +--------------------+    +--------------------+  |
|  | Anycast Router     | -> | TLS / HTTP Reverse | -> | Edge Compute Engine|  |
|  | (BGP Routing)      |    | Proxy (Nginx/Envoy)|    | (V8 Isolate Worker)|  |
|  +--------------------+    +--------------------+    +--------------------+  |
|                                                               |                   |
|                                                               v                   |
|                                                      +--------------------+  |
|                                                      | In-Memory NVMe     |  |
|                                                      | Cache Store        |  |
|                                                      +--------------------+  |
+-----------------------------------------------------------------------------------+
```

### Edge Capabilities & Functional Comparison

| Capability | Processing Location | Primary Use Case | Example Technologies |
| :--- | :--- | :--- | :--- |
| **TLS Termination** | Edge PoP | Offloads CPU-intensive TLS handshakes | Cloudflare, Fastly |
| **Edge Compute** | V8 Isolates / WebAssembly | A/B testing, header modification, JWT validation | Cloudflare Workers, AWS CloudFront Functions |
| **Edge KV / Storage**| Globally replicated KV | Auth tokens, feature flags, configuration | Cloudflare KV, DynamoDB Global Tables |

### Key Advantages

- **Terminated Connections**: Establishes TCP/TLS sessions close to users, making HTTP/2 and HTTP/3 multiplexing faster.
- **Dynamic Request Personalization**: Modifies request headers and routes traffic without hitting origin app servers.

### Key takeaway

Edge servers terminate TLS sessions and execute **lightweight computation at the network edge**, eliminating origin round-trips for routing, security, and caching.
