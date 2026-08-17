# Design Coffee Machine

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for an Automated Coffee Machine supporting diverse beverage recipes (`Espresso`, `Latte`, `Cappuccino`), customizable add-ons (Milk, Sugar), ingredient inventory management, and concurrent dispensing.

### System Requirements & Design Patterns
- Recipe customization using the **Decorator Design Pattern** (`BaseCoffee` + `MilkDecorator` + `SugarDecorator`).
- Inventory tracking for water, coffee beans, milk, and sugar.
- Concurrent dispensing channels with ingredient shortage alerts.

### Decorator Pattern Architecture
```
                     [ Coffee Interface ]
                     (+getCost(), +getIngredients())
                              ^
            +-----------------+-----------------+
            |                                   |
    [ PlainCoffee ]                   [ CoffeeDecorator ]
    (Base: $2.00)                     (+coffee: Coffee)
                                                ^
                              +-----------------+-----------------+
                              |                                   |
                      [ MilkDecorator ]                   [ SugarDecorator ]
                      (+$0.50)                            (+$0.20)
```

### Class Responsibilities
| Class | Role | Core Methods / Attributes |
|---|---|---|
| `Coffee` | Base interface | `getCost()`, `getIngredients()` |
| `Espresso` | Concrete base coffee | Base espresso cost and coffee bean requirement. |
| `CoffeeDecorator` | Abstract decorator | Wraps `Coffee` instance dynamically. |
| `IngredientInventory` | Inventory manager | `hasEnough(ingredient, qty)`, `deduct(ingredient, qty)` |

### Concurrent Dispensing & Ingredient Races
Two drinks brewed simultaneously can both pass a naive `hasEnough(milk, 1)` check and then double-drain the last unit of milk. Safe designs use one of:

| Approach | How It Works | Trade-off |
|---|---|---|
| **Coarse lock** | One mutex for the entire inventory during check + deduct. | Simple; serializes all drinks, kills throughput on multi-outlet machines. |
| **Per-ingredient semaphores** | Lock each ingredient touched by a recipe, acquired in a fixed global order. | Better parallelism; requires deadlock-free lock ordering discipline. |
| **Transactional reservation** | Reserve all ingredients atomically (single compare-and-swap structure), brew, then commit. | Most robust; slightly more bookkeeping. |

### Failure Modes & Operator Alerts
- **Mid-brew shortage**: ingredients are reserved *before* grinding starts, so a machine never runs dry halfway through a drink — the failure surfaces as a declined order with an apology voucher, not a half-cup.
- **Low-stock thresholds**: alerts fire at 20% remaining (per ingredient) so operators restock before stockouts, not after.
- **Cleaning cycle**: a `CleaningState` (analogous to a vending machine's maintenance mode) rejects orders while descaling runs, with a countdown display.
- **Stale beverage refusal**: milk past its temperature-log threshold is quarantined and the milk recipes disabled until serviced.

### Interview Extension Questions
- How would you add a **menu** that varies pricing by outlet location without rewriting decorators? *(Pricing strategy injected at composition time.)*
- How do you keep decorator stacks from exploding when add-ons combine? *(Decorators compose at runtime — that is the pattern's whole point versus subclass-per-combination.)*
- How would you make the machine **remotely observable**? *(Emit ingredient-level metrics and state transitions to a telemetry queue.)*

### Key takeaway
Coffee machine LLD applies the Decorator Pattern to dynamically compose customizable beverage options and prices without combinatorial class explosion, managing raw ingredient inventory via thread-safe counters.
