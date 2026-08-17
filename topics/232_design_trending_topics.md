# Design Trending Topics
> **Category:** Search and Recommendation Systems

---

### Overview
A **Trending Topics System** (e.g., Twitter Trending, Google Trends) detects spikes in user interest around specific keywords, terms, or hashtags across high-velocity social event streams in real time.

System architecture requires **stream processing engines** (Apache Flink / Spark Streaming), probabilistic data structures (**Count-Min Sketch** for heavy hitters), sliding window aggregation, and exponential decay scoring models.

### System Architecture & Stream Processing Topology

```
+--------------------------------------------------------------------------+
| HIGH-VELOCITY EVENT STREAM (Kafka Event Stream: 100,000 tweets/sec)       |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Consume Stream
+--------------------------------------------------------------------------+
| APACHE FLINK STREAM PROCESSOR                                            |
|  [ Token Extractor ] --> [ Count-Min Sketch ] --> [ Sliding Window (1h) ]|
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Compute Velocity Spike Score
+--------------------------------------------------------------------------+
| TREND SCORING ENGINE (Velocity = Current Window Count / Baseline Count)  |
+--------------------------------------------------------------------------+
                                     |
                                     v 3. Update Top 50 Trends (Every 10s)
+--------------------------------------------------------------------------+
| REDIS LEADERBOARD CACHE (ZSET: Score-Sorted Trending Topics)             |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Count-Min Sketch (Probabilistic Heavy Hitters):** A sub-linear memory data structure that counts term frequencies across billions of streaming events using multiple hash functions. Allows tracking heavy hitter hashtags in megabytes of RAM rather than gigabytes.
2. **Sliding Time Window Aggregation:** Compares term frequency in a short current window (e.g., last 5 minutes) against a historical baseline window (e.g., last 24 hours).
3. **Trending Velocity Spike Scoring Function:**

**Trend Score** = (C_current - Cₑxpected) / (√(Cₑxpected + 1))

*Key Insight:* Measures statistical acceleration/spike rather than absolute volume, preventing perpetually popular terms (e.g., `#love`, `#news`) from dominating the trending list over breaking events (e.g., `#Earthquake`).

### API Interface Specifications

| Endpoint | Method | Request Parameters | Response Payload |
|---|---|---|---|
| `/api/v1/trends` | GET | `region=US`, `limit=10` | `{"trends": [{"rank": 1, "topic": "#SuperBowl", "tweet_volume": 482000, "spike_score": 94.2}]}` |

### Trending Topics Leaderboard Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `topic_key` | String (e.g., `#SuperBowl`)| Redis ZSET / Cassandra | Unique hashtag or keyword topic. |
| `spike_score` | Float | Redis ZSET | Calculated velocity score powering Redis leaderboard order. |
| `count_min_sketch` | Byte Array | Flink State Store | Probabilistic frequency counter array. |
| `volume_1h` | BigInt | Redis Cache | Total event volume in current 1-hour window. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Velocity Spike Scoring over Raw Volume**| Detects true breaking events instantly while excluding perpetually popular generic keywords. | Noisy spikes from spam bots can temporarily trigger false-positive trends. | Social media trending topic calculation. |
| **Count-Min Sketch Data Structure** | Sub-linear memory consumption; processes millions of events per second in RAM. | Over-estimates term frequency slightly due to hash collisions (no under-estimation). | Heavy hitter detection in high-velocity streaming data. |
| **Apache Flink Stream Processing** | Sub-second event window processing; built-in stateful fault tolerance and event-time semantics.| Operational complexity of managing stateful Flink streaming clusters. | Real-time stream analytics engines. |

### Key takeaway
A **Trending Topics System** detects breaking events by processing streaming events in **Apache Flink**, relying on **Count-Min Sketch** for sub-linear memory frequency tracking and **Velocity Spike Scoring** to measure statistical acceleration over historical baselines.
