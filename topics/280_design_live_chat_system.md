# Design Live Chat System

> **Category:** Real-Time Systems

---

A Live Chat System enables real-time 1-on-1 and group messaging between users, supporting typing indicators, online presence status, and message history synchronization.

### System Requirements
- **Functional Requirements**:
  - Send and receive real-time messages with sub-100ms latency.
  - Real-time typing indicators and online/offline user status updates.
  - Multi-device message synchronization and offline push notifications.
- **Non-Functional Requirements**:
  - High Concurrency: Support millions of concurrent active WebSocket connections.
  - Low Latency: Sub-50ms message delivery between online users.
  - Durability: Zero message loss; all messages persisted to storage.

### System Architecture
```
[ Chat Client Apps ] ---> [ API Gateway / Auth ]
                                  |
                                  v
                      [ WebSocket Gateway Cluster ]
                      (Persistent Full-Duplex TCP)
                                  |
        +-------------------------+-------------------------+
        |                                                   |
        v                                                   v
[ Connection Registry (Redis) ]                     [ Redis Pub/Sub Router ]
(Maps user_id -> ws_server_id)                      (Cross-Node Message Dispatch)
        |                                                   |
        +-------------------------+-------------------------+
                                  |
                                  v
                      [ Chat Storage DB (Cassandra) ]
                      (Message History & Timeline)
                                  |
                                  v
                      [ Push Notification Service (FCM/APNs) ]
                      (Async Fallback for Offline Users)
```

### Protocol & Message Storage Selection
| Component / Layer | Technology Choice | Rationale |
|---|---|---|
| **Real-Time Transport** | WebSockets | Low-overhead full-duplex persistent connection. |
| **Connection State** | Redis Hash / Key-Value | Tracks which WebSocket server node holds the active socket for `user_id`. |
| **Message Storage** | Apache Cassandra / DynamoDB | Partitioned by `channel_id` / `conversation_id` with `message_id` clustering key for fast chronological fetch. |

### Message Delivery Flow (Online → Offline)
```
sender → persist (Cassandra, monotonic message_id per channel) → fan-out
  ├─ each recipient device online: registry hit → route via Redis Pub/Sub to their WS node → deliver + ack
  └─ recipient offline / delivery timeout: enqueue push (FCM/APNs) with collapse key,
     badge count update, and truncation policy
```
- **Delivery receipts**: per-message state machine (`sent → delivered → read`) stored with the message; read receipts are idempotent upserts of the latest read position, not events to be counted.
- **Ordering**: message IDs must be monotonic per conversation (Cassandra clustering key or Snowflake-style IDs) so multi-device sync can paginate by cursor rather than timestamps.
- **Offline catch-up**: reconnecting devices pull messages since their last acked cursor, then re-attach to live push — never rely on the socket buffer for history.

### Presence & Typing Indicators
Presence and typing are ephemeral, high-frequency signals — treat them differently from messages:
- **Presence**: heartbeat TTL keys in Redis (`online`, `away` on stale heartbeat); broadcast state changes only on transitions, not continuously.
- **Typing**: client throttles to one event per ~3s while typing; server relays without persistence; drop on congestion — nobody notices a lost typing indicator, everyone notices a lost message.

### Group Conversations at Scale
- **Fan-out**: small groups relay through the pub/sub channel directly; large channels (thousands of members) need a read-model timeline instead of push-to-all, with server-side filtering of who receives which events.
- **Read marks per user**: store last-read message ID per (user, channel) — O(1) unread counts via comparison against the channel's latest ID.
- **Moderation**: run message content through async moderation before wide fan-out; the sender sees their message instantly (optimistic) but group delivery awaits the verdict.

### Key takeaway
Live Chat systems combine WebSocket connection managers with Redis Pub/Sub routing and wide-column databases (Cassandra) to achieve sub-50ms real-time message fan-out and multi-device history synchronization.
