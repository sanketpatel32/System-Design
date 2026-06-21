# Design Configuration Management System

> **Category:** Beginner System Design Problems

---

Design a centralized config service: store and serve configs to all services.

### Requirements
- **Functional**: store key-value configs; versioning; per-environment; audit.
- **Non-functional**: low-latency reads; HA; eventually consistent.

### Architecture
```
[Admin UI] -> [Config Service] -> [DB]
                                   |
                                   v
                              [Cache]
                                   |
[Services] <-- SDK poll ----------+
```

### Features
- **Per-environment**: dev/staging/prod.
- **Per-service**: namespace by service.
- **Versioning**: rollback to previous.
- **Audit**: who changed what, when.
- **Schema validation**.

### SDK
- Cached locally (file + memory).
- Poll for changes (every 30s).
- Watch / push for instant updates.

### Data model
```
configs:
  key
  value (JSON)
  env
  service
  version
  updated_by
  updated_at
```

### HA
- Multi-AZ.
- Fallback to local cached file if config service down.
- Never block on config fetch.

### Real-world
- Spring Cloud Config, Consul KV, etcd, Zookeeper, AWS AppConfig.

### Key takeaway
Config service = centralized store + SDK with local cache + fallback. Per-env, versioned,
audited. Services should never hard-fail if config is unreachable — fall back to local cache.
