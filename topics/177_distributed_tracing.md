# Distributed Tracing

> **Category:** Observability

---

Distributed tracing is an observability technique that **tracks the lifecycle of a request as it propagates across multiple microservices, message queues, and databases**. It constructs an end-to-end visual timeline (a Trace) composed of individual service execution segments (Spans), enabling rapid pinpointing of performance bottlenecks in distributed systems.

### Distributed Tracing Architecture & Context Propagation

Context headers (`traceparent`) propagate through network calls, allowing collector engines to reconstruct full request call graphs.

```
Client Request ---> [ API Gateway ] (Injects Trace ID: 0x4a9b)
                         |
           +-------------+-------------+
           | (HTTP Header: traceparent)|
           v                           v
   [ Auth Service ]            [ Order Service ]
   Span ID: 0x01               Span ID: 0x02
   Duration: 15ms              Duration: 120ms
                                       |
                                       v (gRPC Call)
                               [ Payment Gateway ]
                               Span ID: 0x03
                               Duration: 85ms

Reconstructed Trace View (Gantt Chart):
Trace ID: 0x4a9b Total Duration: 135ms
|-- API Gateway [========================================] 135ms
    |-- Auth Service [==] 15ms
    |-- Order Service [===============================] 120ms
        |-- Payment Gateway [======================] 85ms  <-- Bottleneck Identified!
```

### Core Distributed Tracing Terminology Matrix

| Term | Definition & Role | Example Value |
| :--- | :--- | :--- |
| **Trace** | The entire end-to-end execution DAG representing a single request | `trace_id: 4bf92f3577b34da6a3ce929d0e0e4736` |
| **Span** | A single contiguous unit of work within a specific service | `span_id: 00f067aa0ba902b7`, `name: SELECT * FROM users` |
| **Context Propagation**| Transmitting trace identifiers across network boundaries via HTTP/gRPC headers | W3C Trace Context Header (`traceparent: 00-4bf92f...-00f067...-01`) |
| **Sampling Rate** | The percentage of total traces collected and stored | Head-based sampling (1% of requests) to control storage |

### W3C Trace Context Standard Header Format

Distributed tracing uses the standardized W3C `traceparent` HTTP header format:
`traceparent: version - trace_id - parent_span_id - trace_flags`

### Key Trade-offs & Production Design

- ✅ **Pinpoints Cross-Service Bottlenecks**: Identifies exact service spans causing P99 latency spikes.
- ✅ **Dependency Mapping**: Automatically visualizes runtime microservice dependency graphs.
- ❌ **Storage & Network Overhead**: Collecting 100% of traces at high scale generates huge network and storage costs. Use **Sampling (Head-Based or Tail-Based)** to store 1%-5% of normal traces and 100% of error traces.
### OpenTelemetry Go Span Instrumentation Example

```go
package main

import (
    "context"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/trace"
)

var tracer = otel.Tracer("payment-service")

func ProcessPayment(ctx context.Context, orderID string) error {
    // Create new child span linked to parent Trace ID from context
    ctx, span := tracer.Start(ctx, "ProcessPayment", trace.WithAttributes(
        attribute.String("order.id", orderID),
    ))
    defer span.End()

    // Business payment processing logic...
    return nil
}
```

### Key takeaway

Distributed tracing uses **W3C context propagation headers (`traceparent`) to reconstruct end-to-end multi-service request spans**, rendering visual Gantt charts to pinpoint latency bottlenecks.
