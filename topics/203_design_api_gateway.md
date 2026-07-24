# Design API Gateway
> **Category:** Beginner System Design Problems

---

### Overview
An **API Gateway** acts as a single entry point reverse proxy for microservice applications, encapsulating internal service architecture and delivering routing, SSL termination, rate limiting, authentication, load balancing, and telemetry aggregation.

### Architectural Component Topology

```
+---------------+
| Client Apps   |
+---------------+
        |
        v HTTP/2, HTTPS
+-------------------------------------------------------------------------+
|                               API GATEWAY                               |
|                                                                         |
|  [ TLS Termination ] --> [ Rate Limiter ] --> [ Authentication/AuthZ ] |
|                                                      |                  |
|  [ Metrics & Logging ] <-- [ Request Router ] <------+                  |
+-------------------------------------------------------------------------+
        |                                |                                |
        v gRPC                           v REST                           v WebSockets
+---------------+                +---------------+                +---------------+
| Auth Service  |                | Order Service |                | Push Service  |
+---------------+                +---------------+                +---------------+
```

### Core API Gateway Functional Capabilities

| Feature Component | Implementation Responsibility |
|---|---|
| **Request Routing** | Routes `/api/v1/orders/*` to Order microservice cluster based on path/headers. |
| **Authentication / JWT** | Validates incoming JWT tokens at edge, passing verified user claims (`X-User-Id`) to internal services. |
| **Protocol Translation** | Translates client HTTP/JSON requests into internal high-performance gRPC Protobuf payloads. |
| **Resilience & Circuit Breaking** | Implements retries, timeouts, and circuit breakers (Resilience4j/Envoy) to isolate service failures. |

### Gateway Technology Comparison

| Gateway Framework | Processing Model | Performance | Ecosystem |
|---|---|---|---|
| **Envoy / NGINX** | Event-driven C++ asynchronous | Extremely High (Sub-ms latency) | Kubernetes ingress standard (Istio/Kong) |
| **Spring Cloud Gateway** | Reactive Non-blocking (Project Reactor) | High | Java / Spring Boot microservices |
| **Kong (Lua / OpenResty)**| NGINX core with Lua plugins | Very High | Dynamic plugin marketplace |

### Key takeaway
An **API Gateway** decouples client applications from internal microservices. Use asynchronous event-driven proxies (**Envoy / NGINX / Kong**) to execute edge concerns (TLS, AuthN, Rate Limiting) without introducing microservice bottlenecks.
