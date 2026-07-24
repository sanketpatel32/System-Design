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

### Key takeaway

Least Connections load balancing dynamically directs traffic to the server with the **fewest active open connections**. Use it for long-lived connection workloads (**WebSockets, database pools, long polling**) and variable execution tasks.
