# Design CDN

> **Category:** Advanced System Design Problems

---

A Content Delivery Network (CDN) is a globally distributed network of edge proxy servers designed to serve static and dynamic web content to end-users with low latency and high availability.

### System Requirements
- **Functional Requirements**:
  - Cache static web assets (images, JS, CSS, video segments) at edge Points of Presence (POPs).
  - Dynamic content acceleration via persistent TCP connection pooling to origin servers.
  - Support instant cache invalidation (Purge) and origin shielding.
- **Non-Functional Requirements**:
  - Ultra-Low Latency: Serve > 90% of requests directly from local edge memory/SSD (< 20 ms).
  - High Scalability: Absorbs multi-terabit DDoS traffic spikes.
  - Global Availability: 99.999% uptime via BGP Anycast routing.

### System Architecture
```
[ User Browser ] ---> [ BGP Anycast DNS ] ---> [ Closest Edge POP (Nginx/Varnish) ]
                                                        |
                                  +---------------------+---------------------+
                                  | (Cache Hit)                               | (Cache Miss)
                                  v                                           v
                        [ Edge Memory / NVMe ]                      [ Shield Cache Node ]
                                                                              |
                                                                              v
                                                                    [ Origin Server App ]
```

### Request Routing & Invalidation Comparison
| Mechanism | Technical Implementation | Benefits |
|---|---|---|
| **BGP Anycast** | Single IP advertised by all edge POPs; internet routers route to nearest POP | Lowest latency; automatic hardware failover at network layer. |
| **GeoDNS** | DNS server resolves domain to specific POP IP based on client resolver location | Simple setup; susceptible to DNS caching stale routes. |

| Invalidation Type | Action | SLA |
|---|---|---|
| **Hard Purge** | Instantly deletes object from edge memory and disk | Global sync in < 5 seconds. |
| **Soft Purge (Stale-While-Revalidate)** | Serves stale cached content while asynchronously fetching fresh object from origin | Zero latency spike for end-users during updates. |

### Key takeaway
CDNs minimize latency by combining BGP Anycast routing with tiered edge/shield caching proxies (Nginx/Varnish), serving content close to users while protecting origin servers.
