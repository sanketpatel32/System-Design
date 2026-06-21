# Sharding

> **Category:** Scaling

---

Sharding = **partitioning data across multiple database instances** so each holds a subset.
The primary horizontal scaling technique for databases.

### How it works
```
shard = hash(shard_key) % N   OR   range(shard_key)

Users 1, 4, 7   -> Shard A
Users 2, 5, 8   -> Shard B
Users 3, 6, 9   -> Shard C
```

### Shard key choice is critical
- **High cardinality** — even distribution.
- **Low skew** — no single key dominates traffic (no "celebrity" user).
- **Query locality** — most queries hit one shard (avoid cross-shard joins).
- **Immutable** — changing the key means moving data.

Common keys: `user_id`, `tenant_id`, `order_id`, `geo`.

### Sharding strategies
| Strategy | How | Trade-off |
|----------|-----|-----------|
| **Hash** | `hash(key) % N` | Even distribution, range queries hard |
| **Range** | A-D → shard 1, E-H → shard 2 | Range queries easy, hotspots possible |
| **Directory** | Lookup service maps key → shard | Flexible, lookup service is SPOF |
| **Geo** | By region | Data locality, regulatory compliance |

### Cross-shard challenges
- **Joins** — can't join across shards; denormalize or do app-level joins.
- **Transactions** — distributed transactions are slow; use Saga / 2PC / outbox pattern.
- **Aggregations** — `COUNT(*)` needs fan-out + merge.
- **Unique constraints** — global uniqueness across shards needs coordination.
- **Rebalancing** — adding a shard means moving keys (use consistent hashing).

### Resharding
- Add capacity → split shards → rehash → move data → update routing.
- Tools: Vitess, Citus, Cassandra's vnodes.
- Online resharding is hard; plan for it.

### Key takeaway
Sharding scales writes but adds huge complexity. **Pick the shard key carefully** (high
cardinality, low skew, query locality). Don't shard until you've exhausted vertical scaling,
replicas, and caching.
