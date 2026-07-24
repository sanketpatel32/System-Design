# Design Email Service
> **Category:** Beginner System Design Problems

---

### Overview
An **Email Service** is a specialized messaging platform designed to generate, sign, queue, and deliver millions of transactional (password resets, invoices) and promotional emails daily while maintaining high domain inbox deliverability.

Key technical requirements require cryptographic domain authentication (**DKIM**, **SPF**, **DMARC**), asynchronous queuing, bounce/complaint handling via webhooks, and rate-governed SMTP pool routing.

### Email Delivery System Architecture

```
+--------------------+     1. POST /v1/emails/send          +--------------------+
| Internal Services  | -----------------------------------> | API Gateway        |
+--------------------+                                      +--------------------+
                                                                      |
                                                                      v 2. Enqueue Payload
                                                            +--------------------+
                                                            | RabbitMQ / Kafka   |
                                                            | Email Queue        |
                                                            +--------------------+
                                                                      |
                                                                      v 3. Consume & Sign
                                                            +--------------------+
                                                            | Email Workers &    |
                                                            | DKIM Signer        |
                                                            +--------------------+
                                                                      |
                                                                      v 4. SMTP Handshake
                                                            +--------------------+
                                                            | SMTP Relay / AWS   |
                                                            | SES Gateway        |
                                                            +--------------------+
                                                                      |
                                                                      v 5. Bounce Webhooks
                                                            +--------------------+
                                                            | Ingestion Webhook  |
                                                            | (Suppression List) |
                                                            +--------------------+
```

### Key Technical Mechanics
1. **Domain Cryptographic Verification:**
   - **SPF (Sender Policy Framework):** DNS record listing IP addresses authorized to send emails for the domain.
   - **DKIM (DomainKeys Identified Mail):** Cryptographic RSA signature attached to email headers, verified using public DNS keys.
   - **DMARC:** Defines recipient server policy when SPF/DKIM verification fails (`none`, `quarantine`, `reject`).
2. **Suppression List Management:** Automatically intercepts and blocks email delivery to addresses that previously hard-bounced or marked emails as spam complaints, preserving IP sender reputation score.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/emails/send` | POST | `{"to": "user@example.com", "template_id": "welcome_email", "variables": {"name": "Alice"}}` | `{"email_id": "em_9912", "status": "QUEUED"}` |
| `/api/v1/webhooks/bounce`| POST | `{"email_id": "em_9912", "event": "HARD_BOUNCE", "reason": "550 User unknown"}` | `{"status": "PROCESSED", "suppressed": true}` |

### Email Dispatch Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `email_id` | UUID | PostgreSQL | Unique Primary Key for email tracking log. |
| `recipient_email` | String (Indexed)| Relational DB | Target destination address. |
| `subject` | String | Relational DB | Rendered email subject line. |
| `status` | Enum | Relational DB | State (`QUEUED`, `SENT`, `DELIVERED`, `BOUNCED`, `COMPLAINT`). |
| `dkim_signed` | Boolean | Relational DB | Cryptographic signature verification flag. |
| `smtp_response_code`| String | Relational DB | Raw response received from receiving MX mail server (e.g., `250 2.0.0 OK`). |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Dedicated IP Pools vs Shared IPs** | Protects domain sender reputation from noisy neighbors; optimal deliverability for high volume. | High monthly vendor cost; requires cold IP warm-up process over several weeks. | Enterprise systems sending > 100,000 emails daily. |
| **Asynchronous Background Delivery Queue**| Instant HTTP 200 OK for caller API; isolates backend from SMTP socket connection delays. | Recipient experiences slight delivery latency (1-5 seconds). | Mandatory requirement for all transactional and bulk email architectures. |
| **HTML Template Pre-Rendering** | Offloads template compilation overhead from email dispatch worker threads. | Increases storage size of queued messaging events in Kafka/RabbitMQ. | Systems with complex localized HTML email layouts. |

### Key takeaway
An **Email Service** guarantees deliverability through **SPF, DKIM, and DMARC cryptographic signatures**, asynchronous queuing, and automated webhook suppression list management to safeguard domain sender reputation.
