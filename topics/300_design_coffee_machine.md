# Design Coffee Machine

> **Category:** Low Level Design

---

LLD: model a coffee machine.

### Requirements
- Multiple beverages (coffee, latte, espresso).
- Ingredients (water, beans, milk).
- Dispense, restock.
- Detect insufficient ingredients.

### Classes
```
class CoffeeMachine:
    ingredients  # name -> quantity
    recipes  # name -> Recipe

class Recipe:
    name
    ingredients  # name -> required qty

class Ingredient:
    name
    quantity

class Beverage:  # output
    name

# Enums
class BeverageType: COFFEE, LATTE, ESPRESSO
```

### Operations
- `dispense(beverage_type)`:
  1. Look up recipe.
  2. Check all ingredients sufficient.
  3. If insufficient → error.
  4. Deduct ingredients.
  5. Return beverage.

- `restock(ingredient, qty)`: add to inventory.

### Patterns
- **Factory** for beverages.
- **Strategy** for recipe lookup (could plug in different menus).

### Concurrency
- Multiple users dispense simultaneously.
- Lock ingredient check + deduct.

### Key takeaway
Coffee machine LLD = CoffeeMachine + Recipe + Ingredient classes. Validate ingredients before
dispensing, deduct atomically. Factory for beverage creation. Lock for concurrent dispenses.
