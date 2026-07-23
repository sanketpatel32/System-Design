# WebSockets

> **Category:** Networking Basics

---

WebSockets provide a **single persistent, bidirectional connection** between client and
server over TCP — full-duplex, low-latency, after an initial HTTP upgrade.

### Lifecycle
```
1. Client sends HTTP GET with Upgrade: websocket header.
2. Server replies 101 Switching Protocols.
3. Connection upgrades to WebSocket protocol (ws:// or wss://).
4. Both sides can send/receive messages at any time, until close.
```

### Properties
- **Bidirectional** — server can push without client polling.
- **Persistent** — one TCP connection reused for many messages.
- **Low latency** — no per-message handshake.
- **Frame-based** — text or binary frames.
- **Stateful** — server holds connection state per client.

### When to use WebSockets
- **Chat / messaging** (WhatsApp, Discord, Slack).
- **Multiplayer games** (low-latency bidirectional).
- **Live dashboards** (server pushes metrics).
- **Collaborative editing** (Google Docs-style).
- **Notifications** (real-time push).

### When NOT to use
- **One-way server push** → Server-Sent Events (Simpler).
- **Occasional updates** → long polling (less infra).
- **Server-to-server streaming** → gRPC streaming.

### Scaling WebSockets
Each connection holds server memory → a single box handles ~50k-100k connections. To scale:
- **Sticky sessions** or **shared pub/sub** (Redis) to route messages across instances.
- **Dedicated WS gateway tier** (e.g. Centrifugo, AWS API Gateway WS).
- **Backpressure** — slow clients can buffer unboundedly; cap per-connection queues.

### Key takeaway
WebSockets are the go-to for **bidirectional real-time** features (chat, games, collab). For
unidirectional pushes, SSE is simpler. Either way, plan for stateful scaling via shared pub/sub.
