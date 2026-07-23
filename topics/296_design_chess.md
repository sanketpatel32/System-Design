# Design Chess

> **Category:** Low Level Design

---

LLD: model chess game.

### Requirements
- Board, pieces, players.
- Legal moves per piece type.
- Check, checkmate.
- Game state.

### Classes
```
class Piece:  # abstract
    color
    position
    is_legal_move(to) -> bool

class King, Queen, Rook, Bishop, Knight, Pawn(Piece): ...

class Board:
    cells[8][8]
    pieces[]
    move(piece, to)

class Player:
    color
    make_move()

class Game:
    board
    players[]
    current_turn
    state  # ACTIVE, CHECK, CHECKMATE, DRAW
```

### Move validation
- Per-piece rules (Knight L-shape, Bishop diagonal, etc.).
- Check own king isn't in check after move.
- Castling, en passant, promotion.

### Patterns
- **Strategy** (per piece for move validation).
- **State** (game state).

### Key takeaway
Chess LLD = Piece hierarchy (King, Queen, ...) + Board + Player + Game. Strategy per piece for
move validation. State pattern for game flow (active / check / checkmate).
