# Design Movie Ticket Booking System

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Movie Ticket Booking System managing cinema halls, seating layouts, showtimes, seat reservations, and ticket generation.

### System Requirements & Domain Model
- Model hierarchy: `City` → `Cinema` → `Hall` → `Show` → `Seat`.
- Support seat classification (`REGULAR`, `PREMIUM`, `VIP`).
- Concurrent seat selection and temporary holding (10-min locking mechanism).

### Class Diagram Architecture
```
+-------------------+          +-------------------+          +-------------------+
|      Cinema       | 1     *  |        Hall       | 1     *  |       Seat        |
+-------------------+ --------> +-------------------+ --------> +-------------------+
| - cinemaId: string|          | - hallId: string  |          | - seatId: string  |
| - halls: List     |          | - seats: List     |          | - row: int        |
+-------------------+          +-------------------+          | - seatType: Type  |
                                                              +-------------------+
                                                                        ^
                                                                        | (for show)
                                                              +-------------------+
                                                              |     ShowSeat      |
                                                              +-------------------+
                                                              | - price: double   |
                                                              | - status: Status  |
                                                              +-------------------+
```

### Class Responsibilities
| Class | Attributes | Primary Responsibilities |
|---|---|---|
| `Show` | `showId`, `movie`, `startTime`, `hall` | Represents a movie screening at a specific hall and time. |
| `ShowSeat` | `showSeatId`, `seat`, `price`, `status` | Tracks individual seat status (`AVAILABLE`, `LOCKED`, `BOOKED`) per show. |
| `BookingController` | `seatLockManager`, `paymentGateway` | Coordinates atomic seat locking and ticket issuance. |

### Seat Locking & Concurrent Booking
Two users tapping the same seat during checkout is the defining race of this system:

1. **Optimistic lock per ShowSeat**: `LOCKED` transitions use a version/compare-and-set — exactly one winner; the loser sees "seat just taken" and re-picks.
2. **TTL reaper**: locks expire after ~10 minutes; a background job (or lazy check at read time) releases expired holds so abandoned checkouts don't ghost the inventory.
3. **Idempotent confirmation**: the pay-and-confirm call carries an idempotency key — a retried payment confirms the same booking instead of creating a duplicate.
4. **Final write wins via constraint**: ticket issuance inserts into a table with a unique key on `(showId, seatId)`, making double-booking physically impossible even if every layer above fails.

### Showtime Search & Availability Reads
- Availability for a popular show is read-heavy: serve seat maps from a cache invalidated on lock/book events, and batch-invalidate per show rather than per seat to avoid stampedes.
- City-level search (movie → cinema → showtimes) follows a different access path than seat maps — index and cache them independently.

### Failure & Support Flows
- **Payment succeeded, booking write failed**: reconcile async via the payment webhook + outbox pattern; auto-refund unmatched charges after a window.
- **Refunds/cancellations**: modeled as explicit state transitions with policy rules (free until 2h before showtime), never as deletes — the seat's history must survive audits.
- **House seats / holds**: cinemas block seats for VIPs; model as an internal `BLOCKED` status distinct from customer `LOCKED`.

### Key takeaway
Movie ticket booking LLD uses a `ShowSeat` junction object to decouple permanent physical seat layouts (`Seat`) from dynamic showtime availability and transient locking states (`AVAILABLE`, `LOCKED`, `BOOKED`).
