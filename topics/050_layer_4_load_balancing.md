# Layer 4 Load Balancing

> **Category:** Load Balancing

---

**Layer 4 (L4) Load Balancing** operates at the **Transport Layer** of the OSI model (TCP/UDP). L4 load balancers route network traffic based solely on packet header metadata—**Source IP, Source Port, Destination IP, Destination Port, and IP Protocol**—without decrypting or inspecting the HTTP payload contents.

### Layer 4 Packet Forwarding Topology

```
+-------------------------------------------------------------------------+
|                  LAYER 4 PACKET FORWARDING TOPOLOGY                     |
+-------------------------------------------------------------------------+

  [ Client Packet ] (Src: 203.0.113.5:54321 -> Dst: 198.51.100.1:443 [TCP])
          |
          v
  +-----------------------------------------------------------------------+
  | LAYER 4 LOAD BALANCER (AWS NLB / HAProxy TCP Mode / IPVS)             |
  | Inspects Layer 4 TCP/IP Header ONLY (No TLS Decryption / No HTTP Parsing)
  +-----------------------------------------------------------------------+
          |
          v (NAT / Direct Server Return - DSR Forwarding)
  [ Backend App Server ] (Dst modified to 10.0.1.42:443)
```

### Layer 4 Routing Techniques

| Technique | Mechanism | Performance / Overhead | Use Case |
| :--- | :--- | :--- | :--- |
| **NAT (Network Address Translation)**| Modifies destination IP/Port of incoming TCP packets to match selected target server. | Medium (LB processes both request and response paths). | Standard cloud L4 balancers |
| **Direct Server Return (DSR)** | Modifies destination MAC address; backend servers respond directly to clients. | **Ultra-High Throughput** (LB handles ingress packets only). | Streaming platforms, video ingest, massive scale CDN |
| **IP Tunneling (Encapsulation)**| Encapsulates IP packet inside outer IP header (IP-in-IP). | High throughput across different subnets. | Multi-datacenter L4 traffic routing |

### Layer 4 Pros and Cons

- **Pros**: Extremely fast processing (millions of QPS per node), low CPU consumption (no TLS decryption overhead), protocol agnostic (handles TCP, UDP, gRPC, MQTT, databases).
- **Cons**: Cannot inspect HTTP URIs, headers, or cookies; cannot perform content-based routing or smart caching.

### Key takeaway

Layer 4 load balancers route traffic at the **TCP/UDP transport layer** based on IP addresses and ports. Use L4 balancers (like AWS NLB or HAProxy TCP mode) for extreme throughput (>100k QPS per node) and non-HTTP protocols.
