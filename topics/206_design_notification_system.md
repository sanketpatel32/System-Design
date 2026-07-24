# Design Notification System
> **Category:** Beginner System Design Problems

---

### Overview
A **Notification System** dispatches real-time transactional and marketing messages—such as Mobile Push Notifications (iOS APNs, Android FCM), SMS messages (Twilio), Email (SendGrid), and In-App Alerts—to millions of users daily.

Core engineering challenges demand **high throughput**, user channel preference routing, deduplication, rate limiting, and priority queue handling (e.g., OTP login SMS prioritized over marketing promos).

### Multi-Channel Notification Pipeline Topology

```
+--------------------+     1. POST /v1/notifications/send     +--------------------+
| Client / Backend   | -------------------------------------> | API Gateway &      |
| Microservice       |                                        | Rate Limiter       |
+--------------------+                                        +--------------------+
                                                                        |
                                                                        | 2. User Prefs & Opt-Out Check
                                                                        v
                                                              +--------------------+
                                                              | Notification Engine|
                                                              +--------------------+
                                                                        |
                                                                        | 3. Route to Priority Queues
                                                                        v
                                                              +--------------------+
                                                              | Kafka Event Stream |
                                                              | (High vs Low Pri)  |
                                                              +--------------------+
                                                                  /       |       \
                                                4. Consume Workers       |         \
                                                                /         v           \
                                                               v    +-----------+      v
                                                         +-------+  | Twilio    |  +----------+
                                                         | APNs/ |  | SMS Engine|  | SendGrid |
                                                         | FCM   |  +-----------+  | Email    |
                                                         +-------+                 +----------+
```

### Key Technical Mechanics
1. **Priority Queue Separation:** High-priority queues (2FA OTP codes, security alerts) process immediately with strict SLA constraints, completely separated from low-priority bulk marketing queues.
2. **Rate Limiting & Anti-Spam:** Limits notifications per user (e.g., max 3 push alerts per hour) to prevent notification fatigue and user app uninstalls.
3. **Third-Party Provider Fallback:** Maintains multi-vendor redundancy (e.g., Primary SMS: Twilio $\rightarrow$ Fallback: MessageBird) if primary API provider fails.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/notifications/send`| POST | `{"user_id": "u_991", "template_id": "tpl_2fa", "params": {"code": "849201"}, "priority": "HIGH"}` | `{"notification_id": "notif_881", "status": "QUEUED"}` |
| `/api/v1/users/{id}/preferences`| PUT | `{"push_enabled": true, "email_enabled": false, "sms_enabled": true}` | `{"status": "UPDATED"}` |

### Notification Record Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `notification_id` | UUID | Cassandra / PostgreSQL | Primary Key for tracking message lifecycle. |
| `user_id` | String (Indexed) | Cassandra | Recipient user ID. |
| `channel` | Enum | Cassandra | Delivery vector (`PUSH`, `SMS`, `EMAIL`, `IN_APP`). |
| `priority` | Enum | Cassandra | Execution priority (`HIGH`, `MEDIUM`, `LOW`). |
| `status` | Enum | Cassandra | Lifecycle state (`QUEUED`, `DELIVERED`, `FAILED`, `READ`). |
| `retry_count` | Integer | Cassandra | Tracks retry attempts before sending to Dead Letter Queue (DLQ). |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Decoupled Kafka Messaging Architecture**| Absorbs massive notification spikes; guarantees message persistence and horizontal scaling. | Introduces asynchronous delivery latency (few hundred milliseconds). | Enterprise notification systems handling millions of daily messages. |
| **User Channel Preference Filtering** | Prevents user unsubscribes and regulatory fines (CAN-SPAM, GDPR). | Requires backend cache lookups (Redis) before enqueuing every message payload. | Mandatory requirement for consumer SaaS platforms. |
| **Multi-Provider Fallback Circuit Breaker**| Guarantees message delivery even during major third-party vendor outages. | Increases integration code complexity and vendor contract maintenance. | Mission-critical 2FA OTP and transaction alerts. |

### Key takeaway
A **Notification System** uses **decoupled Kafka priority queues** to separate critical transactional alerts from marketing broadcasts, enforcing rate limiting and multi-provider fallback circuits (APNs, FCM, Twilio, SendGrid) to guarantee delivery.
