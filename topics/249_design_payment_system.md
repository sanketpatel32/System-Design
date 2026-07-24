# Design Payment System

> **Category:** E-Commerce and Payments

---

A Payment System manages money movements between buyers, merchants, and financial networks. It provides secure payment processing, idempotency guarantees, multi-PSP routing, webhook handling, and audit reconciliation.

### System Requirements
- **Functional Requirements**:
  - Charge credit/debit cards, digital wallets, and bank transfers via PSPs (Stripe, PayPal, Adyen).
  - Handle asynchronous payment webhooks and status callbacks securely.
  - Support multi-currency transactions, refunds, and payouts.
- **Non-Functional Requirements**:
  - High Reliability & Zero Data Loss: Zero double-charges or dropped transactions.
  - Strict Idempotency: Every API call guaranteed to process at most once.
  - Compliance: PCI-DSS compliant tokenization (never store raw PAN card data).

### System Architecture
```
[ Order Service ] ---> [ Payment Gateway API ] ---> [ Payment Service Core ]
                                                            |
        +-----------------------+---------------------------+-----------------------+
        |                       |                           |                       |
        v                       v                           v                       v
[ Idempotency Service ] [ PSP Smart Router ]       [ Ledger Service ]      [ Webhook Receiver ]
(Redis/DB Unique Lock)  (Stripe/Adyen/PayPal)    (Double-Entry DB)       (Signature Verified)
```

### Payment State Machine
```
[ INITIATED ] ---> [ AUTHORIZING ] ---> [ AUTHORIZED ] ---> [ CAPTURED ]
       |                  |                    |
       +------------------+--------------------+---> [ FAILED / EXPIRED ]
                                               |
                                               v
                                        [ REFUNDED ]
```

### Key Technical Mechanisms
| Mechanism | Implementation Detail | Purpose |
|---|---|---|
| **Idempotency Key** | Unique `Idempotency-Key` header cached in Redis with DB unique index | Prevents double charges when requests are retried due to network drops. |
| **PSP Smart Router** | Dynamic routing based on PSP fees, latency, and success rates | Maximizes transaction approval rates while minimizing processing fees. |
| **Reconciliation Engine** | Daily batch job matching PSP settlement reports with internal ledgers | Identifies missing payments, unauthorized charges, or fee discrepancies. |

### API Design
| Endpoint | Method | Description | Key Headers / Parameters |
|---|---|---|---|
| `/v1/payments/charge` | POST | Initiate payment charge | Header: `Idempotency-Key`, `order_id`, `amount`, `currency`, `payment_token` |
| `/v1/payments/refund` | POST | Process partial or full refund | Header: `Idempotency-Key`, `payment_id`, `amount`, `reason` |
| `/v1/webhooks/psp` | POST | Receive asynchronous PSP callback | Header: `X-PSP-Signature`, Payload: `event_type`, `payment_id`, `status` |

### Key takeaway
Payment systems require strict idempotency enforcement, tokenized card handling for PCI-DSS compliance, double-entry ledger integration, and automated reconciliation jobs to guarantee financial accuracy.
