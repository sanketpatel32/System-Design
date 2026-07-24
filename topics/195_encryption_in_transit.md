# Encryption in Transit
> **Category:** Security

---

### Overview
**Encryption in Transit** (also known as Encryption in Motion) ensures that data moving across network boundaries—between clients and servers, or internally between microservices—is cryptographically protected against eavesdropping, interception, and tampering.

Modern cloud architectures enforce **TLS 1.3** for external edge traffic and **Mutual TLS (mTLS)** or overlay mesh encryption (e.g., WireGuard / IPsec) for internal microservice communication.

### End-to-End Encryption in Transit Architecture

```
+------------------+                    PUBLIC INTERNET                     +------------------+
| Client Web /     | =====================================================> | Edge API Gateway |
| Mobile App       |           1. HTTPS / TLS 1.3 Encryption               | (TLS Termination)|
+------------------+                                                        +------------------+
                                                                                     |
                                        INTERNAL SERVICE MESH (mTLS)                 |
                     +---------------------------------------------------------------+
                     |
                     v
+------------------------------------+     2. mTLS (SPIFFE/SPIRE ID)     +------------------------------------+
| Microservice A (Envoy Sidecar)     | ==============================> | Microservice B (Envoy Sidecar)     |
+------------------------------------+                                 +------------------------------------+
```

### Encryption Protocols across OSI Layers

| OSI Layer | Protocol | Implementation | Best Used For |
|---|---|---|---|
| **Layer 7 (Application)** | HTTPS, WSS, gRPC over TLS | Application endpoints, API Gateways, WebSockets. | Public Internet edge communication. |
| **Layer 4 (Transport)** | TLS 1.3, mTLS | Envoy Proxy Sidecars, SPIFFE/SPIRE certificate identities. | Internal zero-trust microservice meshes. |
| **Layer 3 (Network)** | WireGuard, IPsec | Cloud VPC Peering, Cross-Region Site-to-Site VPNs. | Datacenter-to-Datacenter network tunnels. |

### Service Mesh mTLS Policy Interface Specifications

| Endpoint / CRD Config | Resource Type | Configuration Payload | Purpose |
|---|---|---|---|
| `PeerAuthentication` | Kubernetes CRD | `spec: {mtls: {mode: STRICT}}` | Enforces mandatory mTLS encryption for all pods in namespace. |
| `SPIFFE ID Verification` | X.509 SVID | `spiffe://cluster.local/ns/prod/sa/payment` | Authenticates workload identity during TLS handshake. |

### Certificate Authority & Workload Identity Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `spiffe_id` | String | SPIRE Server / Memory | Unique URI identity representing the microservice workload. |
| `x509_svid` | X.509 Certificate | Envoy In-Memory | Short-lived workload certificate (TTL: 1 hour - 24 hours). |
| `private_key` | RSA / ECDSA Key | In-Memory (Memfd) | Workload private key used to negotiate mTLS handshake. |
| `trust_bundle` | CA Certificate List | Memory | Root CA certificates used to validate peer workloads. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Mutual TLS (mTLS) via Sidecar** | Transparent zero-trust security; strong cryptographic service identity without app code changes. | CPU and latency overhead on microservice calls; complex certificate lifecycle rotation. | Microservice architectures handling sensitive regulated data. |
| **VPC-Level Network Encryption (IPsec)**| Zero overhead on individual microservices; encrypts all underlying network packets. | Lacks fine-grained application service identity and authorization controls. | Cross-region cloud interconnects and hybrid cloud links. |
| **TLS Termination at Edge Only** | Simplifies internal microservice networking; minimal latency inside datacenter. | Unencrypted internal network traffic vulnerable to lateral intruder movement. | Monolithic architectures and non-sensitive internal environments. |

### Key takeaway
**Encryption in Transit** prevents packet sniffing and Man-in-the-Middle attacks. Safeguard external user traffic using TLS 1.3 and implement sidecar-based mTLS (SPIFFE/SPIRE) inside microservice networks to establish Zero-Trust security.
