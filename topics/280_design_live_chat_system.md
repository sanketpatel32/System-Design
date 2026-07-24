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

### Key takeaway
Live Chat systems combine WebSocket connection managers with Redis Pub/Sub routing and wide-column databases (Cassandra) to achieve sub-50ms real-time message fan-out and multi-device history synchronization.
