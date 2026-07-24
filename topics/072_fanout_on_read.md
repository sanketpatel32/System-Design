# Fanout on Read

> **Category:** Scaling

---

**Fanout on Read** (also known as the **Pull Model**) is an architecture where writing new content is lightweight ($O(1)$ operation) — content is stored once in the author's post table. When a recipient opens their feed, the system dynamically queries, aggregates, and sorts posts from all accounts the recipient follows at read time.

### Architecture flow

```
[Author Writes Post] --------> [Author Post Store] (Stored Once)

[Follower Requests Timeline]
            |
            v
+-----------------------+
|  Feed Service Router  |
+-----------------------+
            |
            +---> 1. Fetch list of followees (Graph DB)
            |
            +---> 2. Query recent posts for all followees (Scatter-Gather)
            |
            +---> 3. Merge-Sort results by timestamp in memory
            |
            v
[Rendered Timeline Delivered to Client]
```

### Core mechanics

1. **Lightweight Write**: When an author posts, the payload is inserted once into the author's primary post table. No downstream timeline writes occur.
2. **Read-Time Scatter-Gather**: When a follower requests their feed:
   - System retrieves the list of people they follow ($K$ followees).
   - System issues concurrent query requests to fetch recent posts for each followee.
   - System merges and sorts the $K$ streams in memory to return the top $N$ recent posts.

### Operational trade-offs

| Characteristic | Evaluation | Impact |
| :--- | :--- | :--- |
| **Write Performance** | Extremely Fast ($O(1)$ complexity) | Instant post confirmation regardless of author follower count |
| **Read Latency** | High Latency ($O(K \log K)$ merge) | Opening feeds requires multithreaded network queries across databases |
| **Resource Allocation**| Heavy Read CPU & Network IO | Aggregating feeds consumes CPU resources during active read traffic |
| **Storage Efficiency** | Maximum Efficiency | Data is stored once without redundancy |

### Optimizing Fanout on Read

- **In-Memory Caching**: Cache recent posts of followees in Redis to avoid hitting persistent disk stores during scatter-gather queries.
- **Query Bounds**: Limit scatter-gather queries to active accounts updated within the past 7 days.

### Key takeaway

Fanout on Read optimizes write performance and eliminates write amplification, making it suitable for systems with high-follower accounts or lower read-to-write ratios. However, it requires robust read caching to mitigate scatter-gather read latency.
