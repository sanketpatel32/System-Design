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

### Spot Allocation Strategy
- **Nearest-first**: rank spots by distance from the entry gate (floor, then walk-path length); maintain per-type free-spot min-heaps refreshed on vacate.
- **Type compatibility matrix**: motorcycles fit any spot, cars need Compact+, trucks need Large; handicapped spots are reserved for tagged vehicles only — encode compatibility, not equality.
- **Graceful full-handling**: when no compatible spot exists, refuse entry at the gate with a full-lot display, rather than issuing a ticket with nowhere to park.

### Concurrency & Ticket Lifecycle
| Concern | Design |
|---|---|
| **Two cars, one spot** | Spot allocation is a compare-and-set on `isOccupied`; losers re-pick the next-nearest free spot. |
| **Lost ticket** | Exit kiosk looks up by license plate + entry-time window; charge the max daily rate as a deterrent, per policy. |
| **Clock disputes** | Fee intervals use server timestamps at gate events, never client devices. |
| **Gate crash** | Barrier state machine (waiting → raising → raised → lowering) driven by vehicle-presence sensors, with a jam alert. |

### Fee Model Design
- **Strategy composition**: base hourly rate × vehicle multiplier + flat first-hour minimum, plus surcharges (overnight, event pricing) — each rule a composable `PricingRule`, evaluated in order.
- **Fractional rounding**: bill per started interval (e.g., every 30 min) and publish the rule on the ticket — surprise math is a support-ticket generator.
- **Payment strategies**: cash, card, and app QR behind one `PaymentStrategy` interface; exit gate releases only on payment-confirmed event (with a manual override audit log).

### Key takeaway
Designing a parking lot requires clean encapsulation of physical entities (`ParkingFloor`, `ParkingSpot`, `Vehicle`) and abstraction of strategy patterns for spot assignment and fee calculation.
