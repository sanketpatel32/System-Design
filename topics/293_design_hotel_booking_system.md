# Design Hotel Booking System

> **Category:** Low Level Design

---

LLD: model hotel bookings.

### Requirements
- Rooms, room types, rates.
- Book, cancel, check-in, check-out.
- Pricing by date / season.

### Classes
```
class Hotel:
    rooms[]

class Room:
    number
    type  # SINGLE, DOUBLE, SUITE
    status  # AVAILABLE, BOOKED, OCCUPIED

class Booking:
    id
    guest
    room
    check_in
    check_out
    status  # CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED

class Guest:
    id
    name
    contact

class PricingStrategy:
    calculate(room, dates) -> money
```

### Pricing
- **Base rate** per room type.
- **Seasonal multipliers** (peak season).
- **Day-of-week** (weekend premium).
- Strategy pattern.

### Booking flow
1. Search availability (date range, type).
2. Create booking.
3. Pay deposit.
4. Check-in → room occupied.
5. Check-out → settle balance, room available.

### Concurrency
- Two guests book same room same dates → conflict.
- Lock room for date range during booking.

### Key takeaway
Hotel LLD = Hotel + Room + Booking + Guest + PricingStrategy. Strategy pattern for pricing.
Lock rooms for date ranges to prevent double-booking.
