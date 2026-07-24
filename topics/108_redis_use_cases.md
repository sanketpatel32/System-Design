# Redis Use Cases

> **Category:** Caching

---

**Redis** (Remote Dictionary Server) is an open-source, in-memory data structure store used as a database, cache, message broker, and streaming engine. Redis supports versatile native data structures (Strings, Hashes, Lists, Sets, Sorted Sets, Bitmaps, HyperLogLogs, Geospatial Indexes, and Streams).

### Data structures architecture

```
                                 [ REDIS ENGINE ]
                                         |
     +---------------+---------------+---+---------------+---------------+
     |               |               |                   |               |
  Strings         Hashes          Lists             Sorted Sets        Streams
     |               |               |                   |               |
     v               v               v                   v               v
  Caching &       User Profile    Message Queue /     Leaderboards &  Event Log
  Counters        Objects         Activity Feeds      Rate Limiters   Processing
```

### Primary Redis Use Cases Matrix

| Use Case | Recommended Data Structure | Key Redis Commands | Advantages / Strengths |
| :--- | :--- | :--- | :--- |
| **In-Memory Caching** | Strings, Hashes | `GET`, `SET`, `HGETALL`, `EXPIRE` | Sub-millisecond latency with TTL support |
| **Rate Limiting** | Fixed Window: Strings / Sliding: Sorted Sets | `INCR`, `ZADD`, `ZREMRANGEBYSCORE` | Atomic increments and score-range execution |
| **Leaderboards & Ranking**| Sorted Sets (ZSET) | `ZADD`, `ZINCRBY`, `ZREVRANGE` | $O(\log N)$ score updates and rank retrieval |
| **Session Management** | Hashes, Strings | `HSET`, `HGET`, `EXPIRE` | Fast centralized session lookups across app nodes |
| **Pub/Sub & Queues** | Pub/Sub Channels, Lists, Streams | `PUBLISH`, `SUBSCRIBE`, `LPUSH`, `RPOP`, `XADD` | High-throughput asynchronous messaging |
| **Geospatial Searches**| Geo / Sorted Sets | `GEOADD`, `GEOSEARCH` | Radius and distance proximity queries |

### Redis Reliability Mechanisms

- **Persistence Engines**:
  - **RDB (Redis Database)**: Point-in-time snapshot files written to disk at configured intervals.
  - **AOF (Append-Only File)**: Logs every write operation to disk. Supports `fsync` policies for maximum durability.
- **High Availability**: **Redis Sentinel** provides monitoring, notification, and automated failover for primary-replica setups.

### Key takeaway

Redis serves as a versatile in-memory datastore beyond simple caching. Leverage its native data structures (Hashes, Sorted Sets, Streams) for rate limiting, leaderboards, session management, and pub/sub messaging.
