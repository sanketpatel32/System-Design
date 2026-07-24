# Design QR Code Generator
> **Category:** Beginner System Design Problems

---

### Overview
A **QR Code Generator** system converts input payloads (URLs, vCards, text strings, Wi-Fi credentials) into 2D matrix barcode images (PNG, SVG, WebP) that can be scanned by smartphones and optical cameras.

The system supports **Static QR Codes** (payload baked permanently into the image matrix) and **Dynamic QR Codes** (image encodes a shortened redirect link, allowing the destination payload to be modified post-creation without re-printing).

### System Architecture & Dynamic QR Flow

```
+--------------------------------------------------------------------------+
| USER BROWSER / CAMERA SCAN                                               |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Scans Dynamic QR Image
+--------------------------------------------------------------------------+
| CDN EDGE CACHE (Serves Cached QR Image PNG / Handles Redirect)           |
+--------------------------------------------------------------------------+
                                     |
                                     v 2. CDN Miss -> HTTP Request
+--------------------------------------------------------------------------+
| API GATEWAY & QR RENDERING ENGINE                                        |
|  [ Content Encoder ] --> [ RS Error Correction ] --> [ PNG Renderer ]    |
+--------------------------------------------------------------------------+
                                     |
                                     v 3. Write Redirect Mapping & Image Blob
+--------------------------------------------------------------------------+
| REDIS CACHE & S3 OBJECT STORAGE (Stores Redirect Rules & QR PNG Blobs)  |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Reed-Solomon Error Correction:** Adds redundant data bits allowing QR codes to remain scannable even if up to 30% of the image surface is damaged or covered by a central logo.
   - **Level L:** 7% error recovery.
   - **Level M:** 15% error recovery.
   - **Level Q:** 25% error recovery.
   - **Level H (High):** 30% error recovery (Required when embedding corporate logos).
2. **Dynamic QR Redirection Engine:** Encodes a shortened domain URL (e.g., `https://qr.link/a9X1`) in the image matrix. Scanning routes to backend redirect service which resolves destination dynamically.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/qr/generate` | POST | `{"type": "DYNAMIC", "target_url": "https://example.com", "logo_url": "s3://logo.png", "ecc_level": "H", "format": "png"}` | `{"qr_id": "qr_991", "image_url": "https://cdn.qr.com/qr_991.png", "redirect_key": "a9X1"}` |
| `/api/v1/qr/{id}` | PUT | `{"target_url": "https://new-destination.com"}` | `{"status": "UPDATED", "target_url": "https://new-destination.com"}` |

### Data Model & Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `qr_id` | UUID | PostgreSQL | Unique Primary Key for QR metadata record. |
| `qr_type` | Enum | Relational DB | `STATIC` vs `DYNAMIC`. |
| `redirect_key` | String (Indexed) | Relational DB / Redis | Short link key encoded in dynamic QR image matrix. |
| `target_payload` | Text | Relational DB | Destination URL, text string, or vCard payload. |
| `image_s3_url` | String | Relational DB | S3 object location of generated PNG/SVG image. |
| `scan_count` | Counter | Redis / ClickHouse | Tracking counter for dynamic QR scan analytics. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Dynamic QR Codes** | Destination payload can be changed anytime after printing; enables scan analytics. | Requires redirect backend uptime; if service goes down, printed QR code breaks. | Marketing campaigns, restaurant menus, product packaging. |
| **Static QR Codes** | Never expires; zero backend redirection dependency or network latency. | Payload cannot be changed once printed; no scan analytics tracking. | Wi-Fi setup codes, permanent physical product serial numbers. |
| **Edge CDN Image Caching** | Serves pre-rendered QR image PNG files directly from CDN edge POPs under 10ms. | Dynamic QR customization (colors, logos) requires rendering engine computation on cache miss. | High-volume consumer QR code generation platforms. |

### Key takeaway
**QR Code Generators** use **Reed-Solomon Error Correction** (Level H) to allow logo overlays without breaking readability. Use **Dynamic QR Codes** to decouple physical printed images from backend target destinations, enabling post-print updates and scan analytics.
