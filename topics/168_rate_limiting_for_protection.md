# Rate Limiting for Protection

> **Category:** Reliability and Fault Tolerance

---

Rate Limiting for Protection is a defense mechanism that **caps incoming traffic volume** at system boundaries to protect downstream services from DDoS attacks, resource starvation, and noisy-neighbor tenants.

### Perimeter Rate Limiting Architecture

```
+--------+        1. HTTP Request (User IP: 1.2.3.4)        +------------------------+
| Client | -----------------------------------------------> | API Gateway            |
+--------+                                                  +------------------------+
                                                                 |
                                                                 v 2. Check Sliding Counter
                                                            +------------------------+
                                                            | Redis Counter Store    |
                                                            +------------------------+
                                                                 |
                                     +---------------------------+---------------------------+
                                     | Allowed (Count <= Limit)                              | Exceeded (Count > Limit)
                                     v                                                       v
                         +------------------------+                              +------------------------+
                         | Backend Microservice   |                              | Return 429 Too Many    |
                         +------------------------+                              | Requests + Retry-After |
                                                                                 +------------------------+
```

### Rate Limiting Algorithms Matrix

| Algorithm | How It Works | Burst Traffic Support | Memory Efficiency | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Token Bucket** | Tokens refill at fixed rate \(R\); requests consume tokens | Excellent | High | General API Gateways (Envoy, Kong) |
| **Leaky Bucket** | Requests enter queue; processed at constant rate | Smooths bursts | High | Traffic shaping for smooth writes |
| **Fixed Window Counter** | Resets count every fixed minute/hour | Poor (Edge spikes) | Maximum | Simple IP rate limiting |
| **Sliding Window Log** | Logs exact timestamp of every request | Precise | Poor (High RAM)| Strict security access endpoints |

### HTTP 429 Response Standard Headers

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1774358400

{"error": "Quota exceeded. Try again in 60 seconds."}
```

### Key takeaway

Protect internal services from traffic overload by **enforcing token bucket rate limits at the API Gateway**, returning HTTP 429 status responses with `Retry-After` headers.
