# Design Slack
> **Category:** Intermediate System Design Problems

---

### Overview
**Slack** is an enterprise team collaboration and channel-based messaging platform designed for corporate environments. Unlike 1-on-1 personal chat applications, Slack centers around multi-user public and private **Channels**, real-time presence tracking, deep file sharing, and instant full-text search over team message archives.

Core technical challenges involve **channel message fanout**, distributed search indexing, and real-time presence synchronization.

### System Architecture & Channel Fanout Topology

```
+--------------------+     1. POST /v1/chat.postMessage     +--------------------+
| Client User (Desktop)| ---------------------------------> | API Gateway        |
+--------------------+                                      +--------------------+
                                                                      |
                                                                      v 2. Persist Message
                                                            +--------------------+
                                                            | Message Service &  |
                                                            | MySQL / Vitess DB  |
                                                            +--------------------+
                                                                 /            \
                                     3. Async Search Index      /              \ 4. Dispatch Channel Fanout
                                                               v                v
                                                    +------------------+  +--------------------+
                                                    | Solr Search      |  | Real-Time Gateway  |
                                                    | Cluster          |  | (WebSocket Server) |
                                                    +------------------+  +--------------------+
                                                                                |
                                                                                v 5. WS Push to All Channel Members
                                                                          +--------------------+
                                                                          | Channel Members    |
                                                                          | (Active Workspaces)|
                                                                          +--------------------+
```

### Key Technical Mechanics
1. **Channel Message Fanout:** When a message is posted to a channel with 500 members, the Gateway publishes the event to a channel message broker (Kafka/NATS). Active WebSocket connections for all online channel members receive the frame simultaneously.
2. **Real-Time Presence Engine:** Tracks user status (`Active`, `Away`) using heartbeats pushed to a distributed in-memory presence service. Lazy presence polling updates workspace UI when channels are opened.
3. **Full-Text Search Indexing:** Asynchronously queues every channel message to Apache Solr or OpenSearch, allowing instant search filtering by channel, user, date, or file attachment.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/chat.postMessage`| POST | `{"channel": "C12345", "text": "Deploying release v2.0", "thread_ts": "17000000.0001"}` | `{"ok": true, "ts": "17000000.0002", "message": {...}}` |
| `/api/conversations.history`| GET | `{"channel": "C12345", "latest": "17000000.0002", "limit": 50}` | `{"ok": true, "messages": [...]}` |

### Slack Data Model & Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `channel_id` | String | Vitess (MySQL Shard) | Primary partition key representing the workspace channel. |
| `message_ts` | Decimal (Timestamp) | Vitess Shard | Unique time-based Primary Key within the channel. |
| `user_id` | String | Vitess | Sender member ID. |
| `text` | Text | Vitess & Solr Index | Raw message text content indexed for full-text search. |
| `thread_ts` | Decimal | Vitess | Parent message timestamp for threaded reply discussions. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Vitess (Sharded MySQL Engine)** | Horizontally scales MySQL databases across workspace boundaries; supports relational queries. | Complex shard key management (must shard cleanly by `workspace_id` or `channel_id`). | Enterprise SaaS applications with workspace-isolated data. |
| **Asynchronous Solr Search Indexing** | Enables powerful full-text search filters (`in:#general from:@alice`); fast response time. | Slight indexing lag (1-2 seconds) before newly posted messages appear in search queries. | Enterprise workspace search engines. |
| **Lazy Presence Polling** | Dramatically reduces presence heartbeat traffic across massive enterprise organizations. | User status indicators may take a few seconds to update when opening a large channel. | Enterprise chat platforms with thousands of users per workspace. |

### Key takeaway
**Slack** scales enterprise channel communication by partitioning database storage using **Vitess (Sharded MySQL)**, fanning out channel messages over persistent **WebSocket Gateways**, and indexing conversation history in **Solr for full-text search**.
