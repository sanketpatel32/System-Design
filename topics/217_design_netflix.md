# Design Netflix
> **Category:** Intermediate System Design Problems

---

### Overview
**Netflix** is a global media streaming service optimized for ultra-low latency video playback across hundreds of device formats, relying on cloud control planes (AWS) combined with a proprietary global Content Delivery Network (Open Connect Appliances).

### Hybrid Architecture Topology (Cloud Control Plane + Edge CDN)

```
+--------------------------------------------------------------------------+
|                       AWS CLOUD CONTROL PLANE                            |
|                                                                          |
| [ API Gateway ] --> [ Auth / Subscriptions ] --> [ Recommendation ML ]  |
|                                                          |               |
|                                                          v User Click Play
+--------------------------------------------------------------------------+
                                                           |
                                                           v Direct Play Token + Manifest
+--------------------------------------------------------------------------+
|                    OPEN CONNECT (OCA EDGE CDN)                           |
|                                                                          |
| Local ISP PoP Appliance (OCA Box) === High Bitrate Video Stream ===> Client|
+--------------------------------------------------------------------------+
```

### Architectural Subsystem Breakdown

| System Component | Host Environment | Core Responsibility |
|---|---|---|
| **Control Plane** | AWS (EC2 / Microservices) | User auth, billing, search, personalized recommendation scoring |
| **Edge Storage (Open Connect)**| Custom FreeBSD Appliance Boxes at ISPs | Caching pre-encoded video file chunks directly inside ISP data centers |
| **Transcoding Pipeline** | AWS Batch / Cloud Workers | Encoding videos into 100+ profiles per title (codecs, resolutions, bitrates) |

### Resilience Architecture: Chaos Engineering & Fallbacks
- **Chaos Gorilla / Monkey**: Actively destroys AWS availability zones in production to verify auto-failover resilience.
- **Static Fallback Playlists**: If real-time ML recommendation services fail, system falls back instantly to pre-computed static top-trending JSON lists.

### Key takeaway
Netflix decouples control plane operations (AWS microservices) from media distribution. Video data is served directly from custom hardware caches (**Open Connect Appliances**) embedded directly within local Internet Service Provider (ISP) networks.
