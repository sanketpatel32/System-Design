# Design Splitwise

> **Category:** Low Level Design

---

LLD: model expense splitting app.

### Requirements
- Groups of users.
- Add expense (split equally / unequally / by %).
- Calculate balances.
- Settle up.

### Classes
```
class User: id, name
class Group: id, name, members[]
class Expense:
    id
    paid_by
    amount
    splits[]  # how to split
    type  # EQUAL, EXACT, PERCENT

class Split:
    user
    share  # amount or percent

class Balance:
    user_from
    user_to
    amount
```

### Split types
- **EQUAL**: amount / N.
- **EXACT**: per-user amount.
- **PERCENT**: per-user percent of total.

### Settle up
- Compute net balances per user.
- Minimize transactions (debt simplification).

### Key takeaway
Splitwise LLD = User + Group + Expense + Split + Balance. Strategy for split type (EQUAL, EXACT,
PERCENT). Settle-up algorithm simplifies debts to minimum transactions.
