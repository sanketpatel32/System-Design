# Database Cache

> **Category:** Caching

---

Database cache = **the DB's internal cache** of recently accessed pages. Invisible to the
app, but critical to performance.

### Postgres: shared_buffers
- A pool of shared memory holding recently accessed 8KB pages.
- Default: 25% of system RAM (tune higher for DB-dedicated boxes).
- Hit rate target: > 99%.
```sql
SHOW shared_buffers;
```

### MySQL: InnoDB buffer pool
- Same idea, called `innodb_buffer_pool_size`.
- Typically 50-75% of system RAM on DB-dedicated boxes.

### How it works
1. First query reads page from disk into buffer pool.
2. Subsequent queries hit the in-memory page (no disk I/O).
3. Dirty pages flushed to disk periodically (checkpoint).
4. WAL ensures durability on crash.

### Why this matters for design
- A "fast" DB query is one whose pages are in the buffer pool.
- **Working set > RAM** → constant disk reads → slow.
- Scaling vertically (more RAM) often helps more than faster CPU.

### Query cache (deprecated)
- MySQL had a query cache (results cached by SQL text). Removed in 8.0 — overhead > benefit.
- Postgres never had one; use app-level caching instead.

### Other DB caches
- **Redis**: the whole DB is a cache (in-memory).
- **Cassandra**: row cache, key cache, chunk cache.
- **MongoDB**: WiredTiger cache (~50% of RAM).

### Tuning
- Size buffer pool to fit your **working set**.
- Monitor cache hit ratio (target > 99%).
- Add RAM if miss rate is high.

### Key takeaway
The DB's internal buffer pool is the first line of caching. Size it to fit your working set
(often 50-75% of RAM). When working set > RAM, queries hit disk and slow down dramatically —
time to scale vertically or shard.
