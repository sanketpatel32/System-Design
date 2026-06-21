# Redis Use Cases

> **Category:** Caching

---

Redis is a **versatile in-memory data store** with rich data structures. Far more than just
a cache.

### Why Redis
- **In-memory** → microsecond latency.
- **Rich types**: strings, lists, sets, hashes, sorted sets, streams, hyperloglog, geospatial.
- **Persistence** (RDB snapshots + AOF log).
- **Replication + clustering** built-in.
- **Pub/sub** for messaging.
- **Lua scripting** for atomic ops.

### Common use cases

#### 1. Cache
- Web page cache, DB query cache.
- TTL, eviction policies (LRU/LFU).

#### 2. Session store
- Web sessions keyed by session ID.
- TTL = session timeout.
- Used by GitHub, Twitter.

#### 3. Rate limiter
- `INCR` with TTL per user/IP.
- Sliding window counters.
- Token buckets.

#### 4. Leaderboards / rankings
- `ZADD` to sorted set.
- `ZREVRANGE` for top N.
- Used by games, social scoring.

#### 5. Real-time analytics
- `HINCRBY` counters.
- HyperLogLog for cardinality (unique visitors).
- Bitmaps for daily active users.

#### 6. Queues
- `LPUSH` / `BRPOP` for task queues.
- Streams for log-style append + consumer groups.

#### 7. Pub/sub
- `PUBLISH` / `SUBSCRIBE` for chat, notifications.

#### 8. Distributed locks
- `SET NX EX` for atomic acquire.
- Redlock for multi-node.

#### 9. Geospatial
- `GEOADD`, `GEORADIUS` for nearby queries.

#### 10. Counters / metrics
- `INCR` atomic counters.

### Anti-patterns
- Using Redis as primary DB for important data (persistence isn't as durable as a real DB).
- Storing huge data (RAM is expensive).
- Single huge instance (shard it).

### Key takeaway
Redis is a Swiss-army knife — cache, sessions, rate limiter, leaderboard, queue, pub/sub,
locks, counters. Reach for it whenever you need fast access to structured in-memory data.
