# Design Snake and Ladder

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Snake and Ladder Board Game managing board cells, snakes, ladders, dice rolling, and turn-based player movement loops.

### System Requirements & Board Architecture
- 10 × 10 board grid (100 cells).
- Random placement of N snakes and M ladders.
- Support P players moving sequentially based on single/double dice rolls.

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
| `Jump` | `start`, `end` | Base class for `Snake` (start > end) and `Ladder` (start < end). |
| `Dice` | `count`, `random` | Generates random numbers between 1 and 6 × count. |

### Game Rules & Edge Cases
- **Exact finishing roll**: a player must land exactly on cell 100; overshooting either bounces back (100 − surplus) or forfeits the move — pick one rule and encode it in `MoveStrategy`.
- **Consecutive sixes**: classic rules grant another roll after a six, often with a three-sixes-cancels-the-turn cap; the turn loop must handle nested extra rolls.
- **Chained jumps**: landing on a ladder top whose cell is also a snake head should follow the chain — with a visited-set guard so a malicious board (snake↔ladder cycle) cannot infinite-loop.
- **Jump placement constraints**: a cell hosts at most one jump endpoint, snake heads ≠ cell 100, ladder tops must not coincide with snake heads — validated at board construction, not during play.

### Design Refinements
| Concern | Approach |
|---|---|
| **Deterministic replay** | Inject a seedable RNG so a game can be recorded and replayed exactly — invaluable for testing. |
| **Multi-dice** | `Dice(count)` already models n dice; sum rolls and treat doubles per house rules. |
| **Turn fairness** | A `Queue<Player>` rotates turns in O(1); skipping eliminated/finished players stays trivial. |
| **Online multiplayer** | Swap the in-process loop for an event log: `MoveApplied` events fold into per-client game state (event sourcing lite). |

### Testing Checklist
- Boundary rolls: 97 + 5, 99 + 1, 100 + 3 (bounce-back arithmetic).
- Snake-to-ladder chains and cycle detection.
- Two-player race to finish; winner halts the loop immediately.

### Key takeaway
Snake and Ladder LLD models board shortcuts as generic `Jump` objects (`Snake` and `Ladder`), driving game state cleanly via a queue-based player turn loop.
