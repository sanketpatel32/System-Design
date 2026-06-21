# Design Snake and Ladder

> **Category:** Low Level Design

---

LLD: model Snake and Ladder game.

### Requirements
- Board (10x10 = 100 cells).
- Players.
- Snakes (head → tail).
- Ladders (bottom → top).
- Dice.

### Classes
```
class Board:
    size
    snakes[]  # head -> tail
    ladders[]  # bottom -> top

class Snake: head, tail
class Ladder: bottom, top

class Player: id, position

class Dice: roll() -> int (1-6)

class Game:
    board
    players[]
    current_player_index
    play_turn()
```

### Turn flow
1. Current player rolls dice.
2. Move position + roll.
3. If lands on snake head → teleport to tail.
4. If lands on ladder bottom → teleport to top.
5. Exact count to reach 100 to win.
6. Next player.

### Key takeaway
Snake and Ladder LLD = Board + Snakes/Ladders (teleport map) + Players + Dice + Game. Simple
state machine on turn.
