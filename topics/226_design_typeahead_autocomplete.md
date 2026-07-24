# Design Typeahead / Autocomplete
> **Category:** Search and Recommendation Systems

---

### Overview
A **Typeahead / Autocomplete System** suggests relevant search queries in real time as users type letters into a search box, completing requests within sub-30ms latencies.

### System Architecture Diagram

```
+--------+     1. GET /autocomplete?q=sys     +-------------------+
| Client | ---------------------------------> | API Gateway       |
+--------+                                    +-------------------+
    ^                                                   |
    | 4. Return Top 5 Suggestions                       v 2. Query Cache
    |                                         +-------------------+       Hit       +---------------+
    | <-------------------------------------- | Redis Cache       | --------------> | Fast Response |
    |                                         +-------------------+                 +---------------+
    |                                                   | Miss
    |                                                   v 3. Trie Query
    |                                         +-------------------+
    |                                         | Trie Service      |
    |                                         | (In-Memory Trie)  |
    |                                         +-------------------+
```

### Trie (Prefix Tree) Data Structure with Frequency Storage
Nodes store top 5 trending search suggestions directly at each prefix node to achieve $O(k)$ lookup time (where $k$ is prefix length):

```
                       (root)
                      /                          [a]      [s] (top: "system design", "system", "spotify")
                            /                             [y]   [a]
                          /
                        [s] (top: "system design", "system", "sysadmin")
```

### Offline Trie Rebuild Pipeline
Updating the Trie synchronously on every live user search causes lock contention and degrades performance.
- **Solution**: Process search logs asynchronously via **Kafka** and **Spark**, building a fresh Trie snapshot in memory every 1 hour and swapping pointer references atomically.

```
Search Logs ---> Kafka ---> Spark Aggregator ---> DB Trie Table ---> Load fresh Trie into Memory
```

### Key Optimization Strategies
1. **Browser Caching**: Cache prefix suggestions in client browser `localStorage` with a 1-hour TTL.
2. **Sampling**: Log 1 out of 100 search requests for high-frequency queries to reduce log volume.

### Key takeaway
Build Autocomplete systems using **In-Memory Tries** storing top pre-computed suggestions at each node. Rebuild Trie structures offline via asynchronous log batch pipelines (**Spark/Kafka**).
