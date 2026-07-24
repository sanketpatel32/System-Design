# Design Discord
> **Category:** Intermediate System Design Problems

---

### Overview
**Discord** is a real-time communication platform supporting voice, video, and text chat for over 150 million monthly active users across millions of communities called **Guilds** (Servers). The platform processes billions of text messages daily and handles low-latency multi-party voice communication.

Key technical achievements include migrating message storage from Cassandra to **ScyllaDB** (handling trillions of messages with consistent sub-millisecond tail latency) and operating custom **WebRTC Selective Forwarding Units (SFU)** for voice channels.

### System Architecture & Voice/Text Gateway Topology

```
+--------------------------------------------------------------------------+
| DISCORD CLIENT APP (Desktop / Mobile / Web)                              |
+--------------------------------------------------------------------------+
          |                                                   |
          | 1. Text Message (WebSocket Elixir Gateway)        | 2. UDP Voice Stream (WebRTC)
          v                                                   v
+------------------------------------+             +------------------------------------+
| ELIXIR GATEWAY & MESSAGE SERVICE   |             | RTC VOICE SERVER (WebRTC / SFU Node|
| (Manages Guild WS Connections)     |             | Routers Voice Packets via Opus)   |
+------------------------------------+             +------------------------------------+
          |                                                   |
          | 3. High-Throughput Write                          | Telemetry / Metrics
          v                                                   v
+------------------------------------+             +------------------------------------+
| SCYLLADB DISTRIBUTED CLUSTER       |             | PROMETHEUS / DATA DOG              |
| (ScyllaDB C++ LSM Storage Engine)  |             | (Monitors Packet Loss & Jitter)   |
+------------------------------------+             +------------------------------------+
```

### Key Technical Mechanics
1. **ScyllaDB Migration for Message Storage:** Replaced Apache Cassandra with ScyllaDB (C++ rewrite of Cassandra). ScyllaDB's thread-per-core architecture and custom disk I/O scheduler eliminated JVM garbage collection pauses, reducing tail latency ($P_{99}$) from 1,000ms down to **< 5ms**.
2. **Selective Forwarding Unit (SFU) Voice Engine:** Voice channels use WebRTC over UDP. Rather than mixing audio server-side (MCU), Discord SFU nodes forward Opus-encoded audio packets directly to all participants in a voice channel, enabling sub-20ms audio latency.
3. **Elixir Gateway Connection Management:** Uses Elixir process trees on the BEAM VM to manage millions of concurrent WebSocket client connections organized by Guild.

### API Interface Specifications

| Endpoint / WS Frame | Protocol | Payload Content | Purpose |
|---|---|---|---|
| `POST /api/v9/channels/{id}/messages`| HTTPS | `{"content": "gg wp", "nonce": "99210"}` | Posts message to text channel. |
| `WS Opcode 2: Identify` | WebSocket | `{"token": "m_99", "properties": {"$os": "linux"}}` | Establishes WebSocket gateway session and subscribes to Guild events. |
| `UDP Voice Packet` | WebRTC / UDP| Opus Audio Bytes + Sequence Header | Low-latency voice frame payload. |

### Message Storage Data Model (ScyllaDB Schema)

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `channel_id` | BigInt (Snowflake)| ScyllaDB Partition Key| Shards message history by Discord channel. |
| `bucket` | Integer | ScyllaDB Partition Key| Time bucket (e.g., 10-day window) preventing partition size explosion. |
| `message_id` | BigInt (Snowflake)| ScyllaDB Clustering Key| Time-sortable Snowflake ID (Clustering Order DESC). |
| `author_id` | BigInt | ScyllaDB | Sender user ID. |
| `content` | Text | ScyllaDB | Message payload text string. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **ScyllaDB (C++) over Cassandra (Java)** | Eliminates JVM GC pauses; sub-5ms $P_{99}$ latency; 10x higher throughput per node. | Requires specialized C++ performance tuning and ScyllaDB operational expertise. | Ultra-high throughput time-series and message storage engines. |
| **WebRTC SFU vs MCU Architecture** | Minimal server CPU load; sub-20ms audio packet routing; scales to 100+ voice users. | Higher client-side downstream network bandwidth required to receive multiple audio streams. | Real-time multi-party voice/video platforms. |
| **Elixir / Erlang Connection Nodes** | Exceptional concurrency handling; fault-tolerant process supervision trees. | Dynamic typing and specialized functional programming language curve. | Massive real-time WebSocket connection gateways. |

### Key takeaway
**Discord** processes trillions of messages with sub-5ms $P_{99}$ latency by storing message partitions in **ScyllaDB (C++)**, routing real-time voice packets over **WebRTC SFUs using UDP/Opus**, and managing client connections using **Elixir WebSockets**.
