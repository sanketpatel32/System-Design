# At-Most-Once Delivery

> **Category:** Message Queues and Event Streaming

---

At-most-once = **the message may be lost, but never delivered more than once.**

### How it works
- Producer sends and forgets (no ACK needed).
- If anything fails, message is dropped (not retried).
- No duplicates by design.

### Trade-off
- ✅ **No duplicates** (simple consumers).
- ✅ **High throughput** (no ACK overhead).
- ❌ **Possible loss** of messages.

### When to use
- Loss is acceptable (telemetry, metrics).
- Extreme throughput needed.
- Real-time feeds where stale data is useless anyway.

### Examples
- **UDP** (fire-and-forget).
- **Redis Pub/Sub** (no persistence — if no subscriber, lost).
- **statsd / metrics** (one lost metric doesn't matter).
- **Fire-and-forget logging**.

### Acknowledgment patterns
- Producer doesn't wait for ACK.
- Consumer doesn't ACK.
- No retries on failure.

### When NOT to use
- Financial transactions (can't lose).
- Order processing.
- Anything where loss = money or harm.

### Comparison
| Semantic | Loss? | Dupes? |
|----------|-------|--------|
| At-most-once | Possible | No |
| At-least-once | No | Possible |
| Exactly-once | No | No |

### Key takeaway
At-most-once is the **fastest** but lossy. Use it for telemetry / metrics where losing a data
point doesn't matter. Never use for transactional data.
