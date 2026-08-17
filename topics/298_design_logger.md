# Design Logger

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Logging Framework (like Log4j / SLF4J) supporting configurable log levels, Chain of Responsibility processing, and multi-sink appenders.

### System Requirements & Architecture
- Log levels: `DEBUG < INFO < WARN < ERROR`.
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

### Asynchronous Appending & Backpressure
A production logger never writes to disk on the caller's thread — formatting and I/O are offloaded to a background appender thread fed by a bounded queue:

```
[ Business Thread ] --> [ Bounded Queue ] --> [ Async Appender Thread ] --> Sink(s)
  (log() = enqueue         (drop policy)         (format + batch + flush)    File/Socket/DB
        only, ~ns)             |
                              +--> overflow? drop LOWEST severity first,
                                   increment a dropped-lines counter
```

- **Drop policy**: when the queue is full, discard `DEBUG`/`INFO` before `ERROR`, and log a final summary line ("dropped 4,312 messages") so silent gaps are detectable.
- **Shutdown hook**: flush the queue on JVM/process exit — losing the last error messages during a crash is exactly when you need them most.
- **Re-entrancy guard**: if the appender itself fails (disk full), it must not log the failure through itself — infinite recursion — but fall back to stderr.

### Log Level Semantics
| Level | Contract |
|---|---|
| `ERROR` | Something broke; a human may be paged. Action required. |
| `WARN` | Recoverable degradation (retries, fallbacks, near-threshold). Watch trend. |
| `INFO` | Business-significant lifecycle events (request served, job done). |
| `DEBUG` | Diagnostic detail for developers; off in production by default. |

### Design Pitfalls
- **String concatenation before the level check** wastes CPU formatting messages that are then filtered out — guard expensive calls or use lazy interpolation.
- **Logging sensitive data** (passwords, tokens, card numbers) violates compliance; redact at the appender, not by convention.
- **One global mutex** around file writes serializes all application threads; the async queue above is the standard cure.

### Key takeaway
A logging framework design applies the Chain of Responsibility pattern to filter log severity levels dynamically, decoupling log processing from sink output appenders (`ConsoleAppender`, `FileAppender`).
