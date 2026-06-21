# Design Logger

> **Category:** Low Level Design

---

LLD: model a logger framework.

### Requirements
- Log levels (DEBUG, INFO, WARN, ERROR).
- Multiple sinks (console, file, DB).
- Async.
- Formatting.

### Classes
```
class LogSubject:  # abstract
    log(message)

class LogObserver:  # abstract
    update(message)

class ConsoleSink(LogObserver): ...
class FileSink(LogObserver): ...
class DatabaseSink(LogObserver): ...

class Logger:
    observers[]
    log_level

class LogFactory:
    create_logger(config) -> Logger

class LogManager:
    get_logger(name) -> Logger  # singleton per name
```

### Patterns
- **Observer** (multiple sinks subscribe to log events).
- **Singleton** (LogManager).
- **Factory** (create logger).
- **Chain of responsibility** (log levels).

### Async
- Queue + worker thread.
- Don't block caller.

### Key takeaway
Logger LLD = Observer pattern (multiple sinks) + Singleton (LogManager) + Factory. Async via
queue + worker. Log levels filter what's emitted.
