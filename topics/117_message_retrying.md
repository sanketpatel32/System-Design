# Message Retrying

> **Category:** Message Queues and Event Streaming

---

**Message Retrying** is the mechanism of re-attempting processing for failed messages in asynchronous messaging architectures. Transient failures (temporary network blips, database lock timeouts, external API rate limits) can be resolved by retrying message delivery using structured backoff policies.

### Retry pipeline architecture

```
                               +-------------------+
                               |  Incoming Queue   |
                               +-------------------+
                                         |
                                         v
                               +-------------------+
                               | Consumer Processing|
                               +-------------------+
                                  /             \
                      Success    /               \ Transient Error
                                v                 v
                      +-------------------+   +-------------------+
                      | ACK & Delete Msg  |   | Retry Queue       |
                      +-------------------+   | (Exponential      |
                                              |  Backoff + Jitter)|
                                              +-------------------+
                                                        |
                                           Exceeded Max Retry Limit
                                                        v
                                              +-------------------+
                                              | Dead Letter Queue |
                                              +-------------------+
```

### Core retry policies & techniques

1. **Exponential Backoff**: Doubles the delay between consecutive retries (e.g., 1s, 2s, 4s, 8s, 16s) to avoid overwhelming recovering downstream systems.
2. **Jitter (Randomization)**: Adds random variance to backoff intervals to prevent synchronized retry spikes across worker instances.
3. **Retry Queues (Delayed Queues)**: Offloads failed messages to dedicated delayed queues so un-failed messages behind them in the primary queue are not blocked (prevents Head-of-Line blocking).

### Retry Configuration Parameters

| Parameter | Recommended Setting | Purpose |
| :--- | :--- | :--- |
| **Max Retry Attempts** | 3 – 5 attempts | Prevents infinite retry loops on non-transient bugs |
| **Initial Backoff Interval**| 500 ms – 1 second | Gives transient network blips time to clear |
| **Backoff Multiplier** | 2.0 (Exponential) | Scales delay to relieve pressure on failing services |
| **Jitter Factor** | $\pm 20\%$ random variance | Prevents synchronized thundering herd retries |

### Key takeaway

Design message retries using exponential backoff with jitter to recover from transient failures without overwhelming downstream dependencies. Route messages that exceed max retry limits to a Dead Letter Queue (DLQ).
