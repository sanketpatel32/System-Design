# Design Parking Lot

> **Category:** Low Level Design

---

LLD: model a parking lot (classes, relationships).

### Requirements
- Multiple floors, spots, vehicles.
- Spot types: motorcycle, car, truck.
- Park, unpark, calculate fee.

### Classes
```
class Vehicle:
    license_plate
    type  # MOTORCYCLE, CAR, TRUCK

class ParkingSpot:
    id
    type
    is_free
    vehicle

class ParkingFloor:
    id
    spots[]

class ParkingLot:
    floors[]

class Ticket:
    id
    vehicle
    spot
    entry_time

class FeeStrategy:
    calculate_fee(ticket) -> money

# Enums
class VehicleType: MOTORCYCLE, CAR, TRUCK
class SpotType: MOTORCYCLE, COMPACT, LARGE
```

### Patterns
- **Strategy** for fee calculation (hourly, daily, flat).
- **Factory** to create spot of right type.
- **Singleton** for the parking lot.

### Operations
- `park(vehicle)`: find spot, assign, return ticket.
- `unpark(ticket)`: free spot, calculate fee.

### Key takeaway
Parking lot LLD = Vehicle, ParkingSpot, ParkingFloor, ParkingLot, Ticket classes. Strategy
pattern for fee calculation. Singleton for lot. Factory for spot creation.
