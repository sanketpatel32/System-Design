# Webhooks

> **Category:** API Design

---

A webhook = **an HTTP POST your server sends to a client when something happens**. It's the
"inverse" of an API — instead of the client polling, the server pushes.

### Pattern
```
1. Client registers a URL: POST /webhooks {url: "https://client.com/hook", events: ["order.*"]}
2. Something happens in your system.
3. You POST an event to the registered URL:
     POST https://client.com/hook
     {event: "order.created", data: {...}}
4. Client returns 200 OK to acknowledge.
```

### Use cases
- **Payment providers** (Stripe, Razorpay) notify you when a charge succeeds.
- **GitHub** notifies on push, PR, issue.
- **CI/CD** notifies on build complete.
- **WhatsApp/SMS** delivery receipts.

### Delivery guarantees
- **At-least-once** — you'll likely deliver duplicates; clients must be idempotent.
- **Retries with backoff** — retry on 5xx or timeout, give up after N attempts.
- **Dead-letter** — store undeliverable events for inspection.

### Security
- **HTTPS mandatory** for the webhook URL.
- **Sign the payload** (HMAC) so the client can verify it really came from you:
  ```
  X-Signature: hex(hmac_sha256(payload, secret))
  ```
- **Timestamp** to prevent replay attacks.
- **IP allowlist** your source IPs (optionally).

### Idempotency
- Each event has a unique **event_id**.
- Clients track seen IDs and skip duplicates.

### Operational concerns
- **Slow clients** can back up your queue — async, with timeouts.
- **Circuit breaker** if a client keeps failing.
- **Webhook logs** for debugging ("did you send it?").

### Key takeaway
Webhooks are how systems push events to each other without polling. Design for **at-least-once
delivery + signatures + idempotent receivers**. Always include an event_id so clients can
deduplicate.
