# Functional Requirements

> **Category:** System Design Basics

---

Functional requirements describe **what the system must do** — the user-visible behaviors and
features. They answer *"if I do X, the system should respond with Y."*

### How to extract them
1. **List user types** (anonymous, registered, admin, service-to-service).
2. **List actions per user** (read feed, post tweet, follow, search).
3. **For each action, define**: input, output, error cases, permissions.

### Example — URL Shortener
| User | Action | Input | Output |
|------|--------|-------|--------|
| Anyone | Shorten | long URL | short URL |
| Anyone | Resolve | short URL | redirect to long URL |
| Owner  | Analytics | short URL | click count, referrers |
| Admin  | Disable | short URL | success |

### Read vs Write heavy?
- **Write-heavy** (Twitter post, logs) → optimize ingestion, queue + async.
- **Read-heavy** (feed, search) → cache aggressively, use replicas.

### Tips
- Keep the list **small** — 3-5 core features. Out-of-scope items become assumptions.
- Ask *"does the interviewer want me to include X?"* rather than guessing.
- Note explicit non-goals: "We will NOT support custom aliases in v1."

### Common mistake
Jumping to architecture before listing FRs. You'll design a chat system when they wanted a
notification system. Always **write the FRs down** before drawing.
