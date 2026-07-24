# Design ATM

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for an Automated Teller Machine (ATM) system using the State Pattern to handle user authentication, account queries, cash dispensing, and transaction logging.

### System Requirements & Component Architecture
- Support hardware peripherals: Card Reader, Cash Dispenser, Keypad, Display Screen, Printer.
- State Machine transitions: `IdleState` $ightarrow$ `HasCardState` $ightarrow$ `AuthenticatedState` $ightarrow$ `DispensingState`.
- Support cash dispenser algorithm for optimal bill denomination breakdown.

### ATM Hardware & Software System Architecture
```
[ ATM Keypad / Screen ] ---> [ ATM Main Controller ] <---> [ Bank Host Gateway ]
                                     |
    +--------------------------------+--------------------------------+
    | (State Pattern Controller)                                      |
    v                                                                 v
[ Card Reader Hardware ]                                  [ Cash Dispenser ]
(Reads Magstripe/Chip)                                    (Dispenses 100/500/2000 notes)
```

### Class Responsibilities & State Matrix
| Class | Role | Attributes / Methods |
|---|---|---|
| `ATM` | Central context object | `currentState`, `cashDispenser`, `bankService`, `changeState()` |
| `CardReader` | Hardware abstraction for card reads | `readCard()`, `ejectCard()` |
| `CashDispenser` | Manages bill inventory & dispensing | `dispenseCash(amount)`, `hasSufficientCash()` |
| `BankService` | Remote banking API gateway | `authenticatePin()`, `withdraw()`, `getBalance()` |

### Key takeaway
ATM low-level design applies the State Pattern to handle hardware user flows cleanly while isolating physical hardware abstractions (`CashDispenser`, `CardReader`) from remote banking network calls.
