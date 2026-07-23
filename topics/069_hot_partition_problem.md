# Hot Partition Problem

> **Category:** Scaling

---

A hot partition = **one shard/partition receives disproportionately more traffic** than the
others, becoming a bottleneck while siblings sit idle.

### Causes
- **Skewed key distribution** — one celebrity user generates 1000x normal traffic.
- **Bad shard key** — e.g. sharding by country where 80% of users are in the US.
- **Time-based patterns** — current-day partition gets all writes (logs, metrics).
- **Auto-incrementing IDs** in hash modulo — uneven with certain N.
- **Sequential keys** — all new orders hit the latest range shard.

### Symptoms
- One node at 95% CPU while others idle.
- Latency spikes correlated with one key.
- Replication lag on one replica.
- Uneven disk usage across shards.

### Solutions
| Cause | Fix |
|-------|-----|
| Celebrity user | Split their data into sub-shards (Justin Bieber → 1000 sub-keys) |
| Bad key | Re-shard with better key (high-cardinality, even) |
| Time skew | Pre-split by hour/minute; rotate quickly |
| Auto-increment | Use UUID / Snowflake for even hashing |
| Range hotspot | Consistent hashing + vnodes |

### Mitigation techniques
- **Consistent hashing with many vnodes** — evens out distribution.
- **Sub-sharding** a hot key into many smaller keys.
- **Write coalescing** — buffer writes to hot key, flush in batches.
- **Read-through cache** — absorb hot-key reads before they hit the DB.
- **Rebalancing** — move data so the hot shard is split.

### Real-world example
- Twitter's "Justin Bieber problem" — one user's timeline triggered fan-out to millions of
  recipients. Solution: special-cased celebrity accounts (pull-on-read instead of push-on-write).

### Key takeaway
Hot partitions defeat sharding's purpose — you scale N× but the bottleneck stays. Pick a
**high-cardinality, evenly-distributed shard key**. For unavoidable celebrities, sub-shard or
cache. Monitor per-shard load continuously.
