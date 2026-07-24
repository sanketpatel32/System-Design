# Design Vending Machine

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Vending Machine using the State Design Pattern to handle item selection, coin/cash payment validation, change calculation, and item dispensing.

### System Requirements & State Machine
- Manage inventory across multiple item racks.
- Accept coins/notes, validate currency, and calculate change.
- Support State pattern transitions: `IdleState` $ightarrow$ `HasMoneyState` $ightarrow$ `DispenseState` $ightarrow$ `RefundState`.

### State Machine Lifecycle Diagram
```
    +------------+    Insert Coin    +---------------+
    | Idle State | ----------------> | HasMoneyState |
    +------------+                   +---------------+
          ^                                  | Select Item
          |                                  v
    +------------+  Dispense Item    +---------------+
    | Refund/Done| <---------------- | DispenseState |
    +------------+                   +---------------+
```

### State Pattern Class Structure
| State Class | Allowed Actions | Transition Trigger |
|---|---|---|
| `IdleState` | `selectItem()`, `insertCoin()` | Money inserted $ightarrow$ `HasMoneyState` |
| `HasMoneyState` | `insertCoin()`, `pressButton()`, `cancel()` | Button pressed & valid funds $ightarrow$ `DispenseState` |
| `DispenseState` | `dispenseItem()` | Dispense complete $ightarrow$ `IdleState` |
| `RefundState` | `refundMoney()` | Transaction canceled $ightarrow$ `IdleState` |

### Key takeaway
Vending machine LLD uses the State Design Pattern to encapsulate state-specific behavior into isolated classes (`IdleState`, `HasMoneyState`, `DispenseState`), preventing massive conditional logic blocks.
