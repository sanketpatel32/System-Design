# Least Connections Load Balancing

> **Category:** Load Balancing

---

**Least Connections Load Balancing** is a dynamic traffic management algorithm that routes incoming requests to the backend server currently handling the **fewest active open connections**.

### Connection-Aware Traffic Routing Topology

```
+-------------------------------------------------------------------------+
|              LEAST CONNECTIONS DYNAMIC ROUTING TOPOLOGY                 |
+-------------------------------------------------------------------------+

  Incoming Request: [ New Request X ]
                           |
                           v
           +-------------------------------+
           | LEAST CONNECTIONS BALANCER    |
           | Evaluates Active Connection   |
           | Counter for Each Target Server|
           +-------------------------------+
             | (15 Active)   | (4 Active)    | (22 Active)
             v               v               v
    +--------------+  +--------------+  +--------------+
    | Server 1     |  | Server 2     |  | Server 3     |
    | [Busy]       |  | [SELECTED]   |  | [Overloaded] |
    +--------------+  +--------------+  +--------------+
```

### Load Balancing Algorithm Comparison

| Algorithm | Routing Basis | Dynamic State Tracking | Best Workload Type |
| :--- | :--- | :--- | :--- |
| **Round Robin** | Fixed sequential loop | None (Stateless) | Uniform short HTTP requests |
| **Least Connections** | Fewest active concurrent connections | Tracks open TCP/HTTP sockets per node | **Long-lived persistent connections (WebSockets, SQL pools, streaming)** |
| **Least Response Time**| Lowest active connections + lowest latency | Tracks connections + ping RTT latency | High-responsiveness web services |

### Ideal Use Cases

- **Long-Lived Connections**: WebSockets, SSH sessions, gRPC streams, and database connection pools.
- **Variable Execution Workloads**: E-commerce checkouts where some transactions execute in 10ms while others (reports, image processing) take 10 seconds.

### How Connection Counts Stay Honest
- **Increment/decrement points**: the counter rises when the LB forwards a request and falls when the response (or WebSocket close) completes — slow-consumer detection matters more than raw counts.
- **Connection ≠ load**: a server holding 20 idle keep-alive sockets may be less loaded than one grinding through 3 heavyweight requests — least-*request* or least-*traffic* variants weigh bytes or in-flight HTTP requests instead of TCP sockets.
- **Weighted least connections**: multiply each server's count by a capacity weight (`weight = 1/CPU or 1/throughput`) so bigger boxes absorb proportionally more — essential for heterogeneous fleets.
- **State scope**: connection tables are per-LB-node; in horizontally scaled LB layers, use consistent hashing of clients to LB nodes (or shared state) to keep decisions coherent.

### Failure & Draining Behavior
| Scenario | Behavior |
|---|---|
| **Server slow (not down)** | Its count climbs, so new requests naturally route elsewhere — self-correcting without health checks. |
| **Health check failure** | Node removed from rotation; its in-flight connections drain before culling. |
| **Rolling deploy** | Connection-aware draining lets existing sockets finish while the node stops accepting new ones — zero dropped WebSockets. |
| **All servers saturated** | LB falls back to queuing/503 per policy; least-connections at saturation just distributes the overload evenly. |

### Key takeaway

Least Connections load balancing dynamically directs traffic to the server with the **fewest active open connections**. Use it for long-lived connection workloads (**WebSockets, database pools, long polling**) and variable execution tasks.
