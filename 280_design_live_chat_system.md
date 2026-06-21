# Design Live Chat System

> **Category:** Real-Time Systems

---

Design live chat (customer support or 1:1 messaging).

### Requirements
- **Functional**: real-time messaging; typing indicators; presence; history.
- **Non-functional**: low-latency delivery; HA.

### Architecture
```
[Client A] <-WebSocket-> [Chat gateway] <-pub/sub-> [Chat gateway] <-WebSocket-> [Client B]
                          [Message service]
                          [Presence service]
```

### WebSocket
- Persistent connection per client.
- Bidirectional.
- Sticky sessions (client → same gateway).

### Cross-instance routing
- Pub/sub (Redis, Kafka) for messages between gateways.

### Presence
- "Online / typing" status.
- Stored in Redis (TTL).

### History
- DB (Postgres, Cassandra).
- Indexed for retrieval.

### Typing indicator
- Lightweight events over WebSocket.
- Not persisted.

### Delivery guarantees
- At-least-once.
- Client ACKs.
- Server retries on miss.

### Key takeaway
Live chat = WebSocket per client + pub/sub between gateways + Redis presence + DB history.
Sticky sessions for connection affinity. Typing indicators = ephemeral events.
