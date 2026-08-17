# Design URL Shortener
> **Category:** Beginner System Design Problems

---

### Overview
A **URL Shortener** (e.g., TinyURL, bit.ly) is a web service that accepts long, complex URLs as input and returns a short, unique URL alias (e.g., `https://tiny.url/7bX9q2`). When users navigate to the short link, the service redirects them to the original destination with minimal latency.

Core design objectives demand **sub-50ms redirection latency**, high read availability (100:1 read-to-write ratio), unique short key generation, and scalable analytics logging.

### System Architecture & Redirection Topology

```
+--------------------+     1. HTTP GET /7bX9q2      +--------------------+
| Client Browser     | ---------------------------> | API Gateway /      |
|                    | <--------------------------- | Load Balancer      |
+--------------------+     4. HTTP 301/302 Redirect +--------------------+
                                                              |
                                                              | 2. Check Cache
                                                              v
                                                    +--------------------+
                                                    | Redis Cache        |
                                                    | (Hot Short URLs)   |
                                                    +--------------------+
                                                              |
                                                              | 3. Cache Miss
                                                              v
+--------------------+     5. Async Event Log       +--------------------+
| Kafka Analytics    | <--------------------------- | Relational DB      |
| Stream             |                              | (URL Mapping Table)|
+--------------------+                              +--------------------+
```

### Key Technical Mechanics & Short Key Generation
1. **Base62 Encoding:** Encodes unique integer IDs into character strings using `[0-9][a-z][A-Z]` (62 possible characters). A 7-character string yields 62⁷ ≈ 3.52 × 10¹¹ (352 Billion) unique short links.
2. **Distributed ID Generator:** Uses Twitter Snowflake or pre-generated KGS (Key Generation Service) ranges to generate unique integer IDs without DB locks.
3. **HTTP 301 vs 302 Redirection:**
   - **301 Permanent Redirect:** Browser caches the redirect locally; reduces backend server load, but loses click analytics tracking.
   - **302 Found (Temporary):** Every click hits backend servers; accurately captures click analytics telemetry at the cost of higher latency.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/shorten` | POST | `{"long_url": "https://example.com/very/long/path", "custom_alias": "my-link", "expire_at": 1700000000}` | `{"short_url": "https://tiny.url/7bX9q2", "created_at": 1700000000}` |
| `/{short_code}` | GET | Headers: `User-Agent`, `Referer` | `HTTP 302 Found` with `Location: https://example.com/very/long/path` |
| `/api/v1/analytics/{short_code}`| GET | None | `{"short_code": "7bX9q2", "clicks": 48219, "top_referrers": ["twitter.com"]}` |

### Data Model & Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `short_code` | String (VARCHAR 7) | PostgreSQL / DynamoDB | Primary Key / Partition Key for short alias lookup. |
| `original_url` | String (TEXT) | Relational / NoSQL | Original long target URL. |
| `user_id` | String / UUID | Relational DB | Identifies the owner account for analytics ownership. |
| `created_at` | Timestamp | Relational DB | Timestamp when link was shortened. |
| `expires_at` | Timestamp (Indexed)| Relational DB | TTL expiration timestamp for automated cleanup. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Base62 ID Conversion vs MD5 Hash** | Guarantees collision-free keys using unique sequential/Snowflake IDs. | Requires distributed unique ID generator (Snowflake/KGS). | High-scale, collision-free short URL generation. |
| **HTTP 301 vs HTTP 302 Redirect** | 301 reduces server load via browser caching; 302 guarantees 100% analytics capture. | 301 prevents accurate real-time click counting. | Use 302 for monetized/analytics links; 301 for static redirects. |
| **Redis Cache LRU Eviction** | Serves top 20% trending links directly from memory in < 5ms. | Cache invalidation required if custom alias target changes. | High-read e-commerce and social media URL shorteners. |

### Key takeaway
A **URL Shortener** uses Base62 encoding over unique 64-bit integer IDs to generate 7-character aliases. Use **HTTP 302 temporary redirects** for accurate click analytics capture and **Redis LRU caching** to serve hot short links under 10ms.
