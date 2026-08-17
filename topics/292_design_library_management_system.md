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

### Loan Lifecycle & State Rules
```
[AVAILABLE] --checkout--> [LOANED] --return--> [AVAILABLE]
     ^                         |                     ^
     |                    (member requests)          |
     |                         v                     |
     +------- hold fulfilled ---+---- reservation release ----+
```
- **Borrowing invariants**: a member may hold at most 5 active loans; reference-only items never leave the building; one member cannot hold two copies of the same ISBN.
- **Renewals**: allowed only if no pending hold on the title — renewing extends `dueDate` by a full period and counts against a renewal cap (typically 2).
- **Returns workflow**: scan barcode → validate lender → assess fine if overdue → transition item to `AVAILABLE` or route to the hold shelf if a reservation queue exists.

### Fines & Holds
| Rule | Implementation |
|---|---|
| **Fine accrual** | `max(0, days(returnDate − dueDate)) × dailyFineRate`, capped at item price; payments recorded as immutable ledger entries. |
| **Fine blocking** | Members with fines above a threshold cannot check out — enforced at checkout validation, not by rejecting returns (you always accept returns). |
| **Hold queue** | FIFO per title (not per copy); the first waiter gets the next returned copy, held at a pickup shelf with a 3-day collection window. |
| **Lost items** | After N days overdue, mark lost, bill replacement cost + processing fee, and transition member into a restricted state. |

### Search & Cataloging Notes
- **Search index**: title/author/subject inverted index (Elasticsearch-style) separate from the lending store — catalog reads and loan writes scale independently.
- **Barcodes as identity**: the barcode identifies the *physical copy* (`BookItem`), never the ISBN — scanning a different copy of the same title must not silently renew the wrong loan.
- **Multi-branch**: item location and hold routing need a branch dimension; a hold may accept "any branch" or "home branch only" as a policy flag.

### Key takeaway
Library management LLD decouples conceptual metadata (`Book`) from physical inventory (`BookItem`), using strategy patterns for fine calculation and status management for loans.
