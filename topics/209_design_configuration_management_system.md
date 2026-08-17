# Design Configuration Management System
> **Category:** Beginner System Design Problems

---

### Overview
A **Configuration Management System** (e.g., Spring Cloud Config, Consul Key-Value, etcd) provides centralized storage, version control, and real-time distribution of dynamic application configuration settings across distributed microservices.

It replaces static configuration files and process restarts by pushing configuration updates dynamically over long-polling or gRPC streams while providing audit logging and cryptographic consensus durability.

### System Architecture & Dynamic Sync Topology

```
+--------------------------------------------------------------------------+
| ADMIN UI / CI/CD PIPELINE (Writes updated config: "db_pool_size = 50")   |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Write Config Key
+--------------------------------------------------------------------------+
| CONSENSUS CONFIG STORE (etcd / Raft Cluster / Consul KV)                  |
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Watch Notification (gRPC / Long Polling)
+--------------------------------------------------------------------------+
| APPLICATION MICROSERVICE NODES                                           |
|  [ In-Memory Config Manager ] ---> 3. Hot-Reloads Settings Dynamically   |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Raft Consensus Storage Engine:** Uses etcd or Consul backed by the Raft consensus algorithm to guarantee strong consistency (CP in CAP theorem) across distributed configuration nodes.
2. **Watch Primitive (Long Polling / gRPC Streams):** Microservices open a persistent `Watch` connection to the config store. When a key mutates, the store pushes the diff directly to watching nodes.
3. **Hierarchical Environment Overrides:** Resolves configuration values hierarchically: `Global Defaults` arrow `Region Overrides` arrow `Environment (Prod)` arrow `Service-Specific Config`.

### Configuration Management API Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/config/keys` | POST | `{"key": "prod/payment/timeout_ms", "value": "5000", "comment": "Increase for promo"}` | `{"version": 42, "status": "COMMITTED"}` |
| `/api/v1/config/watch` | GET | `{"service": "payment-service", "current_version": 41}` | `HTTP 200` (Pushes diff when version increments) |
| `/api/v1/config/rollback`| POST | `{"key": "prod/payment/timeout_ms", "target_version": 40}` | `{"status": "ROLLED_BACK", "version": 43}` |

### Configuration Storage Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `config_key` | String (Indexed) | etcd / PostgreSQL | Hierarchical path identifier (`/prod/us-east/payment/db_max_conn`). |
| `config_value` | Text / JSONB | etcd / PostgreSQL | Configuration value payload. |
| `version` | Int64 | etcd (Revision) | Monotonically increasing revision number used for Raft consensus and Watchers. |
| `created_by` | String | Relational DB | Audit identity user or service account making change. |
| `checksum_sha256` | String | Relational DB | Cryptographic validation hash verifying config payload integrity. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Consensus-Based Storage (etcd/Raft)**| Strong consistency guarantees; eliminates configuration drift across nodes. | Write operations require Raft quorum agreement, adding slight write latency. | Mission-critical distributed microservice configuration. |
| **Hot-Reloading In-Memory SDK** | Applies configuration updates instantly without restarting microservice containers. | Application code must be written thread-safely to support runtime state mutation. | High-availability systems where process restarts drop active connections. |
| **Encrypted Config Secrets (KMS Integration)**| Securely stores DB passwords and API tokens alongside standard config keys. | Key decryption overhead on microservice node startup. | Centralized configuration stores containing sensitive credentials. |

### Key takeaway
A **Configuration Management System** uses **Raft consensus storage (etcd)** for strongly consistent key-value persistence, leveraging **gRPC Watch streams** to hot-reload configuration changes across microservices without process restarts.
