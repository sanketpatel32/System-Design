# Reverse Proxy

> **Category:** Load Balancing

---

A **Reverse Proxy** is an intermediate server placed in front of one or more backend web servers. Unlike a forward proxy (which shields client IPs when accessing the internet), a reverse proxy **shields backend servers by intercepting and handling incoming client requests** before forwarding them to internal application nodes.

### Forward Proxy vs. Reverse Proxy Topology

```
+-------------------------------------------------------------------------+
|                  FORWARD PROXY vs. REVERSE PROXY                        |
+-------------------------------------------------------------------------+

  FORWARD PROXY (Protects Clients):
  [ Client A ] --+
  [ Client B ] --+--> [ Forward Proxy ] ----> [ Public Internet ]

  REVERSE PROXY (Protects Servers):
  [ Public Internet Clients ] ----> [ Reverse Proxy (Nginx) ]
                                            |
                         +------------------+------------------+
                         v                                     v
               [ Internal App Server 1 ]             [ Internal App Server 2 ]
```

### Technical Capability Breakdown

| Capability | Technical Mechanism | Benefit |
| :--- | :--- | :--- |
| **Security & Anonymity** | Masks internal IP addresses and server topology. | Prevents direct external attacks against backend servers. |
| **TLS / SSL Termination**| Offloads TLS decryption at proxy edge. | Reduces CPU cryptographic overhead on backend servers. |
| **Static Asset Caching**| Caches static assets (images, CSS, JS) in memory/disk. | Diverts static traffic away from application servers. |
| **Response Compression**| Compresses HTTP responses using Gzip / Brotli. | Saves egress bandwidth and speeds up client load times. |
| **Security Filtering** | Implements Web Application Firewall (WAF) rules. | Blocks SQL Injection, XSS, and bot traffic at edge. |

### Popular Reverse Proxy Software

- **Nginx**: Extremely fast event-driven C proxy, high concurrent connection handling.
- **HAProxy**: High-performance TCP/HTTP load balancer and proxy engine.
- **Envoy**: Modern cloud-native proxy designed for microservice service meshes (Istio).

### Key takeaway

Deploy a **Reverse Proxy** (like Nginx or HAProxy) at the perimeter edge to shield backend servers, handle TLS termination, serve static cached assets, and enforce WAF security policies.
