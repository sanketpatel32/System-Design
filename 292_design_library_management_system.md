# Design Library Management System

> **Category:** Low Level Design

---

LLD: model a library.

### Requirements
- Books, members, librarians.
- Checkout, return, reserve.
- Fines for overdue.

### Classes
```
class Book:
    isbn
    title
    author
    status  # AVAILABLE, CHECKED_OUT, RESERVED

class BookItem:  # physical copy
    id
    book
    status

class Member:
    id
    name
    checked_out[]

class Librarian:
    add_book(), remove_book(), member_management()

class Library:
    catalog  # isbn -> Book
    items[]

class Loan:
    member
    item
    due_date
    returned_at
    fine
```

### Operations
- `checkout(member, item)`: validate, create loan, set status.
- `return(item)`: close loan, calculate fine if overdue.
- `reserve(member, book)`: queue for when available.
- `search(title/author)`: filter catalog.

### Patterns
- **Repository** for catalog.
- **Factory** for loan creation.

### Key takeaway
Library LLD = Book + BookItem (physical copy) + Member + Librarian + Loan classes. Loan tracks
checkout/return/fines. Reservation queue for unavailable books.
