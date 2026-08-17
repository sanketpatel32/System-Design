# Design Elevator System

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Multi-Elevator Control System managing elevator dispatching, floor requests, internal buttons, and door safety logic across a high-rise building.

### System Requirements & State Model
- Coordinate multiple elevator cars across N floors.
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

### Elevator Car State Machine
```
        +-------+   door_closed & requests   +-----------+
        | IDLE  | -------------------------> | MOVING_UP |
        +-------+                           +-----------+
            ^   |                               |  no more calls ahead →
            |   | target below current floor    |  reverse or stop
            |   v                               v
        +-------+  (symmetric)              +-----------+
        |MOVING_D| <----------------------- |  FLOOR_STOP|
        +-------+                            +-----------+
                                              open doors, board/alight,
                                              dwell timer (5-10s), close
```
Each state owns strict transition rules — door-open is only legal in `FLOOR_STOP`, and emergency/overload inputs preempt everything (fire service recall, door obstruction reversal).

### Dispatch Quality: What to Optimize
| Objective | Metric | Note |
|---|---|---|
| **Minimize wait** | Average and p95 hall-call wait time | The rider's primary perception. |
| **Minimize journey** | Wait + travel time to destination | Destination dispatch optimizes this end-to-end. |
| **Throughput** | Passengers moved per minute per shaft | Peak rush constraint (typically ~1 car per 75–100 floors of population). |
| **Energy / wear** | Starts-stops per trip | Grouping co-directional calls reduces motor cycles. |

### Edge Cases Interviewers Probe
- **Rush hour asymmetry**: morning rush is lobby-heavy (up-peak) — park empty cars at the lobby; evening is reverse; lunch is bidirectional. Scheduling policy should shift by time of day.
- **Elevator out of service**: controller removes the car from dispatch but keeps hall buttons live, redistributing load.
- **Overload**: car refuses to dispatch while overloaded — internal buttons disabled, alarm shown.
- **Door safety**: obstruction sensor reversal with max reopen count, then require manual close (prevents a blocked door from stalling a shaft indefinitely).
- **Power loss**: brakes engage; on restore, cars recalibrate by creeping to the nearest floor and re-syncing position counters.

### Key takeaway
Elevator design encapsulates state machines inside `ElevatorCar` objects while delegating scheduling optimization to an external `ElevatorController` using the SCAN or Destination Dispatch algorithms.
