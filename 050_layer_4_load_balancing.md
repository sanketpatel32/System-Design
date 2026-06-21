# Layer 4 Load Balancing

> **Category:** Load Balancing

---

Layer 4 (L4) load balancing operates at the **transport layer** — it forwards TCP/UDP
connections based on IP and port, without looking at the application payload.

### How it works
```
Client (1.2.3.4:55000) -> LB (10.0.0.1:443)
                          LB picks backend 10.0.0.50:8443
                          NAT/DNAT rewrites destination
                          Client <-> backend (full duplex TCP)
```

### Properties
- **Fast** — no HTTP parsing, just packets.
- **Protocol-agnostic** — works for any TCP/UDP service (MySQL, Redis, gRPC, web).
- **Limited routing** — decisions based only on src/dst IP+port.
- **No application-level features** — no header rewriting, no path routing.

### Algorithms at L4
- Round robin, least connections, source-IP hash.
- **DNAT** (destination NAT) rewrites packet destination.
- **Direct Server Return (DSR)** — response bypasses LB for higher throughput.

### Common L4 LBs
- **HAProxy** (in L4 mode), **NGINX** (stream), **AWS NLB**, **IPVS** (Linux).
- **AWS Network Load Balancer** — handles millions of req/s, ultra-low latency.

### When to choose L4
- **Very high throughput / low latency** needed.
- **Non-HTTP protocols** (TCP services, databases, games).
- **TLS passthrough** (terminate on backend, not LB).
- **Simple topologies** without path/header routing.

### L4 vs L7
| | L4 | L7 |
|--|----|----|
| Layer | Transport (TCP/UDP) | Application (HTTP) |
| Sees payload | No | Yes |
| Routing | IP+port | URL, headers, cookies |
| Features | Basic | Rich (auth, cache, rewrite) |
| Speed | Faster | Slower |

### Key takeaway
Use L4 when you need raw throughput, non-HTTP protocols, or TLS passthrough. Choose L7 when you
need path/header-based routing, content-based policies, or HTTP-level features.
