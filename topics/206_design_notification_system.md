# Design Notification System

> **Category:** Beginner System Design Problems

---

Design a system that sends notifications via email, SMS, push, and in-app.

### Requirements
- **Functional**: send to channels; templates; preferences; scheduled.
- **Non-functional**: at-least-once delivery; high throughput; low latency.

### Architecture
```
[Trigger] -> [Queue (Kafka/SQS)] -> [Workers] -> [Channel providers]
                                          |
                                          v
                                      [Templates]
                                      [Preferences]
                                      [Rate limit]
```

### Channels
- **Email**: SES, SendGrid.
- **SMS**: Twilio, SNS.
- **Push**: APNs (iOS), FCM (Android).
- **In-app**: WebSocket / polling.

### Templates
- Stored in DB / config.
- Variable substitution: `Hello {{name}}, your order {{order_id}} shipped.`

### User preferences
- Per-channel opt-in.
- Quiet hours (no notifications 10pm-7am).
- Digest mode (batched).

### Delivery guarantees
- **At-least-once** (queue + retries).
- **Idempotency keys** to prevent duplicates.
- **DLQ** for undeliverable.

### Fan-out
- One event → many channels.
- One event → many recipients (group notification).

### Key takeaway
Notification system = queue + workers + multi-channel providers + templates + preferences.
Async, at-least-once, idempotent. Handle preferences (opt-in, quiet hours, digest).
