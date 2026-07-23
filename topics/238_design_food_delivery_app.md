# Design Food Delivery App

> **Category:** Location Based Systems

---

Design Uber Eats / DoorDash: order food, match delivery driver, track.

### Requirements
- **Functional**: browse restaurants; order; match driver; track delivery; pay.
- **Non-functional**: real-time tracking; matching.

### Architecture
- Similar to Uber + restaurant catalog + order management.

### Components
- **Restaurant service**: catalog, menu.
- **Order service**: order lifecycle.
- **Matching service**: match driver to order.
- **Location service**: track driver.
- **Payment**: charge customer, pay restaurant + driver.

### Order flow
1. Customer places order.
2. Restaurant accepts.
3. Driver matched.
4. Driver picks up, delivers.
5. Payment completes.

### Matching
- Nearby available drivers (geohash).
- Offer to drivers, first accept wins.

### Key takeaway
Food delivery = restaurant catalog + order lifecycle + driver matching (Uber-style) + real-time
tracking + payments. Combines e-commerce with ride-sharing patterns.
