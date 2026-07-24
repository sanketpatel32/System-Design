# Design URL Shortener
> **Category:** Beginner System Design Problems

---

### Overview
A **URL Shortener** (e.g., TinyURL, bit.ly) converts long web URLs into short, unique aliases (e.g., `https://tiny.url/7bXq2a`) and redirects users to the original URL when accessed.

### System Requirements & Scale Estimates
- **Read / Write Ratio**: High read-heavy workload (**100:1** Read:Write ratio).
- **Throughput**: 10M new URLs per day (~115 writes/sec) -> 1B reads per day (~11,600 reads/sec).
- **Storage**: 10M * 500 bytes = 5 GB/day -> 18.25 TB over 10 years.

### High-Level Architecture Diagram

```
+--------+       1. GET /7bXq2a        +-------------------+       2. Cache Lookup       +---------------+
| Client | ---------------------------> | API Gateway /     | -------------------------> | Redis Cache   |
+--------+                              | Load Balancer     | <------------------------- +---------------+
    ^                                   +-------------------+       Cache Hit (URL)              |
    |                                             |                                              | Cache Miss
    |                                             v 3. Query DB                                  v
    |                                   +-------------------+                            +---------------+
    | <--- 4. 301 / 302 Redirect ------ | Shortener Service | -------------------------> | NoSQL DB      |
    |      (Location: https://...)      +-------------------+                            | (DynamoDB/Cass)|
                                                                                         +---------------+
```

### Core API Specification

| Endpoint | Method | Request Payload | Response |
|---|---|---|---|
| `/api/v1/shorten` | `POST` | `{"long_url": "https://example.com/very/long/path"}` | `201 Created` -> `{"short_url": "https://tiny.url/7bXq2a"}` |
| `/{short_code}` | `GET` | None | `301 Permanent` or `302 Found` (Location Header) |

### Key Storage Schema (NoSQL / Key-Value Store)
```json
// Table: url_mapping (Partition Key: short_code)
{
  "short_code": "7bXq2a",
  "long_url": "https://example.com/long/path/to/resource",
  "user_id": "usr_9981",
  "created_at": 1700000000,
  "expires_at": 1731536000
}
```

### Base62 Encoding & Unique ID Generation Strategies

| Strategy | Mechanism | Pros | Cons |
|---|---|---|---|
| **Base62 of Auto-Inc ID** | Convert 64-bit integer ID to Base62 (`[0-9][a-z][A-Z]`) | Guaranteed unique, short length (6 chars = 56B combinations) | Predictable sequentially (scraping risk) |
| **MD5 / SHA256 Hash Truncation**| Hash `long_url` and take first 7 characters | Deterministic for same URL | Potential hash collisions; requires collision check |
| **Pre-generated Key Service (KGS)**| Separate worker populates key bank table in advance | Simple fast write lookup; zero runtime collision check | Extra service dependency |

### Redirect Choice Trade-off: 301 vs 302
- **301 Permanent Redirect**: Browser caches redirect. Reduces backend load for repeat clicks, but loses analytics data.
- **302 Temporary Redirect**: Browser always queries URL Shortener server. Allows accurate click analytics & geographic tracking.

### Key takeaway
URL Shorteners are read-heavy systems optimized by caching target URLs in **Redis** with **Base62 ID encoding**. Use **302 redirects** when click analytics are required, and **301 redirects** to maximize cache offloading.
