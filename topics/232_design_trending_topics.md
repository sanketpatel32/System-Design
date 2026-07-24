# Design Trending Topics
> **Category:** Search and Recommendation Systems

---

### Overview
A **Trending Topics System** (e.g., Twitter Trends) detects sudden spikes in topic frequency or hashtag usage over time windows, separating viral news from background baseline traffic.

### Architecture Topology Diagram

```
+---------------+     1. Stream Events     +-------------------+
| Event Stream  | -----------------------> | Kafka Topic       |
+---------------+                          +-------------------+
                                                     |
                                                     v 2. Process Sliding Window
                                           +-------------------+
                                           | Apache Flink /    |
                                           | Spark Streaming   |
                                           +-------------------+
                                                     |
                                                     v 3. Count Frequencies
                                           +-------------------+
                                           | Count-Min Sketch  |
                                           | Memory State      |
                                           +-------------------+
                                                     |
                                                     v 4. Top-K Heavy Hitters
                                           +-------------------+
                                           | Redis Top-K Cache |
                                           +-------------------+
```

### Heavy Hitters & Frequency Algorithms

| Algorithm | Space Complexity | Accuracy | Mechanics |
|---|---|---|---|
| **Count-Min Sketch** | $O(\epsilon^{-1} \log \delta^{-1})$ | Probabilistic sub-linear estimate | Multi-hash array probabilistic frequency tracker |
| **Lossy Counting** | $O(\frac{1}{\epsilon} \log(\epsilon N))$ | Guaranteed bound | Fixed bucket interval stream pruning |
| **Sliding Window Counter**| $O(W)$ | Exact | Tracks precise frequency in sliding time window $W$ |

### Trending Velocity Score (Z-Score & TF-IDF Derivative)

$$Z = \frac{x_t - \mu}{\sigma}$$

Where:
- $x_t$: Current frequency count of hashtag in time window $t$.
- $\mu$: Expected historical mean frequency of hashtag.
- $\sigma$: Standard deviation of historical frequency.

### Key takeaway
Detect trending topics using **Apache Flink streaming** paired with **Count-Min Sketch** data structures to compute real-time velocity spikes ($Z$-score) with sub-linear memory overhead.
