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

### Key takeaway
Hotel booking LLD isolates room availability state grids from dynamic pricing strategies, using atomic reservation locks to manage concurrent booking requests cleanly.
