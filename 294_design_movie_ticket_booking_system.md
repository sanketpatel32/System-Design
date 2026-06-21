# Design Movie Ticket Booking System

> **Category:** Low Level Design

---

See **#253 Design Ticket Booking System** for HLD.

### LLD-specific
- Classes: Movie, Show, Theater, Seat, Booking, User.
- Seat locking during selection.

### Classes
```
class Movie: id, title, duration
class Theater: id, name, screens[]
class Screen: id, seats[]
class Show: id, movie, screen, time
class Seat: id, show_id, status, held_by, held_until
class Booking: id, user, show, seats[], total, status
class User: id, name
```

### Operations
- `search_movies()`: list.
- `select_seats(show, seats[])`: lock seats.
- `pay(booking)`: process payment.
- `cancel(booking)`: release seats.

### Key takeaway
Movie ticket LLD = Movie / Theater / Show / Seat / Booking classes. Seat holding (held_by,
held_until) prevents double-booking. State machine on booking.
