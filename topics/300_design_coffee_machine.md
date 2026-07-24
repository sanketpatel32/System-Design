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

### Key takeaway
Coffee machine LLD applies the Decorator Pattern to dynamically compose customizable beverage options and prices without combinatorial class explosion, managing raw ingredient inventory via thread-safe counters.
