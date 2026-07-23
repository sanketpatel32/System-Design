# Design WhatsApp

> **Category:** Intermediate System Design Problems

---

Design WhatsApp: 1:1 + group chat, real-time delivery, read receipts.

### Requirements
- **Functional**: 1:1 / group chat; send text/media; delivery/read receipts; offline messages.
- **Non-functional**: low-latency delivery; massive concurrent connections.

### Architecture
```
[Client A] <-WebSocket-> [Chat Gateway] <-> [Redis (presence, queues)]
                          [Message service] -> [DB]
[Client B] <-WebSocket-> [Chat Gateway]
```

### Real-time delivery
- Each client holds **WebSocket** to a chat gateway.
- Gateway routes messages via **shared pub/sub** (Redis, Kafka).

### Message storage
- **Cassandra** for chat history (write-heavy, time-series-like).
- Sequencing per chat.

### Delivery guarantees
- **At-least-once**: server stores message until ACK.
- **Idempotent** delivery (client dedupes by message ID).

### Presence
- "Online/offline/last seen" via Redis (TTL + pub/sub).

### Group chat
- Fanout on write to all members' inboxes.
- Or: store once, query per member.

### Media
- Upload to S3, send link in message.

### Scaling
- Each gateway instance: ~100k connections.
- Sticky sessions (client stays on same gateway).
- Cross-instance routing via Redis pub/sub.

### Key takeaway
WhatsApp = WebSockets + shared pub/sub (Redis) + Cassandra for storage + presence via Redis
TTL. Group chat = fanout. At-least-once delivery + idempotency keys. Sticky sessions for
WebSocket affinity.
