# Cache-Aside Pattern

> **Category:** Caching

---

The **Cache-Aside Pattern** (also known as Lazy Loading) is a caching pattern where the application code directly orchestrates reading from and writing to the cache. The cache operates alongside the primary database without direct communication between the two storage systems.

### Pattern workflow

```
 [Application] -------- 1. Read Request --------> [Cache Store (Redis)]
       |                                                 |
       | 3. Read Miss (Fallback)                         | 2. Cache Hit
       v                                                 v
 [Database] <-------------------------------------- [Return Data to Client]
       |
       +------ 4. Fetch Row Data
       |
       +------ 5. Write Item to Cache for Next Time
```

### Step-by-step execution flow

1. Application receives a request for data item `Key_A`.
2. Application queries the **Cache**:
   - **Cache Hit**: Cache returns data directly to the application. Application returns data to client.
   - **Cache Miss**: Cache returns null.
3. On **Cache Miss**, the application queries the primary **Database**.
4. Database returns data to the application.
5. Application writes the fetched data into the **Cache** (with a defined TTL) and returns it to the client.

### Cache-Aside Evaluation Matrix

| Characteristic | Evaluation | Impact |
| :--- | :--- | :--- |
| **Resilience** | High | Cache failures do not break the app; requests fall back to the database |
| **Cache Size Efficiency**| High | Only requested data is cached (lazy loading avoiding unnecessary caching) |
| **Initial Read Latency** | Penalty on Miss | First request incurs a cache miss, DB lookup, and cache write step |
| **Data Stale Risk** | Moderate | Database mutations can create stale cache entries unless explicitly invalidated |

### Key takeaway

Cache-Aside provides resilient caching by making the application responsible for cache orchestration. It ensures that only actively queried data occupies cache memory, though initial requests incur a cache miss latency penalty.
