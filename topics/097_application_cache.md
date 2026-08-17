# Application Cache

> **Category:** Caching

---

An **Application Cache** resides alongside or directly within the application execution tier. It stores intermediate computed values, domain objects, and database query results in fast memory (RAM) to minimize expensive computations and database lookups.

### System architecture

```
                     +-----------------------------------+
                     |         Application Tier          |
                     +-----------------------------------+
                        |                            |
          1. Check In-Memory           2. Read/Write Distributed
             Local Process Cache          Shared Application Cache
                        v                            v
               +-----------------+          +-----------------+
               | In-Memory Cache |          | Redis Cluster   |
               | (Caffeine / Guava)|        | (Memcached)     |
               +-----------------+          +-----------------+
```

### Implementation patterns

1. **In-Memory Local Process Cache (Caffeine, Guava, Ehcache)**: Cache resides within the application process heap memory.
   - *Pros*: Extremely fast sub-microsecond access (no network overhead).
   - *Cons*: Memory is isolated to a single instance; creates inconsistent cache states across scaled nodes.
2. **Distributed Application Cache (Redis, Memcached)**: Dedicated caching cluster shared by all application nodes via network TCP calls.
   - *Pros*: Uniform cache state across all nodes; survives app instance restarts.
   - *Cons*: Network hop adds 1-3 ms latency overhead.

### Application Cache Matrix

| Characteristic | Local Process Cache | Distributed Shared Cache |
| :--- | :--- | :--- |
| **Latency** | Extremely Fast (< 1 µ s, memory address lookup) | Fast (1 – 3 ms network round-trip) |
| **Consistency** | Low (Each app node maintains its own local cache state)| High (Single shared cache source for all app nodes) |
| **Capacity** | Constrained by JVM / Application Heap limits | Scalable across multi-node cache clusters |
| **Instance Failure** | Cache lost when node terminates | Cache persists independently of app nodes |

### Key takeaway

Application caching offloads database read traffic by holding domain objects in fast memory. Combine local process caches for static configuration with distributed caches like Redis for shared data across application nodes.
