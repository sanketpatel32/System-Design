# Server-Sent Events

> **Category:** Networking Basics

---

**Server-Sent Events (SSE)** is a lightweight, standardized HTML5 specification (RFC 6202) that enables a server to **stream real-time text data continuously to clients over a single persistent HTTP connection** (`text/event-stream`).

### Server-Sent Events Architecture

```
+-------------------------------------------------------------------------+
|                  SERVER-SENT EVENTS (SSE) STREAM                        |
+-------------------------------------------------------------------------+

  Client (EventSource API)                           Server
    |                                                  |
    |--- 1. HTTP GET /stream (Accept: text/event-stream) -->|
    |<-- 2. HTTP 200 OK (Content-Type: text/event-stream) --|
    |                                                  |
    |==================================================|
    |   UNIDIRECTIONAL PERSISTENT HTTP STREAM          |
    |                                                  |
    |<-- 3. event: token\ndata: {"text": "Hello"}\n\n---|
    |<-- 4. event: token\ndata: {"text": " World"}\n\n--|  (LLM Response Streaming)
    |==================================================|
```

### Server-Sent Events vs. WebSockets Comparison

| Dimension | Server-Sent Events (SSE) | WebSockets (WS) |
| :--- | :--- | :--- |
| **Directionality** | Unidirectional (Server -> Client only) | Full-Duplex Bi-Directional (Client <-> Server) |
| **Protocol Baseline**| Standard HTTP/1.1 or HTTP/2 | Custom WebSocket protocol (RFC 6455) |
| **Data Format** | UTF-8 Text Streams (`text/event-stream`) | Binary or UTF-8 Text frames |
| **Reconnection Handling**| Automatic built-in browser client retries with last event ID (`Last-Event-ID`). | Custom application code required for reconnects. |
| **HTTP/2 Multiplexing**| Native support (Shares single HTTP/2 TCP connection). | Bypasses HTTP/2 multiplexing (Requires separate TCP connection). |
| **Ideal System Use Case**| LLM Token Streaming (ChatGPT), Live Sports Scores, Stock Tickers. | Live Multiplayer Gaming, Chat Apps, Collaborative Editors. |

### SSE Event Stream Payload Format

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

id: 101
event: completion
data: {"token": "System"}

id: 102
event: completion
data: {"token": " Design"}
```

### Key takeaway

Use **Server-Sent Events (SSE)** for unidirectional real-time text streaming (such as LLM responses, sports scores, and stock feeds). SSE leverages standard HTTP/2 streams, works seamlessly with CDNs, and includes built-in client auto-reconnection.
