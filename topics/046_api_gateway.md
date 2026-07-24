# API Gateway

> **Category:** API Design

---

An **API Gateway** is an architectural proxy component that acts as the **single entry point** for all external client requests entering a microservices ecosystem. It encapsulates internal service boundaries, routes traffic, enforces security policies, and offloads cross-cutting concerns from application backend services.

### Centralized API Gateway Pattern

```
+-------------------------------------------------------------------------+
|                       API GATEWAY ARCHITECTURE                          |
+-------------------------------------------------------------------------+

  [ Web App ]    [ Mobile App ]    [ 3rd Party Clients ]
       |               |                    |
       +---------------+--------------------+
                       |
                       v
  +-----------------------------------------------------------------------+
  | API GATEWAY TIER (Kong / Envoy / AWS API Gateway)                     |
  | - TLS Termination           - Rate Limiting & Auth Validation        |
  | - Dynamic Service Routing   - Request/Response Transformation        |
  | - Observability & Tracing   - Circuit Breaking & Load Balancing      |
  +-----------------------------------------------------------------------+
                       |
       +---------------+---------------+
       |               |               |
       v               v               v
  [ User Svc ]    [ Order Svc ]   [ Payment Svc ]
```

### Core API Gateway Capabilities

| Feature Capability | Description | System Benefit |
| :--- | :--- | :--- |
| **Request Routing** | Routes incoming URI paths (`/v1/orders`) to target microservice clusters. | Hides internal network topology from clients. |
| **TLS Termination** | Decrypts inbound HTTPS TLS traffic at Gateway edge. | Reduces CPU encryption overhead on internal backend nodes. |
| **Authentication & Auth**| Validates JWT signatures and API Keys before forwarding requests. | Offloads repetitive security code from individual microservices. |
| **Rate Limiting** | Enforces per-IP and per-user request quotas. | Prevents DDoS attacks and resource exhaustion. |
| **Request Aggregation** | Combines data from multiple internal microservices into 1 client response.| Eliminates client-side $N+1$ HTTP fetch waterfalls. |

### API Gateway vs. Load Balancer vs. Reverse Proxy

- **Reverse Proxy (Nginx)**: Basic Layer 4/7 proxy handling SSL termination and simple static routing.
- **Load Balancer (ALB)**: Distributes traffic evenly across server pools based on network metrics.
- **API Gateway (Kong/Envoy)**: Smart Layer 7 reverse proxy tailored for APIs, offering auth, rate limiting, analytics, payload transformation, and service discovery.

### Key takeaway

Deploy an **API Gateway** as the single reverse-proxy ingress point for microservice architectures. Offload cross-cutting concerns—**TLS termination, JWT authentication, rate limiting, and request routing**—to the Gateway tier.
