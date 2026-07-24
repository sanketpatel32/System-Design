# Design QR Code Generator
> **Category:** Beginner System Design Problems

---

### Overview
A **QR Code Generator System** converts URLs, text strings, or contact data into 2D matrix barcode images (PNG/SVG) and serves them with minimal latency, supporting customization (colors, logos) and click analytics.

### Architecture Topology

```
+--------+     1. POST /api/v1/qr/generate     +-------------------+
| Client | -----------------------------------> | API Gateway       |
+--------+                                      +-------------------+
    ^                                                     |
    |                                                     v 2. Check Cache
    |                                           +-------------------+       Hit       +---------------+
    |                                           | Redis Image Cache | --------------> | Fast Image    |
    |                                           +-------------------+                 | CDN Delivery  |
    |                                                     | Miss                      +---------------+
    |                                                     v
    |                                           +-------------------+       Save      +---------------+
    | <--- 4. Image Binary / S3 CDN Link ------ | QR Generator Engine| -------------> | AWS S3 Bucket |
    |                                           +-------------------+                 +---------------+
```

### Core API Interface

| Endpoint | Method | Parameters | Response |
|---|---|---|---|
| `/api/v1/qr/generate` | `POST` | `{"data": "https://...", "size": 300, "format": "png", "error_correction": "M"}` | `200 OK` -> Image binary or CDN URL |
| `/api/v1/qr/dynamic` | `POST` | `{"target_url": "https://..."}` | `201 Created` -> Redirect QR code mapping |

### Error Correction Level Matrix

| Level | Recovery Capacity | Trade-off | Use Case |
|---|---|---|---|
| **L (Low)** | ~7% damage restored | Smallest matrix grid size | Low-density screen display |
| **M (Medium)** | ~15% damage restored | Standard balance | Standard URLs on posters |
| **Q (Quartile)**| ~25% damage restored | Higher grid density | Outdoor print media |
| **H (High)** | ~30% damage restored | Densest grid; allows embedded logos | Branding with logo overlay in center |

### Static vs Dynamic QR Codes
- **Static QR Code**: Direct payload (URL/text) embedded directly into the matrix. Immutable once printed.
- **Dynamic QR Code**: Matrix contains a short URL proxy (e.g., `https://qr.link/a9X2`). Server redirects to dynamic destination URL, allowing real-time target changes and click analytics tracking.

### Key takeaway
Design QR Code generators using **Dynamic Short URLs** to allow post-print target modification and analytics tracking. Offload rendering CPU overhead by caching generated matrix images in **Redis** and **CDN**.
