# Database Cache

> **Category:** Caching

---

A **Database Cache** is an in-memory buffer pool maintained directly inside a database management system (e.g., MySQL InnoDB Buffer Pool, PostgreSQL Shared Buffers). It caches index pages and data rows in RAM to avoid expensive disk I/O operations during query execution.

### Database memory architecture

```
                           +------------------------+
                           |  Incoming SQL Query    |
                           +------------------------+
                                       |
                                       v
                           +------------------------+
                           | Query Execution Engine |
                           +------------------------+
                                       |
                                       v
                           +------------------------+
                           | DB Buffer Pool (RAM)   |
                           |  [ Hot Data Pages ]    |
                           +------------------------+
                                  /          \
                      Page Hit   /            \ Page Miss
                                v              v
                    +---------------+  +---------------+
                    | Return Page   |  | Read Disk Page|
                    | from RAM      |  | & Load to RAM |
                    +---------------+  +---------------+
```

### Core mechanics

1. **Buffer Pool Management**: Databases read and write data in fixed-size memory blocks called pages (typically 8KB–16KB). Hot pages are retained in RAM using modified LRU eviction algorithms.
2. **Dirty Page Flushing**: Updates write to the buffer pool in RAM and write-ahead log (WAL) on disk. Modified pages ("dirty pages") are asynchronously flushed to database tables on disk later.
3. **Query Result Cache vs Buffer Pool**:
   - *Query Result Cache*: Caches raw SQL output strings. Invalidated whenever underlying tables change. *Deprecated in modern databases due to poor scalability.*
   - *Buffer Pool Cache*: Caches raw data pages and index nodes. Remains valid across granular row updates.

### Buffer Pool vs External Application Cache

| Feature | Internal Database Buffer Pool | External Application Cache (Redis) |
| :--- | :--- | :--- |
| **Location** | Inside database process RAM | Autonomous cache cluster |
| **Management** | Transparently handled by DB engine | Application code explicitly handles reads/writes |
| **Network Overhead**| Included within standard DB query hop | Separate network connection |
| **Granularity** | Page-level binary storage | Object/Key-level domain structures |

### Key takeaway

Database buffer pools minimize disk I/O by caching data and index pages in engine RAM. Size buffer pools adequately (typically 60-80% of server RAM on dedicated database hardware) to maximize page hit ratios.
