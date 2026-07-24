# Design BookMyShow

> **Category:** E-Commerce and Payments

---

BookMyShow is a premier movie and event ticket booking platform. It handles multi-cinema listings, interactive seat matrices, dynamic pricing, localized payment processing, and high-concurrency ticket sales during blockbuster movie releases.

### System Requirements
- **Functional Requirements**:
  - Search movies, theaters, and showtimes by city and geolocation.
  - Interactive grid-based seat selection with real-time seat availability state.
  - Temporary seat locking (10-minute expiry) while user completes payment.
  - Digital ticket generation with embedded QR codes for gate validation.
- **Non-Functional Requirements**:
  - High Concurrency: Handle 100,000+ users clicking the same seat simultaneously when major show bookings open.
  - Sub-second Latency: Instant seat status updates across connected clients.
  - Zero Double Booking: Absolute isolation guarantee for confirmed seat reservations.

### System Architecture
```
[ User Mobile App ] ---> [ API Gateway ] ---> [ Showtime & Seat Service ]
                                                     |
                         +---------------------------+---------------------------+
                         |                                                       |
                         v                                                       v
            [ Redis Seat Grid Cluster ]                            [ Booking Storage DB ]
            (Distributed Locks + SSE Sync)                          (Aurora RDBMS / MySQL)
                         |                                                       |
                         +---------------------------+---------------------------+
                                                     |
                                                     v
                                         [ QR Ticket Dispatch Engine ]
```

### High-Concurrency Seat Locking & Expiry Workflow
1. **User Selects Seats**: Client sends seat IDs to `/v1/bookings/lock`.
2. **Distributed Lock Attempt**: Redis executes Lua script checking seat availability. If unbooked, sets key `lock:show_123:seat_A5` with `TTL = 600s`.
3. **Real-time Broadcast**: Server broadcasts seat status update to all users viewing the show's seat map via Server-Sent Events (SSE).
4. **Payment Completion**: Upon payment webhook, status shifts from `LOCKED` to `BOOKED` in MySQL DB and Redis.
5. **Lock Timeout**: If payment is incomplete within 10 minutes, Redis key expires and seat returns to `AVAILABLE`.

### Core API Specification
| Endpoint | Method | Description | Key Parameters |
|---|---|---|---|
| `/v1/shows/{id}/seats` | GET | Fetch seat map & live availability grid | `show_id` |
| `/v1/bookings/lock` | POST | Temporarily hold selected seats | `show_id`, `seat_ids: [...]`, `user_id` |
| `/v1/bookings/confirm` | POST | Finalize booking after payment authorization | `booking_id`, `payment_ref` |

### Key takeaway
BookMyShow manages extreme seat map contention through in-memory Redis distributed locks with strict TTLs, broadcasting real-time grid updates via SSE and updating persistent databases only upon payment verification.
