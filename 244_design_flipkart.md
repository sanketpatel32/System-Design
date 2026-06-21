# Design Flipkart

> **Category:** E-Commerce and Payments

---

See **#243 Design Amazon** — Flipkart is essentially the same pattern.

### India-specific considerations
- Multiple payment methods (UPI, COD, wallets).
- Regional languages.
- Mobile-first.
- Logistics network.

### Key takeaway
Flipkart = Amazon-style architecture with India-specific payment (UPI, COD) + regionalization.
Same microservice + cache + Saga pattern.
