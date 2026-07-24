# Long Polling

> **Category:** Networking Basics

---

**Long Polling** (also known as HTTP Long Polling or Comet) is a communication technique designed to emulate real-time server pushes over standard HTTP requests. Unlike short polling, the server **holds the HTTP request open** until new data becomes available or a timeout limit is reached.

### Short Polling vs. Long Polling Lifecycle

```
+-------------------------------------------------------------------------+
|                  SHORT POLLING vs. LONG POLLING                         |
+-------------------------------------------------------------------------+

  SHORT POLLING:
  Client ---> HTTP Request ---> Server (No data) ---> Return Empty 200 OK
  Client ---> HTTP Request ---> Server (No data) ---> Return Empty 200 OK

  LONG POLLING:
  Client ---> HTTP Request ---> Server (Holds connection open...)
                                 | (Data becomes available after 15s)
  Client <--- 200 OK + Data <----+
  Client ---> Immediately Re-opens HTTP Request ---> Server (Holds...)
```

### Communication Pattern Trade-offs

| Feature | Short Polling | Long Polling | WebSockets |
| :--- | :--- | :--- | :--- |
| **Request Mechanism** | Client sends periodic requests every $N$ seconds. | Client sends request; server holds connection open until event. | Single upgrade handshake to persistent TCP socket. |
| **Server Load** | Extremely high (Processes empty requests constantly). | Medium (Holds open HTTP connections; requires thread/epoll handling). | Low per-message overhead (Single open connection per client). |
| **Real-Time Latency**| High (Delay bounded by polling interval). | Low (Immediate response when data arrives). | Ultra-Low (Instant full-duplex frames). |
| **Firewall / Proxy Compatibility**| 100% Compatible (Standard short HTTP). | Highly Compatible (Standard HTTP POST/GET). | May be blocked by strict enterprise proxies (if not on Port 443 WSS). |

### Key takeaway

Long Polling emulates server pushes by **holding HTTP requests open until data becomes available**. Use Long Polling as a fallback mechanism for legacy web clients or strict firewall environments where WebSockets are blocked.
