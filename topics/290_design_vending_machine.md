# Design Vending Machine

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Vending Machine using the State Design Pattern to handle item selection, coin/cash payment validation, change calculation, and item dispensing.

### System Requirements & State Machine
- Manage inventory across multiple item racks.
- Accept coins/notes, validate currency, and calculate change.
- Support State pattern transitions: `IdleState` → `HasMoneyState` → `DispenseState` → `RefundState`.

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
| `IdleState` | `selectItem()`, `insertCoin()` | Money inserted → `HasMoneyState` |
| `HasMoneyState` | `insertCoin()`, `pressButton()`, `cancel()` | Button pressed & valid funds → `DispenseState` |
| `DispenseState` | `dispenseItem()` | Dispense complete → `IdleState` |
| `RefundState` | `refundMoney()` | Transaction canceled → `IdleState` |

### Money & Change Handling
- **Currency validation**: reject foreign or damaged coins via `CoinValidator` (weight/diameter/magnetism); return them through the reject slot instead of counting as credit.
- **Change algorithm**: use greedy denomination selection over a sorted-descending coin inventory — valid because canonical coin systems (1, 5, 10, 25) have the greedy property; for arbitrary denominations fall back to dynamic programming.
- **Exact-change shortfall**: if the machine cannot make change, surface an `ExactChangeOnly` indicator before the customer inserts money, and offer a refund or an alternative product.

### Concurrency & Failure Modes
| Scenario | Risk | Mitigation |
|---|---|---|
| Two customers select the last item | Double dispense | Decrement rack inventory atomically (`compare-and-set`) before dispatching to `DispenseState`. |
| Power loss mid-dispense | Customer paid, no product | Persist transaction intent (journal) before actuating the motor; on reboot, resume or auto-refund. |
| Coin jams while refunding | Money trapped | `RefundState` retries with a max attempt counter, then alerts the operator and records a credit note. |
| Button mashed during dispensing | State corruption | `DispenseState` ignores all input except a completion event from the hardware sensor. |

### Extensibility Notes
- **Payment strategies**: abstract payment behind a `PaymentMethod` interface so cash, card, and contactless (NFC/QR) validators plug in without touching state classes (Strategy Pattern alongside State).
- **Restock workflow**: a `MaintenanceState` (key-switch activated) blocks customer transactions while inventory and coin floats are replenished — a fifth state many candidates forget in interviews.
- **Audit trail**: every state transition emits an immutable event (`inserted`, `selected`, `dispensed`, `refunded`) for reconciliation against the coin box.

### Key takeaway
Vending machine LLD uses the State Design Pattern to encapsulate state-specific behavior into isolated classes (`IdleState`, `HasMoneyState`, `DispenseState`), preventing massive conditional logic blocks.
