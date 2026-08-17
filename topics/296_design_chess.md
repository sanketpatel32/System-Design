# Design Chess

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a 2-Player Chess Game enforcing piece movement rules, turn management, check/checkmate detection, and move validation.

### System Requirements & Board Model
- 8 × 8 grid board representation.
- Piece polymorphism (`Pawn`, `Rook`, `Knight`, `Bishop`, `Queen`, `King`).
- Special moves: Castling, En Passant, Pawn Promotion.
- Game loop with turn switching and move history undo/redo log.

### Class Diagram Architecture
```
+-------------------+          +-------------------+          +-------------------+
|     ChessGame     | 1     1  |       Board       | 1    64  |       Cell        |
+-------------------+ --------> +-------------------+ --------> +-------------------+
| - board: Board    |          | - cells: Cell[][] |          | - row: int        |
| - players: Player[2]|        | + getCell(x,y)    |          | - col: int        |
| - turn: Color     |          +-------------------+          | - piece: Piece    |
| + makeMove(move)  |                                         +-------------------+
+-------------------+                                                   ^
                                                                        |
                                                              +-------------------+
                                                              |   Piece (Abstract)|
                                                              +-------------------+
                                                              | + isValidMove()   |
                                                              +-------------------+
                                                                ^  ^  ^  ^  ^  ^
                                                                |  |  |  |  |  |
                                                              [R][N][B][Q][K][P]
```

### Piece Polymorphism Specifications
| Piece Class | Movement Rules | Special Conditions |
|---|---|---|
| `Pawn` | 1 step forward (2 steps on first move), diagonal capture | En Passant, Promotion. |
| `Knight` | L-shaped jump (2 × 1 or 1 × 2) | Can jump over other pieces. |
| `Rook` | Horizontal / Vertical straight lines | Castling. |
| `King` | 1 step in any direction | Cannot move into check; Castling. |

### Key takeaway
Chess LLD relies on object polymorphism for piece move validation (`Piece.canMove(board, start, end)`), isolating move rules while delegating turn control and checkmate evaluation to `ChessGame`.
