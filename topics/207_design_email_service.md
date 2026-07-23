# Design Email Service

> **Category:** Beginner System Design Problems

---

Design a service to send transactional and marketing emails.

### Requirements
- **Functional**: send via template; track opens/clicks/bounces; unsubscribe.
- **Non-functional**: high throughput; deliverability (avoid spam folder).

### Architecture
```
[App] -> [Email API] -> [Queue] -> [Workers] -> [SES/SendGrid]
                                              |
                                              v
                                          [Events (bounces, opens)]
                                              |
                                              v
                                          [Analytics DB]
```

### Templates
- HTML + text versions.
- Variable substitution.
- Stored in DB / config.

### Deliverability
- **SPF**, **DKIM**, **DMARC** DNS records.
- **Dedicated IP** for high volume.
- **Reputation monitoring** (bounce rate, complaints).
- **List hygiene**: remove bounces + unsubscribes.

### Events
- **Bounces**: hard (invalid) → remove; soft (full inbox) → retry.
- **Opens**: tracking pixel.
- **Clicks**: redirect links.
- **Unsubscribes**: List-Unsubscribe header.

### Compliance
- **CAN-SPAM**: unsubscribe link, physical address.
- **GDPR**: consent, easy opt-out.

### Scaling
- Workers consume queue at provider rate limits.
- Backpressure on burst.
- Dedupe by message ID.

### Key takeaway
Email service = queue + workers + provider (SES/SendGrid) + event tracking. Focus on
**deliverability** (SPF/DKIM/DMARC, reputation) and **compliance** (unsubscribe, bounce
handling).
