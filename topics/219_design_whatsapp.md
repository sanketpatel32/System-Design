# Design WhatsApp
> **Category:** Intermediate System Design Problems

---

### Overview
**WhatsApp** is a cross-platform end-to-end encrypted instant messaging platform designed for ultra-low latency messaging, media sharing, presence tracking, and voice/video calling.

### Architecture Topology Diagram

```
Sender Device (Alice)                         Chat Server Gateway                    Receiver Device (Bob)
       |                                             |                                       |
       | === 1. WebSocket (Signal Protocol E2EE) ==> |                                       |  (If Online)
       |                                             | === 2. WebSocket Push ===============>|
       |                                             |                                       |
       |                                             | --- 3. Save Offline Msg (If Offline)-> |
       |                                             |                                       |
       |                                             |                                 +---------------+
       |                                             |                                 | Cassandra DB  |
       |                                             |                                 +---------------+
```

### End-to-End Encryption (Signal Protocol)
- **Public Key Infrastructure**: Server acts strictly as a cryptographic key directory holding identity keys and pre-keys.
- **Double Ratchet Algorithm**: Every individual message is encrypted with a unique single-use message key derived from rolling DH ratchets. Server **cannot** decrypt message contents.

### Message State Transitions & Ephemeral Delivery

| Message State | Indicator | Server Action |
|---|---|---|
| **Sent to Server** | Single Gray Checkmark ($\check$) | Message received by Chat Gateway; stored temporarily in transient store. |
| **Delivered to Receiver**| Double Gray Checkmark ($\check\check$) | Receiver device ACKs delivery; **server deletes message from disk**. |
| **Read by Receiver** | Double Blue Checkmark ($\check\check$) | Receiver opens thread; sends Read Receipt payload to sender. |

### Presence Engine (Online/Offline Status)
- High-throughput heartbeats over open WebSocket connections managed in a distributed memory store (**Erlang / Redis**).

### Key takeaway
WhatsApp operates a **stateless message relay**: messages are end-to-end encrypted using the **Signal Protocol** and deleted permanently from server storage as soon as recipient device delivery acknowledgment is received.
