# Design Splitwise

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for an Expense Sharing Application (like Splitwise) supporting unequal expense splits, group expenses, and debt graph simplification algorithms.

### System Requirements & Algorithm
- Support expense split types: `EQUAL`, `EXACT`, `PERCENTAGE`.
- Maintain group balances and generate user balance summaries.
- Debt Simplification Algorithm: Minimize total transaction count needed to settle all debts within a group.

### System Architecture & Debt Graph Simplification
```
[ User App ] ---> [ Expense Controller ] ---> [ Split Strategy Factory ]
                                                       |
                                                       v
                                            [ Group Balance Graph ]
                                                       |
                                                       v
                                           [ Debt Simplifier (Greedy) ]
                                           (Reduces N transfers to minimal set)
```

### Split Strategy Matrix & Classes
| Split Type Strategy | Execution Logic | Class Implementation |
|---|---|---|
| `EqualSplit` | Divides amount equally among all participants | `EqualSplitStrategy` |
| `ExactSplit` | Verifies sum of exact amounts equals total expense | `ExactSplitStrategy` |
| `PercentSplit` | Verifies sum of percentages equals 100% | `PercentSplitStrategy` |

```
Debt Simplification Algorithm:
1. Compute net balance for every user (Credits - Debits).
2. Separate users into Debtors (net < 0) and Creditors (net > 0).
3. Greedily match maximum Debtor with maximum Creditor until all balances are zero.
```

### Money Representation & Integrity
- **Never floats**: store amounts as integer minor units (cents/paise) — `0.1 + 0.2` arithmetic defects corrupt ledgers silently.
- **Rounding remainders**: an equal 3-way split of ₹100 leaves ₹0.01; assign remainders deterministically (e.g., to the payer or round-robin) so sums always reconcile exactly.
- **Immutable expenses**: an expense plus its splits is an immutable audit record; edits create compensating entries, never mutate history — the same discipline double-entry bookkeeping uses.
- **Per-group settlement**: balances are maintained *per group*, not globally — settling outside the group context needs an explicit cross-group transfer object.

### Worked Simplification Example
Three friends finish a trip: Ankit is owed ₹500 net, Bina owes ₹300 net, Chirag owes ₹200 net:

```
Before:  Bina ──₹300──> Ankit        After:  Bina ──₹300──> Ankit
         Chirag ─₹200─> Ankit                 Chirag ─₹200─> Ankit
```

Greedy max-debtor ↔ max-creditor matching already yields the minimum two transfers here; with messier graphs (A owes B, B owes C, C owes A) simplification collapses circular debt to at most (n−1) transfers.

### Practical Extensions
- **Simplified-vs-actual debts**: showing "Ankit owes Bina ₹50" directly may be socially wrong (you owe a friend, not a stranger) — keep per-pair ledgers and treat simplification as a *settlement suggestion*.
- **Multi-currency**: fix an exchange rate at expense time and store the group's base-currency equivalent; never re-convert historical entries.
- **Recurring expenses** (rent, subscriptions): a template object materializes dated expense instances on a schedule.

### Key takeaway
Splitwise LLD uses Strategy patterns for expense calculation and greedy net-balance algorithms to simplify complex debt graphs into a minimal set of peer-to-peer payments.
