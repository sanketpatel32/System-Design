# Design QR Code Generator

> **Category:** Beginner System Design Problems

---

Design a service that generates QR codes from input (URL, text, vCard).

### Requirements
- **Functional**: input text/URL → QR image; download PNG/SVG; analytics.
- **Non-functional**: low-latency generation; high availability.

### Architecture
```
[Client] -> [API] -> [QR library (qrcode)] -> [S3 (cache)] -> return
                                                    |
                                                    v
                                              [CDN]
```

### QR generation
- Library: `qrcode` (Python), `zxing` (Java), `go-qrcode`.
- CPU-bound (encoding + drawing).
- For given input, output is **deterministic** → cacheable.

### Caching
- Hash input → key.
- Cache generated image in S3/CDN.
- Same input → instant response.

### APIs
- `POST /qr {data, size, format}` → image or URL.
- `GET /qr/{id}` → cached image.

### Customization
- Logo overlay, color, error correction level.
- Each variant = different cache entry.

### Rate limiting
- Per IP/user to prevent abuse (QR generation is CPU-bound).

### Scaling
- Stateless API → clone freely.
- CPU-bound → autoscale on CPU.
- Cache aggressively (deterministic output).

### Key takeaway
QR generator = CPU-bound library + cache by input hash + CDN. Since output is deterministic,
cache hit rate can approach 100% after warm-up. Stateless, scales by cloning.
