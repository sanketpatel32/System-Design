# Design Library Management System

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Library Management System managing book cataloging, rack locations, member borrowing quotas, fine calculations, and hold reservations.

### System Requirements & Component Model
- Manage physical book items across library racks (`Book` vs `BookItem`).
- Track member borrowing limits (max 5 books for 14 days) and overdue fines.
- Support book search by title, author, subject, and publication date.

### Class Model Diagram
```
+-------------------+          +-------------------+          +-------------------+
|       Book        | 1     *  |     BookItem      | *     1  |       Rack        |
+-------------------+ --------> +-------------------+ --------> +-------------------+
| - isbn: string    |          | - barcode: string |          | - number: int     |
| - title: string   |          | - status: Status  |          | - location: string|
| - authors: List   |          | - price: double   |          +-------------------+
+-------------------+          +-------------------+
                                         |
                                         v (issued via)
                               +-------------------+
                               |     BookLending   |
                               +-------------------+
                               | - creationDate    |
                               | - dueDate         |
                               | - returnDate      |
                               +-------------------+
```

### Core Entity Specifications
| Class | Key Attributes | Core Responsibilities |
|---|---|---|
| `Book` | `isbn`, `title`, `authors`, `subject` | Metadata representation of a book title. |
| `BookItem` | `barcode`, `isReferenceOnly`, `status`, `rack` | Physical copy of a book in the library. |
| `Member` | `memberId`, `borrowedItems`, `totalFines` | Tracks member borrowing history and quota. |
| `FineService` | `dailyFineRate` | Calculates overdue fines based on elapsed days past due date. |

### Key takeaway
Library management LLD decouples conceptual metadata (`Book`) from physical inventory (`BookItem`), using strategy patterns for fine calculation and status management for loans.
