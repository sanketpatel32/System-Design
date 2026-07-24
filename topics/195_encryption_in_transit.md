# Encryption in Transit
> **Category:** Security

---

### Overview
**Encryption in Transit** ensures that data moved across network interfaces—between clients and edge servers, or between internal microservices—is encrypted to prevent eavesdropping, packet sniffing, and man-in-the-middle (MitM) interception.

### End-to-End Encryption vs TLS Termination

```
Client             Edge Load Balancer                Backend Microservice A          Backend Microservice B
  |                        |                                  |                               |
  | === HTTPS (TLS 1.3) => |                                  |                               |
  |                        | --- TLS Termination (Plaintext) ->|                               |  [Insecure Network]
  |                        |                                  |                               |
  |                        | === Zero Trust mTLS Encryption ================================> |  [Secure Network]
```

### Encryption Protocols across Layers

| Network Layer | Protocol | Use Case |
|---|---|---|
| **Application Layer** | **TLS 1.3 / HTTPS** | Web web apps, REST APIs, gRPC endpoints |
| **Transport Layer** | **QUIC (HTTP/3)** | Low-latency mobile & streaming encryption |
| **Network Layer** | **IPsec / WireGuard** | Site-to-site VPNs, inter-cloud VPC peering |
| **Internal Microservices** | **mTLS (Mutual TLS)** | Service mesh (Istio, Linkerd) pod-to-pod security |

### Mutual TLS (mTLS) Architecture
In standard TLS, only the client validates the server's certificate. In **mTLS**, both parties validate each other's certificates:

| Step | Action |
|---|---|
| **1. Server Cert Validation** | Client verifies server certificate against CA trust store. |
| **2. Client Cert Request** | Server requests client certificate. |
| **3. Client Cert Validation** | Server verifies client certificate and validates client identity/SAN. |
| **4. Encrypted Tunnel** | Established only if both sides possess valid, trusted certificates. |

### Performance & Operational Considerations
- **Hardware Offloading**: Use TLS termination proxies (Envoy, NGINX) to offload cryptographic math.
- **Automated Cert Lifecycle**: Use **ACME protocol** (Let's Encrypt, Cert-Manager) for short-lived cert auto-renewal.

### Key takeaway
**Encryption in transit** mandates **TLS 1.3** for public ingress traffic and **mTLS** (via Service Mesh) for zero-trust internal microservice communication.
