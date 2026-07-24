# Design Logger

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Logging Framework (like Log4j / SLF4J) supporting configurable log levels, Chain of Responsibility processing, and multi-sink appenders.

### System Requirements & Architecture
- Log levels: `DEBUG` $< 	ext{INFO} < 	ext{WARN} < 	ext{ERROR}`.
- Chain of Responsibility pattern to filter logs based on severity.
- Support multiple log appenders/sinks (Console, File, Database, Remote Socket).

### Chain of Responsibility Diagram
```
[ Log Request ] ---> [ InfoLogger ] ---> [ DebugLogger ] ---> [ ErrorLogger ]
                          |                   |                    |
                          v                   v                    v
                   [ Console Sink ]     [ File Sink ]       [ Database Sink ]
```

### Class Model & Responsibilities
| Class | Pattern Role | Key Methods |
|---|---|---|
| `AbstractLogger` | Chain Handler | `setNextLogger()`, `logMessage(level, message)` |
| `InfoLogger` | Concrete Handler | Handles `INFO` level logs and passes to next logger in chain. |
| `ErrorLogger` | Concrete Handler | Handles `ERROR` level logs and triggers immediate alerts/sinks. |
| `LogAppender` | Strategy Sink Interface | `append(formattedMessage)` (Implemented by `ConsoleAppender`, `FileAppender`). |

### Key takeaway
A logging framework design applies the Chain of Responsibility pattern to filter log severity levels dynamically, decoupling log processing from sink output appenders (`ConsoleAppender`, `FileAppender`).
