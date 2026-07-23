# Design UPI Style Payment System

> **Category:** E-Commerce and Payments

---

Design a UPI-like (Unified Payments Interface) system: instant bank-to-bank transfers via
virtual payment addresses.

### Requirements
- **Functional**: link bank account; create VPA (name@bank); transfer to VPA; QR code payment.
- **Non-functional**: real-time (<10s); 24/7; highly available.

### Architecture
```
[User app] <-> [UPI API] <-> [Bank APIs (via NPCI)]
                              [VPA resolver]
                              [Ledger]
```

### Components
- **VPA service**: maps `alice@okbank` → bank account.
- **Bank integration**: each bank exposes APIs.
- **NPCI switch**: routes between banks.
- **Auth**: mobile PIN (MPIN) + device binding.

### Transfer flow
1. Sender enters recipient VPA + amount.
2. App resolves VPA → bank account.
3. Sender authenticates (MPIN).
4. Debit sender bank, credit recipient bank.
5. Both apps notified.

### QR payments
- Merchant displays QR (encodes VPA).
- Customer scans → VPA + amount → pay.

### Idempotency
- Transaction reference ID.
- Banks dedup.

### 24/7
- Banks must be online always.
- NPCI switch HA.

### Key takeaway
UPI = VPA resolver + bank APIs + NPCI switch + auth (MPIN). Real-time settlement between banks.
QR encodes VPA for merchant payments. Idempotency via transaction reference.
