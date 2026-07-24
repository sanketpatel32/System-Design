# Load Balancer Basics

> **Category:** Load Balancing

---

A **Load Balancer** is a critical architectural component positioned between clients and backend application server pools. It **distributes incoming network traffic evenly across multiple servers** to prevent single-node overload, increase system availability, and enable seamless horizontal scaling.

### Load Balancer Ingress Topology

```
+-------------------------------------------------------------------------+
|                     LOAD BALANCER INGRESS TOPOLOGY                      |
+-------------------------------------------------------------------------+

                         [ Ingress Clients ]
                                  |
                                  v
                     +--------------------------+
                     |    LOAD BALANCER TIER    |
                     |  (Hardware / Software)   |
                     +--------------------------+
                                  |
       +--------------------------+--------------------------+
       |                          |                          |
       v                          v                          v
+--------------+           +--------------+           +--------------+
| App Server 1 |           | App Server 2 |           | App Server 3 |
| (Healthy)    |           | (Healthy)    |           | (Healthy)    |
+--------------+           +--------------+           +--------------+
```

### Core Functions of a Load Balancer

| Capability | Description | Architectural Benefit |
| :--- | :--- | :--- |
| **Traffic Distribution** | Distributes requests using routing algorithms (Round Robin, Least Conn). | Eliminates CPU hot-spotting across application servers. |
| **Health Monitoring** | Continuously checks backend node health via HTTP/TCP heartbeats. | Automatically routes traffic away from failed nodes. |
| **TLS Termination** | Decrypts inbound HTTPS connections at the load balancer edge. | Offloads heavy RSA/ECDHE math from backend app servers. |
| **Horizontal Auto-Scaling**| Seamlessly registers new server instances added to scaling groups. | Enables dynamic capacity growth during traffic spikes. |
| **High Availability** | Deployed in Active-Passive or Active-Active pairs with Virtual IP (VIP). | Eliminates Load Balancer itself as a Single Point of Failure. |

### Load Balancer Deployment Topologies

1. **Hardware Load Balancers**: Proprietary physical appliances (F5 BIG-IP, Citrix ADC). High throughput, high cost.
2. **Software Load Balancers**: Open-source or cloud software (Nginx, HAProxy, Envoy, AWS ALB/NLB). Flexible, cost-effective, cloud-native.

### Key takeaway

Load Balancers eliminate single points of failure and enable horizontal scale-out by **distributing network traffic across healthy backend server pools**. Pair primary load balancers with a floating Virtual IP (VIP) or DNS Anycast for high availability.
