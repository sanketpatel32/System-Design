# Dynamic Content Delivery

> **Category:** CDN and Media Delivery

---

Dynamic Content Delivery optimizes the transmission of **non-cacheable or personalized API responses** using CDN edge networks to accelerate network handshakes, TCP routing, and edge computation.

### Dynamic Acceleration Architecture

```
+--------+          1. Edge Connection (Fast TLS Handshake)          +---------------+
| Client | --------------------------------------------------------> | Edge PoP Node |
+--------+                                                           +---------------+
                                                                             |
                                                                             | 2. Persistent TCP Connection /
                                                                             |    Optimized IP Route (BGP)
                                                                             v
                                                                     +---------------+
                                                                     | Origin Server |
                                                                     +---------------+
```

### Dynamic Optimization Techniques

| Acceleration Layer | Optimization Technique | Benefit |
| :--- | :--- | :--- |
| **Connection Layer** | TLS Termination at Edge PoP | Eliminates multi-RTT TLS handshake latency to origin |
| **Transport Layer** | Persistent TCP Keep-Alive Pools | Eliminates slow-start phase between edge and origin |
| **Routing Layer** | BGP Anycast & Private Backbone Routing| Bypasses public internet congestion |
| **Compute Layer** | Edge Worker Composition (ESR/ESI) | Stitches cached shell HTML with dynamic API fragments |

### Dynamic Caching Strategies

- **Edge Side Includes (ESI)**: Allows edge servers to stitch static HTML page templates with dynamic personalized user fragments (`<esi:include src="/api/user"/>`).

### Key takeaway

Dynamic content delivery accelerates non-cacheable APIs by **terminating TLS at edge PoPs** and multiplexing origin traffic over pre-established, optimized backbone routes.
