# Design Slack
> **Category:** Intermediate System Design Problems

---

### Overview
**Slack** is an enterprise channel-based messaging platform supporting real-time group chat, file sharing, thread discussions, integration webhooks, and team presence.

### System Architecture Diagram

```
+---------------+     1. WebSocket Connection (WSS)     +-------------------+
| Client App    | <===================================> | Gateway Servers   |
+---------------+                                       | (WebSockets/Elixir)|
                                                        +-------------------+
                                                                  |
                                                                  v 2. Publish Channel Event
                                                        +-------------------+
                                                        | Real-Time Message |
                                                        | Router Bus        |
                                                        +-------------------+
                                                                  |
                                              +-------------------+-------------------+
                                              |                                       |
                                              v 3. Fanout to Online Clients           v 4. Save Channel Log
                                    +-------------------+                   +-------------------+
                                    | Channel Gateway   |                   | MySQL Shards /    |
                                    | Connection Nodes  |                   | Vitess DB Cluster |
                                    +-------------------+                   +-------------------+
```

### Data Storage Model (Vitess Sharded by `channel_id`)
```sql
CREATE TABLE channel_messages (
    channel_id BIGINT,
    message_id BIGINT, -- Snowflake ID
    user_id BIGINT,
    content TEXT,
    created_at TIMESTAMP,
    PRIMARY KEY (channel_id, message_id)
);
```

### Key Differences: Slack vs WhatsApp

| Dimension | Slack | WhatsApp |
|---|---|---|
| **Target Scale Model** | Workspace / Multi-channel enterprise (10k+ users in 1 channel) | 1-to-1 & small personal groups (<1024 users) |
| **Message Persistence** | Perpetual centralized cloud history search | Local device storage; transient server relay |
| **Search Requirements** | Complex full-text channel search (OpenSearch / Solr) | Local on-device database search |

### Key takeaway
Slack relies on persistent **WebSocket gateway clusters** sharded by workspace, routing channel events through a high-throughput message bus to write to persistent **sharded database clusters (Vitess)**.
