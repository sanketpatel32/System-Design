# Webhooks

> **Category:** API Design

---

A **Webhook** (also called an HTTP push API or reverse API) is an **asynchronous event-driven communication mechanism** where a server automatically transmits an HTTP `POST` payload to a client's configured URL endpoint whenever a specific state change or event occurs.

### Event-Driven Webhook Delivery Topology

```
+-------------------------------------------------------------------------+
|                  EVENT-DRIVEN WEBHOOK DELIVERY FLOW                     |
+-------------------------------------------------------------------------+

  [ Provider Platform (e.g., Stripe) ]
           |
           | 1. Payment Succeeded Event Fired
           v
  +-----------------------------------------------------------------------+
  | ASYNCHRONOUS WEBHOOK DISPATCHER ENGINE                                |
  | Generates HMAC Signature -> Queues in Kafka/SQS -> Retries on Failure |
  +-----------------------------------------------------------------------+
           |
           | 2. HTTP POST https://merchant.com/webhooks/stripe
           |    Headers: X-Stripe-Signature: t=167...,v1=5f...
           v
  [ Consumer Server (Merchant) ] --( Return 200 OK )--> [ Dispatcher ]
```

### Webhooks vs. HTTP Polling Comparison

| Dimension | Webhooks (Event-Driven Push) | HTTP Polling (Pull) |
| :--- | :--- | :--- |
| **Communication Style**| Real-time push (Provider calls Consumer). | Periodic pull (Consumer polls Provider). |
| **Network Traffic** | Zero overhead; traffic occurs only when events fire. | High overhead; 95%+ of polls return no change. |
| **Latency** | Instantaneous real-time notification. | Delayed by polling interval (e.g., 5-60 sec). |
| **Infrastructure Setup**| Consumer must expose public HTTPS receiver URL. | Consumer executes outgoing standard HTTP GET requests. |
| **Failure Recovery** | Requires retry queue with exponential backoff. | Simple client retry on next polling loop. |

### Webhook Security & Reliability Guarantees

1. **HMAC Signature Verification**: Providers include cryptographic signatures (`X-Hub-Signature-256`) generated using a shared secret key, allowing receivers to verify payload integrity and origin.
2. **At-Least-Once Delivery & Retries**: Webhook dispatchers retry failed deliveries (non-2xx responses) using exponential backoff over 24-48 hours.
3. **Consumer Idempotency**: Because retries cause duplicate webhook deliveries, receivers must track delivered event IDs (`evt_123`) to prevent duplicate processing.

### Key takeaway

Webhooks provide **event-driven, real-time push notifications** over HTTP POST. Always secure webhooks using **HMAC signature verification**, handle **duplicate deliveries idempotently**, and process incoming payloads asynchronously via message queues.
