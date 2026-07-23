# Consistent Hashing

> **Category:** Databases

---

Consistent hashing = **a key→node mapping where adding/removing a node only moves K/N
keys**, not K. Fundamental for distributed caches and databases.

### The problem
Naive modulo: `node = hash(key) % N`. Add one node → almost all keys remap → cache wiped,
sessions lost.

### Solution
Imagine a ring of hash values [0, 2³²):
1. Place each node at `hash(node_id)` on the ring.
2. Place each key at `hash(key)`.
3. Each key belongs to the **next node clockwise**.

```
           N1
         /    \
      k3      k1
       |       |
      k2 - N2 - N3
```

### Why it wins
- Add node N4 between N1 and N2: only keys between N4 and its predecessor move.
- Remove node N2: its keys redistribute to N3, others unchanged.
- Expected **K/N keys move** (not K), preserving locality.

### Virtual nodes (vnodes)
Each physical node placed at **many** points on the ring (e.g. 150 vnodes):
- Smooths out uneven distribution.
- Standard in Cassandra, Memcached, DynamoDB.

### Without vs with vnodes
```
3 nodes, no vnodes:    |-------A---|---B---|----C-----|  (uneven segments)
3 nodes, 150 vnodes:   |ACBACBACBACBACBACBACBACBACBAC|  (uniform)
```

### Use cases
- **Distributed cache**: Memcached, Redis Cluster.
- **Database**: Cassandra, DynamoDB, Riak (sharding).
- **Load balancing**: sticky by key.
- **CDN**: edge selection.

### Replication
Each key replicated to the **next N nodes clockwise** on the ring → replicas spread evenly,
failover natural (successor takes over).

### Variants
- **Rendezvous hashing (HRW)** — simpler O(N) but great distribution for small N.
- **Maglev** (Google) — uses a lookup table; O(1) lookup, minimal movement.

### Key takeaway
Consistent hashing minimizes data movement on cluster changes, making it essential for
distributed caches and sharded DBs. Always use **vnodes** for even distribution. Standard in
Cassandra, Redis Cluster, Memcached.
