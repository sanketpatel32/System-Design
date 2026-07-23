# Design Shopping Cart

> **Category:** E-Commerce and Payments

---

Design a shopping cart service.

### Requirements
- **Functional**: add/remove items; update quantity; persist across sessions/devices.
- **Non-functional**: low-latency; HA.

### Architecture
```
[Client] -> [Cart API] -> [Redis (active cart)]
                          [DB (long-term)]
```

### Data model
```
carts:
  user_id (PK)
  items: [{product_id, quantity, added_at}]
  updated_at
```

### Storage
- **Redis**: active cart (fast).
- **DB**: long-term backup.

### Cross-device
- Cart tied to user, not device.
- Sync via API on login.

### Caching
- Redis holds active cart.
- DB on miss.

### Abandoned carts
- After 7 days: reminder email.
- After 30 days: clear.

### Concurrency
- Two devices update simultaneously.
- Last-write-wins OR operational transform.

### Key takeaway
Cart service = Redis (active) + DB (backup) keyed by user. Cross-device via login. Handle
concurrency (LWW or merge). Abandoned cart recovery for revenue.
