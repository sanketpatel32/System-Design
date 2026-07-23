# Distributed Tracing

> **Category:** Observability

---

Distributed tracing = **following a single request as it flows through multiple services**.
The third pillar of observability (after logs and metrics).

### Why
- Microservices = one request hits many services.
- Logs and metrics don't show the **end-to-end** journey.
- "Where is the 2 seconds spent?" is impossible without tracing.

### How it works
```
Request ID: trace_id=abc
  |
  +-- Service A (200ms)
       |
       +-- Service B (50ms)
       |    |
       |    +-- DB query (40ms)
       |
       +-- Service C (150ms)
            |
            +-- External API (140ms)
```
Each span has: trace_id, span_id, parent_id, operation, start, duration, tags.

### Trace structure
- **Trace**: end-to-end journey of one request.
- **Span**: one operation (a service call, DB query).
- **Context propagation**: trace_id passed via headers.

### Standards
- **OpenTelemetry** (OTel): the merging of OpenTracing + OpenCensus. Standardizes
  instrumentation.
- Propagation via W3C Trace Context headers.

### Tools
- **Jaeger** (open source).
- **Zipkin** (open source).
- **Datadog APM**.
- **Honeycomb**.
- **AWS X-Ray**.

### What traces show
- Where time is spent (slowest span).
- Errors (span marked error).
- Service topology (who calls who).
- Hot paths (high-frequency traces).

### Sampling
- Tracing every request = too much data.
- Sample 1-10% of traffic.
- Always sample errors and slow requests.

### Implementation
```python
from opentelemetry import trace
tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("process_order"):
    with tracer.start_as_current_span("charge_payment"):
        charge()
    with tracer.start_as_current_span("update_inventory"):
        update()
```

### Key takeaway
Distributed tracing follows a request across services. Essential for debugging microservice
latency and errors. Use **OpenTelemetry** for instrumentation, Jaeger/Zipkin/Datadog for
collection. Sample to control cost.
