# Health Checks

> **Category:** Load Balancing

---

**Health Checks** are automated periodic monitoring signals executed by load balancers, reverse proxies, and container orchestrators (Kubernetes) to verify whether backend target instances are operational and capable of processing traffic correctly.

### Health Check Probing Architecture

```
+-------------------------------------------------------------------------+
|                  HEALTH CHECK MONITORING TOPOLOGY                       |
+-------------------------------------------------------------------------+

  [ LOAD BALANCER CONTROL PLANE ]
       |
       +--( 1. GET /healthz every 5s )--> [ Server 1 ] ---> 200 OK (HEALTHY)
       |
       +--( 2. GET /healthz every 5s )--> [ Server 2 ] ---> 500 ERROR (UNHEALTHY)
                                                                  |
  [ Load Balancer automatically removes Server 2 from active target pool ]
  [ Traffic routed 100% to Server 1 until Server 2 passes 3 consecutive checks ]
```

### Health Check Probing Types Comparison

| Probe Type | Mechanism | Depth of Validation | Resource Overhead | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Ping / ICMP** | Sends ICMP Echo requests to node IP. | Network layer connectivity only. | Lowest | Verifying host server power/network |
| **TCP Handshake Probe**| Attempts 3-way TCP socket connection on target port (e.g., 8080). | Transport layer port listening check. | Low | Layer 4 balancers, non-HTTP services |
| **HTTP / HTTPS Probe** | Executes HTTP request (`GET /healthz`); expects `200 OK`. | Application layer status check. | Medium | Standard web APIs & microservices |
| **Deep Application Probe**| Validates application DB connections, disk space, and Redis status. | Full end-to-end component readiness. | High (Must be rate-limited) | Mission-critical microservice health |

### Health Check Threshold Parameters

- **Interval**: Frequency of health check execution (e.g., every 5 or 10 seconds).
- **Timeout**: Maximum time allowed for response before marking probe failed (e.g., 2 seconds).
- **Unhealthy Threshold**: Number of consecutive failures before removing node from active target group (e.g., 2 or 3 failures).
- **Healthy Threshold**: Number of consecutive successful responses before re-admitting recovered node (e.g., 3 to 5 successes).

### Key takeaway

Implement application-layer **HTTP health checks (`GET /healthz`)** on backend servers. Configure load balancers to automatically remove unhealthy nodes after consecutive failures and re-admit recovered nodes safely.
