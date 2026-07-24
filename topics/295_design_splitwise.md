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
| `PercentSplit` | Verifies sum of percentages equals $100\%$ | `PercentSplitStrategy` |

```
Debt Simplification Algorithm:
1. Compute net balance for every user (Credits - Debits).
2. Separate users into Debtors (net < 0) and Creditors (net > 0).
3. Greedily match maximum Debtor with maximum Creditor until all balances are zero.
```

### Key takeaway
Splitwise LLD uses Strategy patterns for expense calculation and greedy net-balance algorithms to simplify complex debt graphs into a minimal set of peer-to-peer payments.
