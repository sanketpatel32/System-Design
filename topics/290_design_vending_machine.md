# Design Vending Machine

> **Category:** Low Level Design

---

LLD: model a vending machine.

### Requirements
- Display items, prices.
- Accept coins / notes.
- Dispense item + change.
- Handle out-of-stock, insufficient money.

### Classes
```
class VendingMachine:
    state  # IDLE, HAS_MONEY, DISPENSING
    inventory
    current_balance

class State:  # abstract
    insert_money(amount)
    select_product(id)
    dispense()
    cancel()

class IdleState(State): ...
class HasMoneyState(State): ...
class DispensingState(State): ...

class Inventory:
    products  # id -> (product, count)

class Product:
    id
    name
    price
```

### State pattern
- Each state encapsulates behavior.
- Transitions: IDLE → HAS_MONEY → DISPENSING → IDLE.

### Operations
- `insert_money(amount)`: add to balance, transition state.
- `select_product(id)`: validate stock, balance; dispense.
- `dispense()`: deduct inventory, return change.

### Key takeaway
Vending machine LLD = **State pattern** (IdleState, HasMoneyState, DispensingState). Inventory
class for products. State transitions drive behavior. Clean encapsulation.
