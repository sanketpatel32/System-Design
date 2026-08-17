# Design ATM

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for an Automated Teller Machine (ATM) system using the State Pattern to handle user authentication, account queries, cash dispensing, and transaction logging.

### System Requirements & Component Architecture
- Support hardware peripherals: Card Reader, Cash Dispenser, Keypad, Display Screen, Printer.
- State Machine transitions: `IdleState` → `HasCardState` → `AuthenticatedState` → `DispensingState`.
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

### Cash Dispensing Algorithm
- **Greedy denomination breakdown**: dispensing ₹3,800 from an inventory of {2000: 2, 500: 4, 100: 10} yields one 2000, three 500s, and three 100s — always consume the largest note the remaining amount and inventory allow.
- **Greedy can fail**: with {500: 1, 100: 10} an ₹800 request cannot be made greedily (500 + 3×100 = 800 works only if you *skip* the largest note). Production dispensers backtrack or use dynamic programming over the note inventory.
- **Inventory reservation**: decrement cassette counts atomically *before* the motor runs; reconcile against the physical count at end-of-day to detect jams or miscounts.
- **Denomination preference**: prefer note mixes that preserve small denominations for later withdrawals — a secondary objective after correctness.

### Security & Failure Handling
| Concern | Design Response |
|---|---|
| **PIN brute force** | Three incorrect attempts → retain card, require branch pickup; counter held server-side, never on the card. |
| **Eavesdropping** | PIN encrypted on the keypad (PIN pad crypto), end-to-end to the bank host — the ATM software never sees plaintext. |
| **Network loss to bank** | Enter offline/degraded mode: balance queries refused, small withdrawals allowed only with last-known balance + issuer switch limits. |
| **Power cut mid-dispense** | The transaction journal records intent before cash moves; on reboot the machine reconciles journal vs. dispenser state and reverses or completes. |
| **Audit trail** | Every state transition and hardware command logged immutably with timestamps for dispute resolution. |

### Concurrency Notes
The ATM itself is single-session (state machine), but the **bank-side account** is highly concurrent: withdrawals must be atomic `check balance → debit → authorize` (row lock or compare-and-swap), and replayed requests need idempotency keys so a network retry never debits twice.

### Key takeaway
ATM low-level design applies the State Pattern to handle hardware user flows cleanly while isolating physical hardware abstractions (`CashDispenser`, `CardReader`) from remote banking network calls.
