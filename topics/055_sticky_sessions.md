# Sticky Sessions

> **Category:** Load Balancing

---

**Sticky Sessions** (also known as Session Affinity) is a load balancing routing mechanism that binds a specific client's requests to the **exact same backend server node** for the entire duration of an active user session.

### Sticky Session Cookie Routing Topology

```
+-------------------------------------------------------------------------+
|                  STICKY SESSION COOKIE ROUTING                          |
+-------------------------------------------------------------------------+

  [ Client ] --( Request 1: No Cookie )--> [ Layer 7 Load Balancer ]
                                                     |
                                                     v (Selects Server 1)
  [ Client ] <-- ( Response 1 + Set-Cookie: SERVERID=node_1 )--+
  
  [ Client ] --( Request 2: Cookie: SERVERID=node_1 )--> [ Load Balancer ]
                                                               |
                                                               v (Routes to Server 1)
                                                       [ Server 1 (Local RAM State) ]
```

### Sticky Session Mechanisms Comparison

| Mechanism | Implementation Details | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Cookie-Based (LB Insert)**| Load balancer injects a tracking cookie (e.g., `AWSALB=node1`). | Transparent to backend app code; highly reliable. | Requires Layer 7 HTTP load balancer. |
| **Cookie-Based (App Injected)**| Backend application sets custom session cookie (`JSESSIONID`). | Direct control by application logic. | App coupled to load balancer cookie format. |
| **IP Hash (Source IP Affinity)**| Hash client IP address ($Hash(IP) \bmod N$) to pick server node. | Works at Layer 4 (TCP) without cookie parsing. | Clients behind NAT share 1 IP, causing server hotspotting. |

### Architectural Pros and Cons

- **Pros**: Enables stateful applications (storing user session data in server local RAM memory) without requiring an external centralized session cache.
- **Cons**: Impairs horizontal auto-scaling elasticity; causes uneven load distribution (hotspotting); if a server crashes, all users pinned to that node lose active session state.

### Modern Alternative: Centralized Distributed Session Store
Rather than using sticky sessions, modern cloud architectures store user session state in an in-memory centralized database (**Redis or Memcached**), allowing application servers to remain completely **stateless**.

### Key takeaway

Sticky sessions route a client's requests to the same backend server using cookies or IP hashing. Avoid sticky sessions in modern cloud apps by offloading session state to a **centralized Redis cluster** to keep application servers stateless.
