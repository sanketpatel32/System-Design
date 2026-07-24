# Design Ticket Booking System

> **Category:** E-Commerce and Payments

---

A Ticket Booking System manages seat maps, event schedules, pricing tiers, and high-concurrency ticket reservations for concerts, sports events, and transport.

### System Requirements
- **Functional Requirements**:
  - Browse available shows, venues, and interactive seat selection matrices.
  - Lock selected seats temporarily during user payment (5-10 min TTL).
  - Confirm ticket issuance and dispatch digital tickets (QR codes).
- **Non-Functional Requirements**:
  - Zero Double-Booking: Strict concurrency control over seat states.
  - Scalability: Support massive burst traffic when tickets for popular events go live.
  - High Availability: Uninterrupted seat map rendering and payment processing.

### System Architecture
```
[ Users / Mobile App ] ---> [ API Gateway ] ---> [ Seat Reservation Service ]
                                                        |
                            +---------------------------+---------------------------+
                            |                                                       |
                            v                                                       v
               [ Redis Seat Lock Engine ]                                [ Relational Booking DB ]
               (Atomic Bitmaps & TTL Lock)                              (PostgreSQL Event Shards)
                            |                                                       |
                            +---------------------------+---------------------------+
                                                        |
                                                        v
                                            [ Payment Gateway Webhook ]
```

### Concurrency Strategies for Seat Reservations
| Strategy | Mechanism | Latency | Scalability |
|---|---|---|---|
| **Pessimistic DB Locks** | `SELECT FOR UPDATE` on seat rows | High ($50-100	ext{ ms}$) | Poor under high traffic spikes. |
| **Redis TTL Distributed Lock** | `SET seat_id user_id NX PX 600000` | Sub-millisecond | Excellent; handles millions of concurrent lock attempts smoothly. |
| **Redis Bitmaps** | Bit per seat ID in Redis key | Ultra-low | High memory efficiency for large stadiums/venues. |

### Seat Lifecycle State Machine
| State | Trigger | Expiry Action |
|---|---|---|
| `AVAILABLE` | Show created / Lock expired | N/A |
| `LOCKED` | User selects seat & proceeds to payment | Reverts to `AVAILABLE` after TTL (e.g. 10 mins) |
| `BOOKED` | Payment confirmed webhook | Permanent reservation |

### Key takeaway
Ticket booking systems protect against double-booking by decoupling transient seat locking (handled via Redis TTL keys) from permanent booking persistence in relational databases after payment confirmation.
