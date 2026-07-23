# TCP vs UDP

> **Category:** Networking Basics

---

Two transport protocols on top of IP. Choose based on whether you need **reliability** or
**speed**.

### Comparison
| Feature | TCP | UDP |
|---------|-----|-----|
| Connection | Yes (handshake) | No (stateless) |
| Reliability | Guaranteed delivery | Best-effort |
| Order | In-order delivery | Out-of-order possible |
| Flow / congestion control | Yes | No |
| Overhead | Higher (20+ bytes) | Lower (8 bytes) |
| Use cases | HTTP, SSH, email | DNS, video, games, VoIP |

### TCP in depth
```
Handshake:  SYN -> SYN-ACK -> ACK  (1 RTT)
Data:       each segment ACKed, retransmitted on loss
Teardown:   FIN -> FIN-ACK
```
Features: flow control (don't overwhelm receiver), congestion control (back off on loss —
Cubic, BBR), ordered byte stream.

### UDP in depth
- Fire-and-forget datagrams.
- No retransmission, no ordering.
- Used by **QUIC** (HTTP/3) which layers reliability on top of UDP for speed.

### When to use which
| Need | Protocol |
|------|----------|
| Web pages, APIs | TCP (HTTP/1, HTTP/2) |
| Modern web, mobile | QUIC over UDP (HTTP/3) |
| Video streaming | UDP (lost frames are OK) |
| Voice/video calls | UDP (latency > completeness) |
| Multiplayer games | UDP |
| DNS | UDP for small queries, TCP for large |
| File transfer | TCP |

### Why it matters
- **TCP overhead** hurts latency-sensitive workloads (a dropped packet stalls everything).
- **UDP lossiness** requires app-level recovery if you need reliability.
- **HTTP/3 over QUIC** is the modern answer: UDP's speed + TCP's reliability + 0-RTT handshakes.

### Key takeaway
TCP for correctness, UDP for latency. Modern apps increasingly use **QUIC/HTTP/3** to get the
best of both.
