# Consistent Hashing Load Balancing

> **Category:** Load Balancing

---

Consistent hashing = **route requests by hashing a key (user_id, IP) onto a ring**, so the
same key always goes to the same server — and only K/N keys move when a server joins or leaves.

### The problem it solves
Naive hash: `server = hash(key) % N`. If N changes (server added/removed), **almost all keys
remap** — caches wiped, sessions lost, hot shards cold.

### Consistent hashing
```
Imagine a ring of hash values 0..2^32-1.
Place each server at hash(server_id) on the ring.
Place each key at hash(key).
Each key is owned by the next server clockwise.
```
```
        S1
       /    \
   key3     key1
     |       |
   key2 -- S2 -- S3
```

### Why it wins
- **Add a server**: only keys between it and its predecessor move.
- **Remove a server**: only its keys redistribute (to its successor).
- Expected **K/N keys remap** (not K), preserving cache locality.

### Virtual nodes (vnodes)
Each physical server is placed at **multiple** points on the ring (e.g. 150 vnodes) for even
distribution. Otherwise clustering leaves some servers overloaded.

### Use cases
- **Distributed caches** (Memcached, Redis Cluster).
- **Database sharding** (Cassandra, DynamoDB).
- **Sticky load balancing** by user/IP.
- **CDN edge selection**.

### Variants
- **Rendezvous hashing** (HRW): similar properties, simpler to compute, O(N) lookup but better
  balance for small N.
- **Maglev hashing** (Google): used in their LB, ~consistent + lookup table.

### Key takeaway
Use consistent hashing whenever you need **key→server stickiness** AND **membership changes**.
It minimizes data movement, preserving cache hit rates across scaling events. Standard in
distributed caches and sharded DBs.
