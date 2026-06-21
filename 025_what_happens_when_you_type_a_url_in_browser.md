# What Happens When You Type a URL in Browser?

> **Category:** Networking Basics

---

The classic interview question. Tests whether you understand DNS, TCP, TLS, HTTP, CDNs, and
browser rendering in one go.

### The full sequence
```
1. URL parse            browser splits "https://news.example.com/path?q=1"
                        into scheme, host, port, path, query
2. HSTS check           browser may force HTTPS via built-in list
3. DNS resolution       host -> IP (multiple caches below)
4. Routing              ARP + IP routing to the server's gateway
5. TCP handshake        SYN, SYN-ACK, ACK  (1 round trip)
6. TLS handshake        ClientHello, ServerHello, key exchange, Finished (1-2 RTT)
7. HTTP request         GET /path HTTP/1.1 + headers + cookies
8. Server processing    LB -> app -> DB/cache -> response
9. HTTP response        200 OK + headers + body
10. Browser parsing     HTML -> DOM, CSS -> CSSOM, JS execution
11. Resource fetch      parallel requests for CSS, JS, images
12. Render              DOM + CSSOM -> render tree -> layout -> paint
```

### DNS resolution (cached at multiple layers)
1. **Browser cache**
2. **OS cache** (hosts file + resolver cache)
3. **Router cache**
4. **ISP recursive resolver**
5. **Root → TLD → authoritative nameservers**

Each cache hit avoids the next step. Typical DNS lookup: 20-120ms.

### Why it matters for system design
- Every hop adds **latency** — minimize them.
- **TLS** is expensive (use HTTP/2 + connection reuse).
- **CDN** moves steps 6-9 closer to the user.
- **Preconnect / DNS-prefetch** warm up connections early.

### Key takeaway
Know the 12 steps cold. In design interviews, you'll often propose changes ("add a CDN",
"use HTTP/3") and need to explain which steps they affect.
