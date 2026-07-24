# Design Parking Lot

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Multi-Floor Parking Lot management system supporting diverse vehicle types, parking spot allocation algorithms, and payment processing gates.

### System Requirements & Class Model
- Support vehicle types: `Motorcycle`, `Car`, `Truck`.
- Support spot types: `Compact`, `Large`, `Handicapped`, `MotorcycleSpot`.
- Automatic assignment of nearest available spot to entry gate.
- Fee calculation based on vehicle type and duration.

### LLD Class Diagram
```
+------------------+          +------------------+          +------------------+
|    ParkingLot    | 1     *  |   ParkingFloor   | 1     *  |   ParkingSpot    |
+------------------+ --------> +------------------+ --------> +------------------+
| - floors: List   |          | - floorId: int   |          | - spotId: string |
| + parkVehicle()  |          | - spots: List    |          | - isFree: bool   |
| + unparkVehicle()|          | + getFreeSpot()  |          | - type: SpotType |
+------------------+          +------------------+          +------------------+
                                                                      ^
                                                                      | (assigned to)
                                                            +------------------+
                                                            |     Vehicle      |
                                                            +------------------+
                                                            | - licenseNo: str |
                                                            | - type: VehType  |
                                                            +------------------+
```

### Core Entity Responsibilities
| Class | Attributes | Primary Methods |
|---|---|---|
| `ParkingLot` | `lotId`, `floors`, `entryGates`, `exitGates` | `assignSpot(vehicle)`, `releaseSpot(ticket)` |
| `ParkingSpot` | `spotId`, `spotType`, `isOccupied`, `currentVehicle` | `occupy()`, `vacate()` |
| `ParkingTicket` | `ticketId`, `spotId`, `entryTime`, `vehicle` | `calculateFee(exitTime)` |
| `PaymentStrategy` | `PricingModel` | `computeCost(hours, vehicleType)` |

### Key takeaway
Designing a parking lot requires clean encapsulation of physical entities (`ParkingFloor`, `ParkingSpot`, `Vehicle`) and abstraction of strategy patterns for spot assignment and fee calculation.
