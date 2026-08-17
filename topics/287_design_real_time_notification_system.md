# Design Real-Time Notification System

> **Category:** Real-Time Systems

---

A Real-Time Notification System routes and dispatches alert messages to millions of end-users across multiple delivery channels including Push (FCM/APNs), In-App (WebSockets), SMS (Twilio), and Email (SendGrid).

### System Requirements
- **Functional Requirements**:
  - Ingest notification triggers from backend microservices.
  - Enforce user channel preferences, quiet hours, and rate-limiting rules.
  - Dispatch multi-channel notifications (Push, WebSockets, SMS, Email).
- **Non-Functional Requirements**:
  - High Throughput: Process tens of thousands of notifications per second.
  - Sub-Second Delivery: Immediate delivery for high-priority alerts (OTP, transactional).
  - Fault Tolerance: Auto-retry on delivery provider failures with Dead-Letter Queues (DLQ).

### System Architecture
```
[ Backend Services ] ---> [ Notification API Router ] ---> [ Preference & Rate Limiter ]
                                                                   |
                                                                   v
                                                       [ Kafka Priority Queue ]
                                                       (High / Medium / Low)
                                                                   |
        +-----------------------+--------------------------+-------+------------------+
        |                       |                          |                          |
        v                       v                          v                          v
[ FCM / APNs Worker ]   [ WebSocket Push Worker ]   [ SMS Worker (Twilio) ]    [ Email Worker (SendGrid) ]
(Mobile Push)           (In-App Alert)              (SMS Gateway)              (Email Gateway)
        |                       |                          |                          |
        +-----------------------+--------------------------+-------+------------------+
                                                                   |
                                                                   v
                                                       [ Notification History DB ]
```

### Delivery Channel Comparison
| Channel | Transport | Latency SLA | Best Use Case |
|---|---|---|---|
| **Mobile Push (FCM/APNs)** | HTTP/2 Persistent Stream | < 2 seconds | App engagement, transactional alerts. |
| **In-App WebSockets** | Active TCP WebSocket | < 50 ms | Real-time active session notifications. |
| **SMS (Twilio)** | Cellular Network / Telephony | 2-5 seconds | High-security OTPs, urgent operational alerts. |
| **Email (SendGrid)** | SMTP Protocol | 5-30 seconds | Newsletters, detailed order receipts. |

### Key takeaway
Notification systems decouple API ingestion from multi-channel dispatch workers (FCM, APNs, Twilio) using Kafka priority queues, enforcing rate-limiting rules and user preferences before dispatch.
