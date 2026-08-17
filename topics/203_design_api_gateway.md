# Design API Gateway
> **Category:** Beginner System Design Problems

---

### Overview
An **API Gateway** is a reverse proxy that acts as the single point of entry for external client applications into an underlying microservices architecture. It abstracts backend service boundaries by consolidating cross-cutting concerns—such as request routing, authentication, SSL termination, rate limiting, logging, response caching, and API versioning.

Modern API Gateways (e.g., Kong, Envoy, KrakenD, AWS API Gateway) operate at high throughput using non-blocking asynchronous I/O primitives.

### API Gateway Core Topology & Feature Architecture

```
+--------------------------------------------------------------------------+
| CLIENT APPLICATIONS (Web Browsers, Mobile Devices, Third-Party SDKs)     |
+--------------------------------------------------------------------------+
                                     |
                                     v HTTPS (Port 443)
+--------------------------------------------------------------------------+
| API GATEWAY ENGINE                                                       |
|  [ TLS Termination ] --> [ Rate Limiter (Redis) ] --> [ Auth Verifier ]   |
|  [ Request Router  ] --> [ Load Balancer        ] --> [ Telemetry Logger]|
+--------------------------------------------------------------------------+
          |                                  |                                  |
          | gRPC / HTTP                      | HTTP                             | gRPC
          v                                  v                                  v
+------------------+                +------------------+                +------------------+
| User Service     |                | Order Service    |                | Payment Service  |
+------------------+                +------------------+                +------------------+
```

### Core API Gateway Capabilities

| Feature Capability | Technical Mechanism | Architectural Purpose |
|---|---|---|
| **Request Routing / Proxying**| Path-based routing (`/users/*` arrow User Service) using dynamic service discovery.| Decouples internal microservice topology from client-facing URLs. |
| **TLS Termination** | Offloads TLS decryption at the edge; routes plaintext or mTLS internally. | Reduces CPU overhead on internal application microservices. |
| **Auth Offloading** | Verifies JWT signatures or OAuth tokens at gateway before forwarding requests. | Prevents unauthorized requests from consuming downstream service resources. |
| **Protocol Translation** | Converts client HTTP/JSON requests into internal high-performance gRPC/Protobuf. | Enables modern mobile clients to communicate with legacy internal RPC services. |
| **Rate Limiting & WAF** | Enforces per-IP and per-token sliding window counters using Redis. | Protects backend microservices against spike overloads and DDoS attacks. |

### Gateway Route Configuration Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `route_id` | String (UUID) | PostgreSQL / Redis | Unique route identifier. |
| `path_pattern` | String (e.g., `/api/v1/orders/**`)| Relational DB | Inbound URI path matching pattern. |
| `target_service_id`| String (`order-service`) | Service Discovery (Consul / K8s) | Internal microservice cluster destination. |
| `auth_required` | Boolean | Relational DB | Flag determining if JWT token check is enforced. |
| `rate_limit_policy`| String (`100/min`) | Relational DB | Policy key bound to rate limiter engine. |
| `timeout_ms` | Integer (`3000`) | Relational DB | Gateway timeout threshold before returning HTTP 504 Gateway Timeout. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Centralized Monolithic Gateway** | Easy management, single entry configuration point, simplified TLS certificate storage. | Single point of failure (SPOF); potential throughput bottleneck across large engineering teams. | Small to medium microservice architectures. |
| **BFF (Backend-For-Frontend) Gateways**| Custom API Gateway per client type (Mobile BFF, Web BFF) optimized for specific payloads. | Increases infrastructure code duplication across gateway instances. | Large organizations with distinct mobile, desktop, and third-party API requirements. |
| **Plugin Architecture (Kong/Envoy)**| Dynamic enablement of rate limiting, auth, and logging plugins without rebuilding gateway core. | Plugin execution order bugs can accidentally bypass security headers or auth checks. | Microservice architectures requiring customizable cross-cutting policies. |

### Key takeaway
An **API Gateway** acts as the single entry point for microservice architectures by consolidating routing, TLS termination, JWT authentication, and rate limiting at the edge. Use **asynchronous non-blocking I/O** engines (Envoy, Kong) to prevent edge bottlenecking.
