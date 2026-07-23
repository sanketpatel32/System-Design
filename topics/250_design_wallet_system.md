# Design Wallet System

> **Category:** E-Commerce and Payments

---

Design a digital wallet (PayPal, Paytm): store balance, transfer, transactions.

### Requirements
- **Functional**: hold balance; transfer between users; transactions history.
- **Non-functional**: strongly consistent; durable.

### Architecture
```
[User] -> [Wallet service] -> [Postgres (accounts, transactions)]
                               [Ledger (double-entry)]
```

### Double-entry ledger
- Every transaction: debit + credit.
- `transfer(A, B, 100)`:
  - debit A: 100.
  - credit B: 100.
- Sum of all entries = 0 (conservation of money).

### Concurrency
- Use transactions + row locks.
- `SELECT FOR UPDATE` on accounts.
- Or optimistic locking with version.

### Data model
```
accounts (user_id, balance, version, updated_at)
transactions (id, from_user, to_user, amount, type, created_at)
transaction_entries (transaction_id, account_id, debit, credit)
```

### Money representation
- Use integers (cents) — avoid floats.
- Or DECIMAL.
- Never floating point.

### Idempotency
- Each transfer has a client-generated ID.
- Reject duplicates.

### Audit
- Append-only ledger.
- Never delete / modify transactions.

### Key takeaway
Wallet = double-entry ledger (every transaction debits + credits) + strong consistency +
idempotency. Use integers / DECIMAL for money (never floats). Append-only for audit.
