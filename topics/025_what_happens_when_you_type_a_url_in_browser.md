# What Happens When You Type a URL in Browser?

> **Category:** Networking Basics

---

The classic interview question **"What happens when you type `https://www.example.com` into a browser and press Enter?"** tests end-to-end knowledge across DNS resolution, transport layer handshakes, TLS encryption, HTTP protocol processing, load balancing, server execution, and DOM rendering.

### End-to-End Request Execution Timeline

```
+-------------------------------------------------------------------------+
|                  END-TO-END URL REQUEST EXECUTION                       |
+-------------------------------------------------------------------------+

  [ Browser ] --( 1. DNS Lookup )--> [ DNS Resolver / Root / TLD ]
       |                                     | (Returns IP 93.184.216.34)
       +<------------------------------------+
       |
       |--( 2. TCP 3-Way Handshake [SYN, SYN-ACK, ACK] )--> [ Load Balancer ]
       |--( 3. TLS 1.3 Handshake [ClientHello, ServerHello] )
       |
       |--( 4. HTTP GET / Request )------------------------> [ Web Server ]
       |                                                         |
       |<--( 5. HTTP 200 OK Response + HTML Payload )------------+
       |
  [ 6. DOM Tree Construction + CSSOM + JS Execution + Critical Rendering Path ]
```

### Complete Execution Phase Breakdown

| Execution Step | Protocols & Components | Detailed Action |
| :--- | :--- | :--- |
| **1. URL Parsing & HSTS** | Browser Engine, HSTS Preload | Browser parses protocol (`https`), hostname (`www.example.com`), port (`443`), and checks HSTS (HTTP Strict Transport Security) list to enforce HTTPS. |
| **2. DNS Resolution** | OS Cache, Local Resolver, Root, TLD, Authoritative DNS | Browser checks caches (Browser -> OS -> Router -> ISP). If missing, recursively queries Root (`.`), TLD (`.com`), and Authoritative DNS to resolve IP (`93.184.216.34`). |
| **3. ARP Resolution** | Address Resolution Protocol (ARP) | OS maps target IP to physical MAC address of the default gateway router via local ARP table lookup or ARP broadcast. |
| **4. TCP Handshake** | TCP Transport Layer | Client sends `SYN`, Server returns `SYN-ACK`, Client sends `ACK` (establishing 3-way TCP socket connection). |
| **5. TLS 1.3 Handshake** | TLS/SSL, Public Key Cryptography | Client sends `ClientHello` (cipher suites, key share). Server returns `ServerHello` + Certificate. Symmetric session keys negotiated via ECDHE. |
| **6. HTTP Request & Server Processing**| HTTP/2 or HTTP/3 (QUIC) | Client sends `GET / HTTP/2`. Reverse proxy / Load balancer routes request to application server. App queries DB/cache and builds HTML response. |
| **7. DOM Rendering Path**| HTML Parser, CSSOM, JS V8 Engine, Compositor | Browser parses HTML to construct DOM tree, parses CSS for CSSOM tree, executes JS, calculates Layout, and paints pixels to GPU framebuffer. |

### Failure Modes & Edge Cases

- **DNS Failure**: Returns `NXDOMAIN` error or connection times out.
- **TCP Connection Reset**: Server port closed or firewall drops packet (`RST` packet returned).
- **TLS Certificate Mismatch**: Expired certificate or hostname mismatch throws security warning.
- **5xx Gateway Timeout**: Reverse proxy cannot reach upstream application backend within timeout limit.

### Key takeaway

Understanding the URL lifecycle requires tracing requests across **DNS resolution**, **TCP 3-way handshakes**, **TLS key negotiation**, **HTTP/2 multiplexing**, **Load Balancer routing**, and **browser Critical Rendering Path construction**.
