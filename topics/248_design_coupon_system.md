# Design Coupon System

> **Category:** E-Commerce and Payments

---

A Coupon and Promotional System manages discount rules, campaign budgets, user redemptions, and real-time coupon validation during cart calculation and checkout.

### System Requirements
- **Functional Requirements**:
  - Support diverse discount types (percentage, fixed amount, buy-N-get-M, free shipping).
  - Enforce complex targeting rules (minimum order value, category constraints, first-time user, max redemptions per user/global).
  - Validate and lock coupons atomically during checkout to prevent budget overruns.
- **Non-Functional Requirements**:
  - Low Latency: Validate coupons in $< 15\text{ ms}$ during cart rendering.
  - High Concurrency: Prevent over-redemption when thousands of users apply a limited coupon code simultaneously.
  - Fraud Prevention: Detect code abuse, dictionary attacks, and multi-account exploiting.

### System Architecture
```
[ Cart / Checkout Service ] ---> [ Coupon API Gateway ]
                                         |
                                         v
                            [ Coupon Rule Engine (Drools/Lua) ]
                                         |
                       +-----------------+-----------------+
                       |                                   |
                       v                                   v
             [ Redis Redemption Counters ]        [ Coupon Rules DB ]
             (Atomic Incr & User Bitmaps)          (PostgreSQL / DynamoDB)
```

### Redemption Guarantee & Rules Matrix
| Rule Type | Technical Validation | Fraud Protection Mechanism |
|---|---|---|
| **Global Budget Limit** | Redis atomic counter `INCRBY` against budget cap | Circuit breaker trips when budget reaches zero. |
| **Per-User Usage Limit** | Redis SET / Bitmaps indexed by `user_id` | Atomic `SADD` check before coupon approval. |
| **Minimum Order Amount** | In-memory evaluation against cart subtotal | Exclude shipping/taxes from subtotal calculation. |
| **Category/Item Scope** | Set intersection between cart item IDs and allowed IDs | In-memory set comparison in Rule Engine. |

### API Specification
| Endpoint | Method | Description | Key Parameters |
|---|---|---|---|
| `/v1/coupons/validate` | POST | Test coupon eligibility for cart | `code`, `user_id`, `cart_subtotal`, `items: [...]` |
| `/v1/coupons/reserve` | POST | Lock single redemption slot for checkout | `code`, `user_id`, `order_id` |

### Key takeaway
Coupon systems rely on rule engines coupled with Redis atomic counters and per-user bitmaps to evaluate rules rapidly while strictly enforcing global redemption limits under high concurrency.
