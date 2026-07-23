# Design Logging System

> **Category:** Beginner System Design Problems

---

Design a centralized logging system: collect, store, search logs from all services.

### Requirements
- **Functional**: ingest logs; search by query; filter by service/time; alert.
- **Non-functional**: high-throughput ingestion; low-latency search; retention.

### Architecture (ELK / EFK stack)
```
[Services] -> [Log shipper (Fluentd/Filebeat)] -> [Kafka] -> [Logstash]
                                                              |
                                                              v
                                                       [Elasticsearch] <- search
                                                              |
                                                              v
                                                          [Kibana]
```

### Ingestion
- Apps write to stdout / file.
- Shipper (Fluentbit, Filebeat) tails logs.
- Kafka buffers (absorbs bursts).
- Logstash parses, enriches, indexes.

### Storage
- **Elasticsearch**: inverted index for full-text search.
- Time-based indices (one per day).
- Lifecycle: hot → warm → cold → delete.

### Search
- Kibana / Grafana UI.
- Lucene query syntax: `service:auth AND level:ERROR`.
- Aggregations: counts by service, error rate over time.

### Retention
- Hot: 7-30 days (fast SSD).
- Warm: 30-90 days.
- Cold: archive to S3.

### Alerts
- Error rate spike.
- Specific error pattern.
- Disk usage.

### Key takeaway
Logging system = shipper → Kafka (buffer) → Logstash → Elasticsearch → Kibana. Time-based
indices + lifecycle management. Alerts on error patterns. The classic ELK stack.
