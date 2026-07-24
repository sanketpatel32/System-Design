# Design WhatsApp
> **Category:** Intermediate System Design Problems

---

### Overview
**WhatsApp** is a real-time messaging service handling over 100 billion messages per day across 2 billion users. The system provides instant message delivery, End-to-End Encryption (E2EE) via the Signal Protocol, media transfer, and delivery receipts (Sent, Delivered, Read).

Core design principles emphasize **zero message retention on servers post-delivery**, persistent Erlang/Elixir WebSocket connections, and asynchronous offline message queueing.

### System Architecture & E2EE Messaging Topology

```
SENDER (Alice Mobile)                 WEBSOCKET GATEWAY (Erlang Node)              RECEIVER (Bob Mobile)
  |                                                |                                       |
  | 1. Encrypt Payload using Bob's Public Key       |                                       |
  | 2. WS Send Message ("msg_99")                  |                                       |
  | ---------------------------------------------> |                                       |
  |                                                | 3. Check Bob Online Connection        |
  |                                                | 4. Deliver Message over Open WS       |
  |                                                | ------------------------------------> |
  |                                                |                                       |
  |                                                | 5. ACK Delivered (Double Checkmark)   |
  | 6. Update UI: Delivered Checkmark              | <------------------------------------ |
  | <--------------------------------------------- |                                       |
  |                                                | 7. Delete Message from Gateway Memory |
```

### Key Technical Mechanics
1. **Signal Protocol End-to-End Encryption (E2EE):** All text, voice, and media payloads are encrypted on the sender's device using symmetric session keys derived via Diffie-Hellman Key Exchange (Curve25519). WhatsApp backend servers act strictly as blind message relays and cannot decrypt payload contents.
2. **Erlang / Elixir Connection Nodes:** Uses Erlang's BEAM virtual machine to manage millions of concurrent open TCP/WebSocket connections per server instance with lightweight process threads.
3. **Offline Message Queueing:** If the recipient is offline, encrypted messages are stored temporarily in a Cassandra/Mnesia database. Once the client reconnects, pending messages are delivered and immediately deleted from backend servers.

### API Interface Specifications

| Endpoint / WS Frame | Protocol | Payload / Frame Content | Description |
|---|---|---|---|
| `WS /v1/chat` | WebSocket | `{"to": "user_bob", "msg_id": "m99", "cipher_text": "38aF92..."}` | Real-time encrypted message transmission frame. |
| `WS /v1/receipt` | WebSocket | `{"msg_id": "m99", "status": "DELIVERED", "timestamp": 1700000000}` | Triggers delivery receipt status checkmarks. |
| `/v1/media/upload-url`| HTTPS POST | `{"file_hash": "sha256...", "size": 1048576}` | Generates presigned URL for encrypted media uploads. |

### Message & Connection Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `message_id` | String (UUID) | Cassandra / Mnesia | Unique identifier for tracking message delivery state. |
| `recipient_phone` | String (Indexed) | Cassandra | Recipient lookup key for offline queueing. |
| `encrypted_payload` | Byte Array (BLOB) | Cassandra | E2EE encrypted ciphertext (Deleted immediately upon delivery). |
| `connection_gateway`| String (Node IP) | Redis Cache / Memory | Tracks which Erlang server node holds the active socket for a user. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **End-to-End Encryption (Signal Protocol)**| Ultimate user privacy; backend servers cannot be subpoenaed for message content. | Server cannot execute cloud-side message search or content moderation filtering. | Secure personal messaging platforms. |
| **Zero Server-Side Message Retention**| Minimizes backend database storage costs; reduces security breach liabilities. | If user loses their phone without a local backup, past chat history is lost permanently. | Ephemeral and private instant messaging architectures. |
| **Erlang BEAM Connection Nodes** | Ultra-low memory usage per connection; handles millions of concurrent sockets per node. | Niche programming language ecosystem (Erlang/Elixir) requiring specialized engineering skills. | High-concurrency chat and WebSocket gateway nodes. |

### Key takeaway
**WhatsApp** delivers secure instant messaging by employing **Signal Protocol End-to-End Encryption**, maintaining persistent **Erlang WebSocket connection nodes**, and enforcing **zero server-side message retention post-delivery**.
