# Distributed Tracing

> **Category:** Observability

---

Distributed Tracing tracks the **end-to-end flow of a single user request** as it traverses multiple microservices, network proxies, and database layers, identifying latency bottlenecks and failures.

### Distributed Trace Execution Timeline

```
Trace ID: 4b901f (Total Duration: 250ms)
+-----------------------------------------------------------------------------------+
| [API Gateway] POST /order (0ms - 250ms)                                           |
+-----------------------------------------------------------------------------------+
        |
        +---> [Auth Service] Validate Token (5ms - 25ms)
        |
        +---> [Order Service] Process Order (30ms - 240ms)
                    |
                    +---> [Payment Service] Charge Card (40ms - 150ms)
                    |
                    +---> [Inventory DB] Lock Stock (160ms - 230ms)
```

### Tracing Context Anatomy

As network calls travel between microservices, W3C Trace Context headers are injected into HTTP/gRPC metadata:

- **Trace ID**: Unique 128-bit global identifier representing the entire end-to-end request.
- **Span ID**: Unique 64-bit identifier representing an individual service operation execution block.
- **Parent Span ID**: Identifies the calling parent operation establishing parent-child hierarchy.

### Tracing Stack Comparison

| Tracing System | Open Standard | Collector Protocol | Storage Backend | Key Feature |
| :--- | :--- | :--- | :--- | :--- |
| **OpenTelemetry (OTel)**| W3C Standard | OTLP (gRPC / HTTP) | Multi-vendor exporter | Vendor-neutral industry standard |
| **Jaeger** | CNCF Project | Jaeger / OTLP | Elasticsearch, Cassandra | Deep waterfall UI visualization |
| **Zipkin** | Open Source | B3 Propagation | Elasticsearch | Lightweight Java-native tracing |

### Key takeaway

Implement distributed tracing with **OpenTelemetry trace context propagation** across microservices to isolate latency bottlenecks and RPC dependencies.
