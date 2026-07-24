# Design Notification System
> **Category:** Beginner System Design Problems

---

### Overview
A **Notification System** dispatches real-time alerts across multiple communication channels—Mobile Push (APNs/FCM), SMS (Twilio), Email (SendGrid), and In-App WebSockets—at high scale with guaranteed delivery, deduplication, and user preference tracking.

### System Architecture & Queue Topology

```
+--------------------+
| Publisher Services |
+--------------------+
          |
          v POST /v1/notifications
+--------------------+     1. Publish      +--------------------+     2. Consume     +--------------------+
| Notification API   | ------------------> | Kafka / RabbitMQ   | -----------------> | Worker Pool        |
+--------------------+                     | Message Bus        |                    | (Priority Workers) |
          |                                +--------------------+                    +--------------------+
          v Rate Limit / Preference Lookup                                                     |
+--------------------+                                                                         | 3. Dispatch
| User Settings DB   |                                                                         v
+--------------------+                                                       +------------------------------------+
                                                                             | APNs | FCM | Twilio | SendGrid     |
                                                                             +------------------------------------+
```

### Notification Data Schema (PostgreSQL / DynamoDB)
```json
{
  "notification_id": "notif_8819a",
  "user_id": "usr_102",
  "channel": "PUSH",
  "priority": "HIGH",
  "template_id": "order_dispatched",
  "template_data": { "order_id": "ord_9981", "eta": "15 mins" },
  "status": "DELIVERED",
  "retry_count": 0,
  "created_at": 1700000000
}
```

### Critical Architectural Strategies

| Strategy | Technical Mechanism |
|---|---|
| **Deduplication** | Compute hash `SHA256(user_id + template_id + event_id)`; check key in Redis with 5-min TTL before dispatching. |
| **User Preferences** | Query User Preference DB before publishing to skip channels explicitly disabled by user. |
| **Rate Limiting / Quiet Hours**| Defer low-priority notifications scheduled during user-specified quiet hours (e.g., 10 PM - 7 AM). |
| **At-Least-Once Delivery** | Workers ack Kafka messages only after receiving successful HTTP `200` response from provider (FCM/Twilio). |

### Key takeaway
Decouple notification triggers from delivery via **distributed message queues (Kafka)**. Enforce user settings, channel rate limits, and idempotent **Redis deduplication keys** before invoking third-party providers.
