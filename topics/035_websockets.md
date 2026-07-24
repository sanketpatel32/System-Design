# WebSockets

> **Category:** Networking Basics

---

**WebSockets (WS/WSS)** provide a **full-duplex, persistent, bi-directional communication channel** over a single TCP socket connection. Standardized in RFC 6455, WebSockets allow servers and clients to stream real-time data frame updates instantly with minimal header overhead (2 to 10 bytes).

### WebSocket Connection Upgrade Handshake

```
+-------------------------------------------------------------------------+
|                  WEBSOCKET CONNECTION LIFECYCLE                         |
+-------------------------------------------------------------------------+

  Client                                             Server
    |                                                  |
    |--- 1. HTTP GET /chat (Upgrade: websocket) ------>|
    |<-- 2. HTTP 101 Switching Protocols --------------| (Handshake Complete)
    |                                                  |
    |==================================================|
    |   PERSISTENT FULL-DUPLEX TCP SOCKET CHANNEL      |
    |                                                  |
    |---- 3. Client Message Frame (Binary/Text) ------>|
    |<--- 4. Server Push Frame (Instant Stream) -------|
    |==================================================|
```

### Real-Time Communication Protocols Comparison

| Protocol | Directionality | Transport Layer | Connection Lifetime | Overhead | Typical Use Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **WebSockets** | Bi-directional (Client <-> Server) | Single Persistent TCP Socket | Long-lived persistent connection | Very Low (2-10 B frames) | Real-time chat, multiplayer gaming, collaborative whiteboards |
| **HTTP Polling** | Unidirectional (Client -> Server) | Short-lived HTTP Requests | Repeated new connections | High (HTTP headers per poll) | Non-critical status updates |
| **Long Polling** | Unidirectional simulation | Held HTTP Request | Held until server event fires | Medium-High | Legacy notification fallback |
| **Server-Sent Events (SSE)**| Unidirectional (Server -> Client) | Persistent HTTP/2 Stream | Long-lived HTTP stream | Low (Text Event Stream) | Live financial tickers, AI response streaming (ChatGPT) |

### WebSocket Scaling Challenges

1. **Stateful Connection Management**: Because WebSocket servers maintain open TCP connections, load balancers must support **sticky sessions** or custom connection routing.
2. **Horizontal Scale-Out Architecture**: To broadcast messages across multiple WebSocket server nodes, instances use a **Redis Pub/Sub** or **Kafka** message backbone.

### Key takeaway

WebSockets provide **full-duplex, real-time bi-directional messaging** over a single persistent TCP connection. Use a **Redis Pub/Sub pub/sub cluster** at the backend to broadcast messages across stateless WebSocket gateway nodes.
