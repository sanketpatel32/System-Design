# Design Pastebin

> **Category:** Beginner System Design Problems

---

Design a service like **pastebin.com** where users paste text and get a shareable URL.

### Requirements
- **Functional**: create paste, get paste, list user's pastes, expiration.
- **Non-functional**: low-latency reads; high availability; text up to ~1MB.

### Estimation
- 5M pastes/day, 10:1 read ratio.
- Avg paste: 100KB → 500 GB/day storage.

### Architecture
```
[Client] -> [LB] -> [API] -> [Postgres (metadata)]
                          \-> [S3 (paste content)]
                          \-> [Redis (hot pastes)]
```

### Data model
```
pastes:
  paste_id (PK)
  user_id
  content_url (S3 key)
  created_at
  expires_at
  visibility (public/private)
```

### Paste ID generation
- Snowflake or counter + Base62.
- Must be unique, short, URL-safe.

### Storage split
- **Metadata** in Postgres (small, queryable).
- **Content** in S3 (large, cheap, durable).
- Avoids bloating the DB with megabyte blobs.

### Read path
1. Cache check (Redis) → hit?
2. Fetch metadata from DB.
3. Fetch content from S3 (or CDN).

### Expiration
- TTL on S3 lifecycle rules.
- Background job sweeps expired pastes.

### Key takeaway
Pastebin = URL shortener + S3 for content + Postgres for metadata. Split storage: small
metadata in DB, large content in object store. Cache hot pastes.
