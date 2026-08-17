# Design Hotel Booking System

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Hotel Booking System managing room availability, room types, dynamic pricing models, check-in workflows, and concurrent reservation handling.

### System Requirements & Inventory Model
- Manage multi-hotel and multi-room inventory (`Standard`, `Deluxe`, `Suite`).
- Search available rooms by city, dates, and guest capacity.
- Perform atomic room reservations to prevent double-booking during concurrent checkouts.

### System Component Diagram
```
[ Guest App ] ---> [ Hotel Search Controller ]
                            |
                            v
               [ Reservation Engine ]
                            |
        +-------------------+-------------------+
        |                                       |
        v                                       v
[ Room Availability Inventory ]        [ Dynamic Pricing Strategy ]
(Dates & Room Type Grid)               (Peak Season / Weekend Multipliers)
        |                                       |
        +-------------------+-------------------+
                            |
                            v
               [ Payment Processing Gateway ]
```

### Class Responsibilities
| Class | Key Fields | Primary Methods |
|---|---|---|
| `Hotel` | `hotelId`, `name`, `location`, `rooms` | `getAvailableRooms(startDate, endDate)` |
| `Room` | `roomId`, `roomType`, `basePrice`, `status` | `isAvailable(dateRange)`, `markReserved()` |
| `Booking` | `bookingId`, `guest`, `room`, `startDate`, `endDate` | `confirmBooking()`, `cancelBooking()` |
| `PricingService` | `pricingStrategy` | `calculateTotalPrice(room, startDate, endDate)` |

### Preventing Double-Bookings
The core correctness problem: two guests checkout the last suite simultaneously. Three layered defenses:

1. **Database constraint (last line of defense)**: a unique key on `(roomId, date)` in a `RoomNight` allocation table makes double-booking physically impossible, no matter what the application does.
2. **Pessimistic locking**: `SELECT ... FOR UPDATE` on the room's date range serializes competing checkouts — simple, but queues waiters and risks timeout storms under load.
3. **Optimistic concurrency**: each availability row carries a version number; the loser of a compare-and-swap retries with fresh availability. Best for low-contention room types.

### Reservation Lifecycle & Holds
- **TTL holds**: inventory is soft-reserved for ~10 minutes at checkout start; a background reaper releases expired holds so abandoned carts don't sell out the hotel.
- **Idempotency keys**: payment retries (network blips) must confirm the *same* booking, not create a second one — key reservations by a client-supplied `Idempotency-Key`.
- **Cancellation windows**: model refund rules as a strategy (`FreeUntil24h`, `NonRefundable`, `Partial50%`) evaluated against `cancellationTime`, emitting a ledger entry rather than mutating the booking price.
- **Overbooking dial**: revenue managers intentionally oversell by a few percent against historical no-show rates; the system needs an explicit `maxOverbookRatio` per room type and a walk-the-guest workflow when it backfires.

### Search at Scale
Availability search across cities and date ranges should not scan bookings: precompute a per-room-type, per-date inventory grid (denormalized), index by `(city, date)`, and let property-level caches absorb popular query shapes.

### Key takeaway
Hotel booking LLD isolates room availability state grids from dynamic pricing strategies, using atomic reservation locks to manage concurrent booking requests cleanly.
