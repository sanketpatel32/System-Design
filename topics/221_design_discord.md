# Design Discord
> **Category:** Intermediate System Design Problems

---

### Overview
**Discord** is a voice, video, and text communication platform handling millions of concurrent users across massive gaming servers (guilds) with low-latency messaging and voice chat.

### System Architecture Diagram

```
+---------------+     1. WebSocket Connection     +-------------------+
| Client App    | <=============================> | Gateway Service   |
+---------------+                                 | (Elixir / Rust)   |
        |                                         +-------------------+
        |                                                   |
        | 4. UDP Voice / Video Packets                      v 2. Fanout Message Event
        v                                         +-------------------+
+-------------------+                             | Event Router      |
| WebRTC SFU Media  |                             | (ScyllaDB / DB)   |
| (Media Node Box)  |                             +-------------------+
+-------------------+                                       |
                                                            v 3. Persist Messages
                                                  +-------------------+
                                                  | ScyllaDB Cluster  |
                                                  +-------------------+
```

### Core Architecture Components

| Component | Responsibility | Technology Stack |
|---|---|---|
| **Gateway Cluster** | Manages persistent WebSocket connections per user | Elixir (BEAM VM process per conn) |
| **Storage Engine** | High-throughput, low-latency text channel persistence | ScyllaDB (C++ rewrite of Cassandra) |
| **Voice Server (SFU)**| Selective Forwarding Unit (SFU) routing WebRTC audio packets | Rust / C++ |

### Text Storage Model (ScyllaDB Schema)
```sql
CREATE TABLE discord_messages (
    channel_id bigint,
    bucket int, -- Time bucket partition (e.g. 10 days)
    message_id bigint, -- Snowflake ID
    author_id bigint,
    content text,
    PRIMARY KEY ((channel_id, bucket), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);
```

### Key Technical Trade-offs
- **ScyllaDB over MongoDB/Cassandra**: Switched from MongoDB to Cassandra, then to ScyllaDB to eliminate JVM garbage collection latency spikes (p99 latency drops from 100ms+ to <5ms).
- **WebRTC SFU vs MCU**: Uses Selective Forwarding Units (SFU) for voice chat, forwarding raw media streams without expensive server-side audio re-encoding.

### Key takeaway
Discord scales real-time communication by managing WebSocket connections in **Elixir**, storing chat logs in **ScyllaDB** (partitioned by `channel_id` and time bucket), and routing voice media through **WebRTC SFUs**.
