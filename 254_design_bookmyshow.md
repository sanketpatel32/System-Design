# Design BookMyShow

> **Category:** E-Commerce and Payments

---

See **#253 Design Ticket Booking System** for the full design.

### Key components
- Movie/show catalog.
- Seat map with locking.
- Payment gateway.
- Notification (email/SMS confirmation).

### Notable challenges
- High concurrency for blockbuster releases.
- Seat holds expiring.
- Payment failures → release.

### Key takeaway
BookMyShow = ticket booking system with movie catalog + seat locking + payment. High-concurrency
seat updates via atomic SQL or row locks.
