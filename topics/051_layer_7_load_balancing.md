# Layer 7 Load Balancing

> **Category:** Load Balancing

---

**Layer 7 (L7) Load Balancing** operates at the **Application Layer** of the OSI model. Unlike Layer 4 load balancers that route raw TCP packets, an L7 load balancer decrypts TLS, parses HTTP/HTTPS requests, and makes intelligent routing decisions based on **URIs, HTTP Headers, Cookies, Query Parameters, and Payload Contents**.

### Layer 7 Content-Based Routing Topology

```
+-------------------------------------------------------------------------+
|                LAYER 7 CONTENT-BASED ROUTING TOPOLOGY                   |
+-------------------------------------------------------------------------+

  [ Client HTTP Request ] (GET /v1/images/cat.png Cookie: auth=token)
          |
          v
  +-----------------------------------------------------------------------+
  | LAYER 7 LOAD BALANCER (AWS ALB / Nginx / Envoy)                       |
  | Decrypts TLS -> Inspects URI Path & HTTP Headers -> Evaluates Rules  |
  +-----------------------------------------------------------------------+
          |                                       |
          | (Route /v1/images/*)                  | (Route /v1/orders/*)
          v                                       v
  [ Static Media Server Pool ]            [ Order Service Cluster ]
```

### Layer 4 vs. Layer 7 Load Balancing Comparison

| Dimension | Layer 4 (Transport Layer) | Layer 7 (Application Layer) |
| :--- | :--- | :--- |
| **OSI Layer** | Layer 4 (TCP / UDP) | Layer 7 (HTTP / HTTPS / gRPC / WebSockets) |
| **Routing Criteria** | Source/Destination IP and Port | URI Path, HTTP Headers, Cookies, Query Params |
| **TLS Decryption** | Pass-through (No decryption) | Decrypts TLS at Load Balancer (TLS Termination) |
| **Throughput & CPU** | Extremely high throughput, low CPU | Lower throughput per node, higher CPU overhead |
| **Smart Routing** | No (Blind packet forwarding) | Yes (Content-based routing, A/B testing, Sticky Sessions) |
| **Software Examples**| AWS NLB, IPVS, HAProxy (TCP mode) | AWS ALB, Nginx, Envoy, Traefik |

### Layer 7 Routing Capabilities

1. **Path-Based Routing**: Route `/api/users` to User Service and `/api/payments` to Payment Service.
2. **Host-Based Routing**: Route `mobile.example.com` and `api.example.com` to different target groups.
3. **Header & Cookie Inspection**: Enforce **sticky sessions** via session cookies or route internal beta users (`Header: X-Beta=true`) to canary server deployments.

### Key takeaway

Layer 7 load balancers make **content-aware routing decisions** based on HTTP paths, headers, and cookies. Use L7 balancers (AWS ALB, Nginx, Envoy) for microservice path routing, TLS termination, and sticky session management.
