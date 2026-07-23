# Design Ledger System

> **Category:** E-Commerce and Payments

---

Design a financial ledger: track every money movement.

### Requirements
- **Functional**: record transactions; balances; history.
- **Non-functional**: strongly consistent; immutable; auditable.

### Double-entry bookkeeping
- Every transaction affects ≥ 2 accounts.
- Debits = credits (conservation of money).
- Example: $100 transfer
  - Debit Alice: 100
  - Credit Bob: 100

### Data model
```
accounts (id, type, balance)
transactions (id, reference, timestamp, description)
entries (transaction_id, account_id, debit, credit)
```

### Properties
- **Immutable**: never update/delete; only new transactions.
- **Balanced**: every transaction's debits = credits.
- **Queryable**: balance = sum of entries.

### Consistency
- Transactions across accounts atomic.
- Use DB transactions with row locks.

### Money type
- Integers (cents) or DECIMAL — never floats.

### Reconciliation
- Match against external statements (banks).
- Detect missing / duplicate entries.

### Reporting
- Balance sheet.
- P&L.
- Cash flow.

### Key takeaway
Ledger = double-entry (debits = credits) + immutable transactions + atomic across accounts.
Use integers for money. Reconcile against external statements. Never mutate historical entries.
