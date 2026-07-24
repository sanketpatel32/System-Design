# Design Elevator System

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Multi-Elevator Control System managing elevator dispatching, floor requests, internal buttons, and door safety logic across a high-rise building.

### System Requirements & State Model
- Coordinate multiple elevator cars across $N$ floors.
- Process internal floor selection buttons and external hall call buttons (Up/Down).
- Efficient elevator dispatching algorithm (SCAN / LOOK / Destination Dispatch).

### System Component Diagram
```
[ External Hall Panel (Up/Down) ] ---> [ Elevator Dispatcher Controller ]
                                                 |
                       +-------------------------+-------------------------+
                       |                                                   |
                       v                                                   v
            [ Elevator Car 1 ]                                  [ Elevator Car 2 ]
            (State: MOVING_UP)                                  (State: IDLE)
            +-> Internal Panel                                  +-> Internal Panel
            +-> Door Mechanism                                  +-> Door Mechanism
            +-> Motor Control                                   +-> Motor Control
```

### Class Responsibilities & Dispatch Strategies
| Class | Purpose | Key Attributes / Methods |
|---|---|---|
| `ElevatorController` | Coordinates elevator dispatch algorithms | `dispatchCar(hallRequest)`, `cars: List` |
| `ElevatorCar` | Represents single elevator state | `currentFloor`, `direction`, `state`, `move()`, `openDoor()` |
| `HallButton` | External floor button (UP/DOWN) | `floor`, `direction`, `press()` |
| `InternalButton` | Inside car floor destination button | `destinationFloor`, `press()` |

| Dispatch Algorithm | Execution Logic | Use Case |
|---|---|---|
| **SCAN (Elevator Algo)** | Moves continuous direction servicing all calls in path before reversing | Standard building traffic. |
| **Destination Dispatch**| User inputs destination floor before entering car; groups users by floor | High-rise office towers during peak morning rush. |

### Key takeaway
Elevator design encapsulates state machines inside `ElevatorCar` objects while delegating scheduling optimization to an external `ElevatorController` using the SCAN or Destination Dispatch algorithms.
