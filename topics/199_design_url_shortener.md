# Design URL Shortener

> **Category:** Beginner System Design Problems

---

Design a service like **bit.ly** that takes a long URL and returns a short one, redirecting
visitors to the original.

### Requirements
- **Functional**: shorten a URL; redirect short → long; custom aliases; analytics.
- **Non-functional**: low-latency redirects; highly available; durable.

### Estimation
- 100M new URLs/month, 10:1 read ratio → 1B redirects/month.
- Write QPS: ~40; read QPS: ~400.
- Storage: 100M × 500B × 5yr = 250 GB.

### Architecture
```
[Client] -> [LB] -> [API]
                     |
                     v
                  [Cache (Redis)] <-- hit?
                     |
                     v (miss)
                  [DB (DynamoDB/Postgres)]
                     |
                     v
                  [Analytics queue (Kafka)]
```

### Short code generation
- **Counter + Base62 encoding**: atomic counter (Zookeeper/Redis) → base62 string. Predictable,
  short.
- **MD5/SHA hash**: hash URL, take first 7 chars. Collisions possible.
- **Snowflake ID**: decentralized, time-sorted.

### Data model
```
urls:
  short_code (PK)
  long_url
  created_at
  user_id
  expires_at
```

### APIs
- `POST /shorten {long_url, custom_alias?}` → `{short_url}`
- `GET /{short_code}` → 301 redirect (cacheable) or 302 (tracks analytics).
- `GET /{short_code}/analytics` → clicks, referrers.

### Key decisions
- **301 vs 302**: 301 is cached by browsers (faster, but no analytics). 302 always hits server
  (analytics, but slower).
- **Cache** hot URLs in Redis (TTL forever for stable URLs).
- **CDN** for redirect responses.

### Key takeaway
URL shortener = counter + Base62 + KV store + cache. The interesting decisions: 301 vs 302,
counter vs hash, analytics via async queue. Easy to scale with DynamoDB + Redis.
