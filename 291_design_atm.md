# Design ATM

> **Category:** Low Level Design

---

LLD: model an ATM.

### Requirements
- Card auth (PIN).
- Withdraw, deposit, balance.
- Cash dispensing.
- Receipt.

### Classes
```
class ATM:
    state  # IDLE, CARD_INSERTED, PIN_ENTERED, TRANSACTION
    cash_dispenser
    card_reader
    printer
    bank_service

class State:  # abstract
    insert_card(card)
    enter_pin(pin)
    select_transaction(type)
    withdraw(amount)

class IdleState, CardInsertedState, PinEnteredState, TransactionState ...

class Account:
    balance
    withdraw(amount)
    deposit(amount)

class Card:
    number
    account
```

### State pattern
- States: Idle, CardInserted, PinEntered, Transaction.
- Transitions drive flow.

### Withdraw flow
1. Insert card → CardInserted.
2. Enter PIN → PinEntered (validate via bank).
3. Select withdraw → Transaction.
4. Enter amount.
5. Validate balance.
6. Dispense cash, update account, print receipt.
7. Return to Idle.

### Key takeaway
ATM LLD = **State pattern** (Idle, CardInserted, PinEntered, Transaction). Hardware components
(card reader, dispenser, printer). Bank service for account access.
