# Design Payment System

> **Category:** E-Commerce and Payments

---

Design a payment system that charges customers and pays out.

### Requirements
- **Functional**: charge card / wallet; refund; payout to merchants; ledger.
- **Non-functional**: strongly consistent; auditable; durable.

### Architecture
```
[Order] -> [Payment service] -> [Payment gateway (Stripe)]
                                 [Ledger service]
                                 [Notification]
```

### Charge flow
1. Order creates payment intent.
2. Customer provides card / wallet.
3. Payment gateway (Stripe, Razorpay) processes.
4. On success: ledger entry, mark order paid.
5. On failure: order cancelled / retry.

### Idempotency
- Critical: don't double-charge.
- Idempotency key per payment intent.
- Payment gateway supports it.

### Ledger
- **Double-entry** accounting.
- Every transaction: debit one account, credit another.
- Source of truth for all money movement.

### Refunds
- Reverse the original transaction.
- Idempotent.
- May take days to settle.

### Payouts
- Batch merchants' balance → bank account.
- Daily / weekly schedule.

### Reconciliation
- Match our ledger to gateway statements.
- Detect discrepancies.

### Compliance
- **PCI DSS**: don't store card numbers (use tokenization).
- **Audit logs** for every money event.

### Key takeaway
Payment system = payment gateway (Stripe) + double-entry ledger + idempotent transactions +
reconciliation. Never store raw card numbers (PCI). Idempotency prevents double-charges.
