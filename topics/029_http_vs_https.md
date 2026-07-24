# HTTP vs HTTPS

> **Category:** Networking Basics

---

**HTTP (Hypertext Transfer Protocol)** is an unencrypted Layer 7 application protocol. **HTTPS (HTTP Secure)** encapsulates HTTP requests inside an encrypted **TLS (Transport Layer Security)** wrapper, guaranteeing **Encryption, Data Integrity, and Server Authentication**.

### TLS 1.3 Handshake & Encryption Wrapper

```
+-------------------------------------------------------------------------+
|                      TLS 1.3 ENCRYPTION HANDSHAKE                       |
+-------------------------------------------------------------------------+

  Client                                       Server
    |                                            |
    |---- 1. ClientHello (Cipher Specs, ECDHE) ->|
    |<--- 2. ServerHello + Certificate + Key ----|  (1 RTT Handshake)
    |
  [ Client Validates Cert Root CA ]
  [ Both Derive Symmetric Session Key ]
    |                                            |
    |==== 3. Encrypted HTTP Request (AES-GCM) ==>|
    |<=== 4. Encrypted HTTP Response ===========|
```

### Feature & Protocol Comparison

| Dimension | HTTP (Cleartext) | HTTPS (TLS Encrypted) |
| :--- | :--- | :--- |
| **Protocol Layer** | Layer 7 Application Protocol | Layer 7 HTTP wrapped over TLS Layer 6/5 |
| **Default Port** | Port `80` | Port `443` |
| **Security Guarantees** | None (Vulnerable to Man-in-the-Middle) | **Encryption**, **Authentication**, **Integrity** |
| **Handshake Overhead** | 1 RTT (TCP 3-Way Handshake) | 2 RTT (TCP + TLS 1.3 Handshake = 1 RTT overall) |
| **Certificate Cost** | None | SSL/TLS Certificate required (Let's Encrypt / CA) |
| **SEO & Browser Impact**| Marked "Not Secure", penalized by Google | Mandatory standard, higher search ranking |

### Three Core Security Guarantees of HTTPS

1. **Confidentiality (Encryption)**: Asymmetric cryptography (ECDSA/RSA) negotiates a symmetric session key (AES-256-GCM) so eavesdroppers cannot read payload traffic.
2. **Integrity (Tamper Prevention)**: Cryptographic hash HMAC signatures verify data has not been modified or injected during transit.
3. **Authentication (Identity Verification)**: Public Key Infrastructure (PKI) digital certificates issued by trusted Certificate Authorities (CAs) verify server identity.

### Key takeaway

Always enforce **HTTPS** across production web applications. Use **TLS 1.3** for 1-RTT connection setup, configure **HSTS headers** to force encrypted traffic, and automate certificate renewals via Let's Encrypt.
