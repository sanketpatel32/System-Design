# Stateless Services

> **Category:** Scaling

---

A **stateless service** is an architectural pattern where application instances store no client session data, request history, or ephemeral state locally across requests. Every incoming request must contain all context (authentication tokens, payload metadata, transaction parameters) required for processing, or rely on shared external infrastructure for persistent state.

### System architecture

```
                     +-----------------------------------+
                     |           Load Balancer           |
                     +-----------------------------------+
                         /             |             \
                        /              |              \
                       v               v               v
            +--------------+   +--------------+   +--------------+
            | App Instance |   | App Instance |   | App Instance |
            |   (Node A)   |   |   (Node B)   |   |   (Node C)   |
            +--------------+   +--------------+   +--------------+
                   \                  |                  /
                    +-----------------+-----------------+
                                      |
                                      v
                       +-----------------------------+
                       | External Distributed State  |
                       |  (Redis / S3 / Postgres)    |
                       +-----------------------------+
```

### Core mechanics & externalization strategies

In a stateless architecture, application worker nodes function as pure compute workers. State is decoupled and offloaded to specialised infrastructure services:

1. **Session & Authentication State**: Instead of local server sessions, applications utilize self-contained **JSON Web Tokens (JWT)** or central distributed caches (e.g., Redis cluster) for session lookups.
2. **File Storage & Uploads**: File uploads bypass application local disks directly to object storage solutions like **Amazon S3** or Blob Storage, using pre-signed URLs.
3. **Caching**: Memory caching is externalized to distributed caches (Memcached/Redis) so cache hits are independent of the targeted compute node.
4. **Task Scheduling**: Local in-memory timers (`setInterval`, cron jobs) are replaced by distributed schedulers or message queues (Quartz, Celery, AWS SQS).

### Externalization pattern matrix

| State Type | In-Memory (Stateful Anti-Pattern) | Externalized (Stateless Best Practice) | Trade-Off / Considerations |
| :--- | :--- | :--- | :--- |
| **User Session** | Server-side RAM (`HttpSession`) | Encrypted JWT / Redis Session Store | Token invalidation complexity vs zero server stickiness |
| **User Files** | Local Disk (`/tmp/uploads/`) | Amazon S3 / Cloud Storage | Network hop latency vs infinite scalable capacity |
| **App Caching** | Local Process RAM Dict | Redis / Memcached Cluster | Cache serialization overhead vs uniform hit ratio across nodes |
| **Async Jobs** | Background Threads (`Thread.start`) | RabbitMQ / Apache Kafka / SQS | Network protocol management vs fault-tolerant worker distribution |

### Advantages & trade-offs

- **Horizontal Scalability**: Add or remove compute nodes dynamically behind a load balancer without dropping active user sessions or requiring sticky session routing.
- **Fault Tolerance & Elasticity**: If an app instance crashes, any other instance immediately handles subsequent requests without loss of progress.
- **Simplified Deployment**: Enables zero-downtime rolling updates, canary releases, and blue/green deployments, as nodes can be terminated without session migration.
- **Trade-Off**: Increases network hop latencies and bandwidth consumption because every request requires external state fetching over TCP connections.

### Key takeaway

Statelessness is the cornerstone of elastic horizontal scaling. By removing local state from application nodes and delegating persistence to external caches, databases, and object stores, compute instances become ephemeral, interchangeable, and trivial to scale.
