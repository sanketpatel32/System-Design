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

### Move Validation Pipeline
`ChessGame.makeMove()` runs an ordered guard chain — rejecting early keeps each rule testable in isolation:

1. **Turn guard**: only the player whose turn it is may move.
2. **Piece legality**: `piece.isValidMove(board, from, to)` (polymorphic — each subclass encodes its own geometry; `Knight` ignores blocking, sliders check path clearance).
3. **Special moves**: castling (king/rook unmoved, path empty, not through check), en passant (immediately after opponent's double pawn push), promotion (auto-queen default, explicit choice in APIs).
4. **Self-check guard**: apply the move to a scratch board and verify own king is not attacked — the step candidates forget.
5. **Commit**: update board, append to move log (source for undo/redo and threefold-repetition detection), toggle turn, evaluate check/checkmate/stalemate.

### Game End Detection
| State | Detection |
|---|---|
| **Checkmate** | In check AND no legal move exists (try every piece × every destination). |
| **Stalemate** | Not in check AND no legal move — a draw. |
| **Threefold repetition** | Same board position (with same side to move + castling/en-passant rights) thrice — needs a position-hash set from the move log. |
| **Fifty-move rule** | 50 moves without a pawn move or capture. |

### Engineering Notes
- **Board representation**: `Cell[8][8]` with piece objects is the interview-friendly choice; bitboards (64-bit masks per piece type) are the performance answer worth mentioning for move generation at scale.
- **Undo/redo**: command pattern — each move stores enough state (captured piece, prior castling rights, en-passant square) to revert atomically.
- **Serializing games**: log moves in algebraic notation (`Nf3`, `O-O`, `e8=Q`) rather than board snapshots — compact, replayable, and the basis of PGN files.

### Key takeaway
Chess LLD relies on object polymorphism for piece move validation (`Piece.canMove(board, start, end)`), isolating move rules while delegating turn control and checkmate evaluation to `ChessGame`.
