# Consistent Hashing Load Balancing

> **Category:** Load Balancing

---

**Consistent Hashing** is a distributed hashing technique that maps keys (such as `user_id` or IP address) and server nodes onto a **virtual circular ring ($0$ to $2^{32}-1$)**. When nodes are added or removed, consistent hashing reallocates only $K/N$ keys (where $K$ is total keys and $N$ is total servers), preventing massive cache invalidation storms.

### Consistent Hash Ring Architecture

```
+-------------------------------------------------------------------------+
|                      CONSISTENT HASH RING TOPOLOGY                      |
+-------------------------------------------------------------------------+

                       Node A (Virtual Nodes: A1, A2)
                           /                  \
                          /                    \
     Key 1 (mapped) ---> [ Hash Ring 0..2^32-1 ] <--- Key 2 (mapped)
                          \                    /
                           \                  /
                       Node B (Virtual Nodes: B1, B2)
                       
  Adding Node C reallocates ONLY keys between Node C and its predecessor.
  99%+ of cache keys remain mapped to existing nodes without cache misses.
```

### Traditional Hashing ($Key \bmod N$) vs. Consistent Hashing

| Feature | Traditional Modulo Hashing ($Hash(K) \bmod N$) | Consistent Hashing |
| :--- | :--- | :--- |
| **Node Scaling Behavior**| Adding/removing 1 node changes $N$, causing **100% of keys to remap**. | Adding/removing 1 node remaps only **$1/N$ of total keys**. |
| **Cache Impact** | Total cache invalidation storm; causes database overload. | Minimal cache misses; remaining node caches stay intact. |
| **Load Distribution** | Hot-spotting if key hashes cluster. | Uniform distribution via **Virtual Nodes (Tokens)**. |
| **Primary Use Cases** | Simple single-node routing. | Distributed caches (Memcached, Redis Cluster), DynamoDB, Cassandra. |

### Virtual Nodes (Tokens)
To prevent non-uniform data distribution (hotspots), each physical server node is assigned multiple **virtual nodes (e.g., 100-250 virtual tokens)** scattered across the hash ring. This ensures uniform key distribution across physical servers.

### Key takeaway

Consistent Hashing minimizes key remapping when servers scale out or fail, reallocating only **$1/N$ of keys**. Use consistent hashing with **Virtual Nodes** to build scalable distributed caches (Redis Cluster, Memcached) and stateful partition routers.
