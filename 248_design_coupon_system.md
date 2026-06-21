# Design Coupon System

> **Category:** E-Commerce and Payments

---

Design a coupon/promo system.

### Requirements
- **Functional**: create coupons; redeem; track usage; per-user limits.
- **Non-functional**: prevent abuse; high availability.

### Architecture
```
[Cart checkout] -> [Coupon service] -> validate -> apply
                                        |
                                        v
                                   [DB (coupons, redemptions)]
```

### Coupon rules
- **Code**: unique.
- **Type**: percentage / fixed / free shipping.
- **Conditions**: min order, specific products, first-time user.
- **Limits**: total redemptions, per-user redemptions, expiry.

### Validation
- Code valid + not expired.
- User hasn't used (per-user limit).
- Conditions met (min order, eligible products).
- Total redemptions not exhausted.

### Concurrency
- Atomic decrement of remaining redemptions:
```sql
UPDATE coupons SET remaining = remaining - 1
WHERE code = X AND remaining > 0
```

### Fraud prevention
- Per-IP limit.
- Per-account limit.
- CAPTCHA on bulk redemption attempts.

### Data model
```
coupons (code, type, value, conditions, max_total, max_per_user, expires_at)
redemptions (coupon_code, user_id, order_id, redeemed_at)
```

### Key takeaway
Coupon system = rules engine (type, conditions, limits) + atomic redemption counter + per-user
tracking. Use atomic UPDATE for remaining count. Fraud prevention: per-IP, per-account
limits.
