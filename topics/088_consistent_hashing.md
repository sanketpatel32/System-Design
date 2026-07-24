# Consistent Hashing

> **Category:** Databases

---

**Consistent Hashing** is a distributed hash algorithm that minimizes key remapping when nodes are added to or removed from a cluster. Unlike traditional modulo hashing (`hash(key) % N`), where changing $N$ remaps nearly all keys, consistent hashing remaps only $K/N$ keys on average, where $K$ is the total number of keys and $N$ is the number of nodes.

### Hash ring architecture

```
                           Node A (Pos: 1000)
                              /        \
                             /          \
         Keys 9000-1000     /            \ Keys 1001-3000
                           /              \
            Node D (Pos: 9000)          Node B (Pos: 3000)
                           \              /
                            \            /
         Keys 6001-9000      \          / Keys 3001-6000
                              \        /
                           Node C (Pos: 6000)
```

### How consistent hashing works

1. **The Hash Ring**: The hash function maps both physical servers and data keys to a fixed 360-degree circular integer space (e.g., $0$ to $2^{32} - 1$).
2. **Key Assignment**: A key is hashed to a point on the ring, then assigned to the first server encountered moving clockwise around the ring.
3. **Node Addition/Removal**: Adding a new server claims keys only from its immediate clockwise neighbor, leaving all other node assignments untouched.

### Virtual Nodes (VNodes)

To prevent hot spots and uneven data distribution caused by non-uniform server placement on the ring, consistent hashing introduces **Virtual Nodes**:
- Each physical server is mapped to multiple pseudo-positions (e.g., 100–250 virtual tokens) across the ring.
- Virtual nodes distribute keys evenly across all physical hardware and balance re-distribution when servers fail.

### Hashing algorithm comparison

| Strategy | Node Change Impact | Key Remap Percentage | Hotspot Vulnerability |
| :--- | :--- | :--- | :--- |
| **Modulo Hashing (`hash % N`)**| Catastrophic (Remaps almost all keys) | $pprox 100\%$ | High |
| **Basic Consistent Hashing** | Low (Remaps only adjacent neighbor keys) | $1/N$ | Moderate (Uneven ring spacing) |
| **Consistent Hashing + VNodes** | Low & Uniformly Distributed | $1/N$ | Minimal (Even balance across ring) |

### Key takeaway

Consistent hashing enables scalable key assignment in distributed systems like Redis Cluster, DynamoDB, and Cassandra. Adding virtual nodes ensures uniform data distribution and prevents hot spots during node membership changes.
