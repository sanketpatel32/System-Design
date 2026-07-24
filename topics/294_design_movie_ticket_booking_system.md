# Design Movie Ticket Booking System

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Movie Ticket Booking System managing cinema halls, seating layouts, showtimes, seat reservations, and ticket generation.

### System Requirements & Domain Model
- Model hierarchy: `City` $ightarrow$ `Cinema` $ightarrow$ `Hall` $ightarrow$ `Show` $ightarrow$ `Seat`.
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

### Key takeaway
Movie ticket booking LLD uses a `ShowSeat` junction object to decouple permanent physical seat layouts (`Seat`) from dynamic showtime availability and transient locking states (`AVAILABLE`, `LOCKED`, `BOOKED`).
