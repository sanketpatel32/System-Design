# High Level Design vs Low Level Design

> **Category:** System Design Basics

---

Interviewers split design into two phases. Knowing where each begins and ends keeps your answer
focused.

### HLD (High Level Design)
Answers **"what are the pieces and how do they talk?"**
- Services (auth, feed, search, notification).
- Datastores (Postgres, Redis, Kafka, S3).
- External systems (CDN, payment gateway, email provider).
- Communication patterns (REST, gRPC, async events).
- Scalability strategy (load balancers, sharding, replicas).

### LLD (Low Level Design)
Answers **"how is each piece built internally?"**
- Classes / interfaces / abstract types.
- Design patterns (Strategy, Factory, Observer, State).
- Schema for tables, indexes, constraints.
- Concurrency model (threads, async, locks, queues).
- Algorithms inside hot paths.

### Diagram contrast
```
HLD:   [Client] --> [LB] --> [API Server] --> [DB]
                                |
                                +--> [Cache] --> [Queue] --> [Worker]

LLD:   class UrlShortener:
           - counter: AtomicCounter
           - encoder: Base62Encoder
           + shorten(longUrl) -> shortUrl
           + resolve(shortUrl) -> longUrl
```

### Where the interview spends time
- Rounds labeled **"System Design"** → mostly HLD with light LLD on one component.
- Rounds labeled **"Machine Coding" / "Object-Oriented Design"** → mostly LLD.

### Key takeaway
Lead with HLD to show big-picture thinking, then drop into LLD on the **one** component the
interviewer finds most interesting. Don't try to LLD everything in 45 minutes.
