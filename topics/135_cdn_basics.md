# CDN Basics

> **Category:** CDN and Media Delivery

---

A Content Delivery Network (CDN) is a geographically distributed network of **Edge Servers** that cache content close to end users, reducing latency, origin load, and network congestion.

### High-Level CDN Architecture

```
+---------------+                HTTP Request                +------------------+
| User (London) | -----------------------------------------> | CDN Edge Node    |
+---------------+                                            | (London PoP)     |
                                                             +------------------+
                                                                      |
                                                               (Cache Miss?)
                                                                      v
+---------------+                 HTTP Request               +------------------+
| User (Tokyo)  | -----------------------------------------> | Origin Server    |
+---------------+                                            | (US-East AWS)    |
                                                             +------------------+
```

### Core Mechanisms

1. **DNS Anycast Routing**: Maps client DNS queries to the IP address of the topologically closest CDN Point of Presence (PoP).
2. **Edge Caching**: Stores static files (JS, CSS, images, video segments) in edge memory/NVMe drives.
3. **Origin Shielding**: Interposes a secondary caching layer between edge PoPs and the origin server to collapse duplicate cache miss fetches.

### CDN Request Handling Flow

| Step | Action | Description |
| :--- | :--- | :--- |
| **1. DNS Resolution**| Client queries DNS | Anycast DNS resolves domain to closest PoP IP. |
| **2. Edge Lookup** | Edge server receives HTTP request| Checks local RAM/NVMe cache for URL key. |
| **3. Cache Hit** | Content found | Edge returns cached response with 200 OK immediately. |
| **4. Cache Miss** | Content absent | Edge fetches payload from Origin, caches it, and returns to user. |

### System Design Benefits

- **Latency Reduction**: Lowers Round Trip Time (RTT) from 200ms (cross-continental origin) to < 10ms (local PoP).
- **Origin Offloading**: Absorbs 90-99% of read traffic, protecting backend databases from traffic spikes.
- **DDoS Mitigation**: Distributed edge PoPs absorb massive volumetric DDoS attacks at the perimeter.

### Key takeaway

CDNs deliver static assets with **ultra-low latency** by caching resources on geographically distributed edge servers, offloading network traffic from origin infrastructure.
