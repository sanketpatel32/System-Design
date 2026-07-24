# Design Wallet System

> **Category:** E-Commerce and Payments

---

A Digital Wallet system allows users to store funds, perform peer-to-peer (P2P) transfers, pay merchants, and maintain accurate account balances. It mandates strict double-entry bookkeeping to prevent money creation or loss.

### System Requirements
- **Functional Requirements**:
  - Store and maintain user account monetary balances.
  - Support atomic peer-to-peer (P2P) transfers, deposits, and withdrawals.
  - Provide complete immutable transaction history and statement generation.
- **Non-Functional Requirements**:
  - ACID Guarantees: Strict transaction isolation; zero balance inconsistency.
  - High Availability: 99.999% uptime for balance queries and transfers.
  - Auditability: Double-entry ledger ensures total debits equal total credits globally.

### System Architecture
```
[ Mobile App ] ---> [ Wallet API Gateway ] ---> [ Wallet Core Engine ]
                                                       |
                             +-------------------------+-------------------------+
                             |                                                   |
                             v                                                   v
                [ User Balance Cache (Redis) ]                        [ Ledger Service ]
                (Read-Heavy Quick Lookup)                       (ACID RDBMS / Double-Entry)
                             |                                                   |
                             +-------------------------+-------------------------+
                                                       |
                                                       v
                                           [ Immutable Audit Log ]
```

### Double-Entry Bookkeeping Model
Every financial movement consists of at least one debit entry and one credit entry. The sum of all debits must equal the sum of all credits for every transaction.

```
Example: User A transfers $50 to User B
  Debit:  User A Account  -$50
  Credit: User B Account  +$50
  Total Delta = $0
```

### Concurrency Control Strategies
| Strategy | Latency | Throughput | Implementation |
|---|---|---|---|
| **Pessimistic Row Locking** | High ($20-50\text{ ms}$) | Low ($\sim 500\text{ TPS/shard}$) | `SELECT ... FOR UPDATE` on sender and receiver wallet rows in lock order by `wallet_id`. |
| **In-Memory Actor Model** | Ultra-low ($< 2\text{ ms}$) | Extreme ($> 50,000\text{ TPS}$) | Single-threaded actor (e.g. Akka/Java Virtual Threads) processes all operations for a specific wallet partition sequentially. |
| **Optimistic Versioning** | Low ($5-10\text{ ms}$) | Medium | `UPDATE wallets SET balance = balance - 50, version = version + 1 WHERE wallet_id = ? AND version = ? AND balance >= 50`. |

### Key takeaway
A digital wallet system must enforce double-entry accounting where money is never directly mutated but moved between ledger entries. Using strict row locking order or actor-based single-thread partition processing prevents deadlocks and balance corruption under concurrent transfers.
