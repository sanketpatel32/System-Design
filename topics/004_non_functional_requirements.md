# Non-Functional Requirements

> **Category:** System Design Basics

---

Non-Functional Requirements (NFRs) describe **how** the system must behave — the quality
attributes that apply across all features.

### The usual suspects
| NFR | Question | Typical target |
|-----|----------|----------------|
| Scalability | Can it handle 10x traffic? | Horizontal scale |
| Availability | Uptime %? | 99.9% / 99.99% |
| Latency | Response time? | p99 < 200ms |
| Throughput | Requests/sec? | 10k RPS |
| Consistency | Stale reads OK? | Strong / eventual |
| Durability | Data loss tolerance? | 99.999999999% |
| Security | Who can access what? | TLS, auth, RBAC |
| Maintainability | How easy to change? | Modular, observable |
| Cost | $/user budget? | Pay per use |

### Trade-offs are unavoidable
You **cannot** have all of these at once:
- Strong consistency **vs** high availability (CAP).
- Low latency **vs** low cost (cache everything = expensive).
- Strict isolation **vs** throughput (locks reduce concurrency).

### How to surface them in interview
After listing NFRs, **call out the trade-offs explicitly**:
> "We prioritize low read-latency, so we'll accept eventual consistency on the feed (a new post
> may take 1-2s to appear)."

### Key takeaway
NFRs drive **every architectural decision**. Get them on the whiteboard first — they are the
constraints you optimize against.
