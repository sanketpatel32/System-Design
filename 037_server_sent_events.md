# Server-Sent Events

> **Category:** Networking Basics

---

SSE = **Server-Sent Events** — a one-way streaming channel where the server pushes events to
the browser over a **single long-lived HTTP connection**.

### How it works
```
Client:  GET /events    Accept: text/event-stream
Server:  HTTP 200 OK    Content-Type: text/event-stream
Server:  (keeps connection open, sends events as they happen)
         data: {"user":"alice"}


         data: {"user":"bob"}


```

### Properties
- **One-way** (server → client only). Client sends via regular POST.
- **Built on HTTP** — no protocol upgrade, friendly to proxies/CDNs.
- **Auto-reconnect** — browser reconnects on disconnect.
- **Last-Event-Id** header lets server replay missed events.
- **Text only** (UTF-8); no binary.

### When to use SSE
- **Live notifications / activity feeds.**
- **Stock tickers, dashboards.**
- **Status updates** (build progress, deploy logs).
- Any **server-push, mostly one-way** workload.

### SSE vs WebSockets
| | SSE | WebSockets |
|--|-----|------------|
| Direction | Server→client only | Bidirectional |
| Protocol | HTTP | WS upgrade |
| Reconnect | Built-in | Manual |
| Binary | No | Yes |
| Max connections/browser | 6 per domain (HTTP/1.1) | Unlimited |
| Proxies/CDNs | Friendly | Sometimes blocked |

### Scaling SSE
- Each connection holds server memory/state.
- Use **sticky sessions** or a **shared pub/sub** (Redis pub/sub, Kafka) so events reach clients
  regardless of which instance holds them.

### Key takeaway
For **server-push** workloads (notifications, tickers, logs), SSE beats WebSockets on simplicity.
For bidirectional (chat, games), use WebSockets. Don't reach for long polling unless SSE/WS are
unavailable.
