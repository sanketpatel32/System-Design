# Design Email Service
> **Category:** Beginner System Design Problems

---

### Overview
An **Email Service** sends transactional emails (password resets, order receipts) and bulk marketing campaigns reliably while maintaining high domain deliverability (SPF/DKIM/DMARC) and surviving third-party provider outages via fallback routing.

### Architecture with Provider Failover

```
+---------------+     POST /v1/email     +-------------------+
| Microservices | ---------------------> | Email Gateway API |
+---------------+                        +-------------------+
                                                   |
                                                   v Enqueue Event
                                         +-------------------+
                                         | Kafka Email Queue |
                                         +-------------------+
                                                   |
                                                   v Process Task
                                         +-------------------+
                                         | Delivery Workers  |
                                         +-------------------+
                                            /             \
                     1. Primary (SendGrid) /               \ 2. Fallback (AWS SES)
                                          v                 v
                                  +---------------+  +---------------+
                                  | SendGrid API  |  | AWS SES API   |
                                  +---------------+  +---------------+
```

### Email Deliverability Authentication Protocols

| Protocol | Full Name | Technical Purpose |
|---|---|---|
| **SPF** | Sender Policy Framework | DNS TXT record listing IP addresses authorized to send mail for domain. |
| **DKIM** | DomainKeys Identified Mail | Cryptographic public key in DNS; email header signed with private key to prevent tampering. |
| **DMARC** | Domain-based Message Auth | Defines policy (reject/quarantine) if SPF or DKIM checks fail. |

### Resilience Strategy: Multi-Provider Failover Matrix

| Scenario | Worker Action |
|---|---|
| **Primary Provider 200 OK** | Mark job complete; store provider message ID. |
| **Primary 429 / 5xx Error** | Increment retry counter; trigger **Circuit Breaker** to route remaining jobs to Secondary Provider. |
| **Hard Bounce (Invalid Email)** | Catch webhook event; add target address to Suppression List table to protect domain reputation. |

### Key takeaway
Protect domain deliverability using **SPF, DKIM, and DMARC**. Ensure high availability by implementing **message queues** with automated **multi-provider failover** (e.g., SendGrid primary, AWS SES fallback).
