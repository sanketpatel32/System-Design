# Long Polling

> **Category:** Networking Basics

---

Long polling = **the client sends a request, the server holds it open until data is ready (or
timeout), then responds.** Client immediately re-polls.

### Flow
```
Client:  GET /updates
Server:  (holds connection open for up to 30s)
Server:  -> response when event arrives OR timeout
Client:  immediately issues another GET /updates
```

### Why it exists
Pre-WebSocket, this was the simplest way to get server push without WebSocket support. Still
useful when:
- WebSocket is blocked (some corporate proxies).
- You need just HTTP, no special infra.
- Infrequent updates.

### Trade-offs vs WebSockets
| | Long polling | WebSockets |
|--|--------------|------------|
| Protocol | Plain HTTP | WS upgrade |
| Overhead | High (new request each time) | Low (one connection) |
| Latency | Extra RTT per message | Minimal |
| Bidirectional | Yes (via separate POSTs) | Native |
| Infra | Standard HTTP | Needs WS gateway |
| Proxy friendly | Better | Worse |

### Implementation tips
- Set a **max hold time** (e.g. 30s) to avoid proxy timeouts.
- Use a **message queue / pub-sub** on the server so multiple app instances see the same events.
- **Backoff** on errors to avoid stampedes.

### Long polling vs SSE vs WS
- **Long polling** — every client, server-push, no infra.
- **SSE** — server push over single HTTP stream, simpler than long polling.
- **WS** — bidirectional, lowest latency, more infra.

### Key takeaway
Long polling is the **fallback** when WebSocket/SSE aren't available. For greenfield designs,
prefer WebSocket (bidirectional) or SSE (server push). Use long polling only for legacy/edge
cases.
