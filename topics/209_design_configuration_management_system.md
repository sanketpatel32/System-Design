# Design Configuration Management System
> **Category:** Beginner System Design Problems

---

### Overview
A **Configuration Management System** (e.g., Spring Cloud Config, etcd, Consul) manages dynamic runtime application configurations, feature toggles, and environment properties centrally across distributed microservices.

### Centralized Architecture with Push Notifications

```
+-----------------------+     1. Commit Config     +---------------------+
| Developer / Git Ops   | -----------------------> | Git Repository      |
+-----------------------+                          +---------------------+
                                                              |
                                                              v 2. Webhook Event
                                                   +---------------------+
                                                   | Config Server       |
                                                   +---------------------+
                                                              |
                                                              v 3. Sync State & Cache
                                                   +---------------------+
                                                   | Redis / etcd Cluster|
                                                   +---------------------+
                                                              |
                                                              v 4. Push Dynamic Update (Long Poll / gRPC)
                                                   +---------------------+
                                                   | Microservice Nodes  |
                                                   +---------------------+
```

### Configuration Data Storage Comparison

| Storage Engine | Consistency Model | Watch / Notification Mechanism | Ideal Usage |
|---|---|---|---|
| **etcd** | Strong Consistency (Raft consensus) | Native gRPC Long-polling Watchers | Kubernetes cluster config, core infrastructure |
| **HashiCorp Consul**| Strong Consistency (Raft) | HTTP Long Polling / Event Streams | Service discovery & dynamic key-value store |
| **Git Backend + Redis**| Eventual Consistency | Webhooks + Memory Cache | Application properties, YAML configuration files |

### Property Hierarchy & Inheritance Matrix

| Level | Precedence | Example |
|---|---|---|
| **1. Service Local Override** | Highest | Command line args (`--server.port=8081`) |
| **2. Environment Specific** | Medium | `application-production.yaml` |
| **3. Global Service Defaults** | Lowest | `application-default.yaml` |

### Key takeaway
Centralize configuration management using **etcd** or **Consul** backed by **Git version control**. Provide instant configuration updates to application pods using **gRPC streaming watches** or **long polling**.
