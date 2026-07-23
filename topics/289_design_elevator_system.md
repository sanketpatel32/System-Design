# Design Elevator System

> **Category:** Low Level Design

---

LLD: model elevators in a building.

### Requirements
- Multiple elevators, floors.
- Request elevator (up/down).
- Internal requests (floor buttons).
- Dispatch algorithm.

### Classes
```
class Elevator:
    id
    current_floor
    direction  # UP, DOWN, IDLE
    state  # MOVING, DOOR_OPEN, DOOR_CLOSED
    requests[]

class ElevatorSystem:
    elevators[]

class Request:
    source_floor
    destination_floor
    direction

class Dispatcher:
    assign(request) -> elevator

# Enums
class Direction: UP, DOWN, IDLE
class ElevatorState: MOVING, DOOR_OPEN, DOOR_CLOSED
```

### Dispatch algorithms
- **Simple**: nearest elevator.
- **SCAN** (elevator algorithm): go in one direction, then reverse.
- **Look**: SCAN with reversal when no more requests ahead.

### Patterns
- **Strategy** for dispatch algorithm.
- **Observer** for state changes (notify UI).

### Key takeaway
Elevator LLD = Elevator + ElevatorSystem + Dispatcher + Request classes. Strategy pattern for
dispatch (SCAN, Look, nearest). State machine for elevator (MOVING / DOOR_OPEN).
