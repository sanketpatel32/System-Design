# Design Ticket Booking System

> **Category:** E-Commerce and Payments

---

Design BookMyShow-style system for movie/event tickets.

### Requirements
- **Functional**: browse shows; select seats; book; pay; cancel.
- **Non-functional**: prevent double-booking; high concurrency for popular shows.

### The double-booking problem
- 100 users try to book the same seat simultaneously.
- Only 1 should succeed.

### Solutions

#### Seat locking
- When user selects seat: lock for 5 minutes.
- Other users see "temporarily held".
- Lock expires if not paid.

#### Optimistic locking
- Version field on seat.
- UPDATE WHERE version = ? → fail if version changed.

#### Atomic update
```sql
UPDATE seats SET status = 'booked'
WHERE show_id = X AND seat_number = Y AND status = 'available'
```

### Architecture
```
[Client] -> [Booking API] -> [Show service]
                              [Seat service (locks)]
                              [Payment service]
                              [Notification]
```

### Booking flow
1. Browse shows.
2. Select seats → hold.
3. Pay within 5 min.
4. On success: confirm seats.
5. On timeout: release seats.

### Data model
```
shows (id, movie_id, theater_id, time)
seats (show_id, seat_number, status, held_by, held_until)
bookings (id, user_id, show_id, seats, status, total)
```

### Key takeaway
Ticket booking = seat holding (5 min lock during payment) + atomic seat updates (prevent
double-book) + payment + confirmation. Atomic UPDATE on seat status prevents race conditions.
