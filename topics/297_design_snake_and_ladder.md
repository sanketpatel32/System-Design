# Design Snake and Ladder

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Snake and Ladder Board Game managing board cells, snakes, ladders, dice rolling, and turn-based player movement loops.

### System Requirements & Board Architecture
- $10 	imes 10$ board grid ($100$ cells).
- Random placement of $N$ snakes and $M$ ladders.
- Support $P$ players moving sequentially based on single/double dice rolls.

### System Component Diagram
```
[ Game Loop Controller ] ---> [ Dice (Random 1-6) ]
           |
           v
[ Current Player Move ] ---> [ Board (Cells 1 to 100) ]
                                      |
                                      v (Check Jump Entity)
                           +----------+----------+
                           |                     |
                           v                     v
                       [ Snake ]             [ Ladder ]
                       (Head -> Tail)        (Bottom -> Top)
```

### Class Responsibilities
| Class | Attributes | Primary Responsibilities |
|---|---|---|
| `SnakeAndLadderGame` | `board`, `players`, `dice`, `winner` | Controls game loop, turn transitions, and win conditions. |
| `Board` | `size`, `jumps: Map<int, Jump>` | Holds grid cells and maps start positions to Snake/Ladder endpoints. |
| `Jump` | `start`, `end` | Base class for `Snake` ($start > end$) and `Ladder` ($start < end$). |
| `Dice` | `count`, `random` | Generates random numbers between $1$ and $6 	imes count$. |

### Key takeaway
Snake and Ladder LLD models board shortcuts as generic `Jump` objects (`Snake` and `Ladder`), driving game state cleanly via a queue-based player turn loop.
