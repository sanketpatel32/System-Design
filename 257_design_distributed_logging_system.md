# Design Distributed Logging System

> **Category:** Data Intensive Systems

---

See **#210 Design Logging System** for the centralized design.

### Distributed-specific
- Logs from thousands of services.
- Cross-service tracing (correlation IDs).
- Massive ingestion rates.

### Architecture (EFK)
```
[Pods/containers] stdout -> [Fluentbit DaemonSet] -> [Kafka] -> [Fluentd]
                                                               |
                                                               v
                                                          [Elasticsearch]
                                                          [Kibana]
```

### Scale
- Shipper per node (DaemonSet).
- Kafka buffers.
- Multiple ES nodes for query load.

### Key takeaway
Distributed logging = shipper per node → Kafka → Elasticsearch → Kibana. Add **correlation IDs**
to trace requests across services. ELK/EFK is the standard stack.
