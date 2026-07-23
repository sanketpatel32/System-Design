# System Design Atlas

An **interactive study companion** to **300 system design topics** — search, read, track your progress, and drill yourself with flashcards. Built with Next.js, TypeScript, and Tailwind CSS, exported as a fast static site.

> Warm editorial theme · terracotta accent · Geist typography.

## ✨ Features

- **Library** — all 300 topics searchable by title/category, filterable by status and the 24 categories, with a `/` keyboard shortcut to jump to search.
- **Topic pages** — rendered Markdown with ASCII architecture diagrams (copy-to-clipboard), a sticky table of contents with scrollspy, and a per-topic reading-time estimate.
- **Progress tracking** — mark topics New / In progress / Done, save favorites, and see your stats on the dashboard. Everything is stored locally in your browser (no account, no server).
- **Flashcards** — spaced repetition built from every topic's "Key takeaway." Flip with `Space`, rate with `←`/`→`, and missed cards resurface sooner.
- **Dashboard** — overall completion ring, per-category progress bars, and recently viewed topics.
- **Fully static** — `next build` exports the whole site to `out/`, hostable on GitHub Pages or any static host.

## 🚀 Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Build a production static export:

```bash
npm run build    # outputs to out/
```

## 🧱 Tech stack

| Area        | Choice                                   |
| ----------- | ---------------------------------------- |
| Framework   | Next.js 14 (App Router, static export)   |
| Language    | TypeScript                               |
| Styling     | Tailwind CSS + CSS custom-property tokens |
| Markdown    | react-markdown + remark-gfm             |
| Icons       | lucide-react                             |
| Fonts       | Geist Sans & Geist Mono                  |
| Persistence | `localStorage` (no backend)              |

## 🗂️ Project structure

```
topics/                 # 300 markdown source files (001_*.md … 300_*.md)
000_list.md             # category-ordered index of every topic
app/                    # Next.js App Router pages (home, library, dashboard, flashcards, topics/[slug])
components/             # UI components (TopicCard, FlashcardDeck, DashboardView, …)
lib/content.ts          # parses topics/*.md into structured data
lib/progress.ts         # localStorage-backed progress store with cross-tab sync
tokens.css              # design tokens (color, type, spacing, motion)
tailwind.config.ts      # Tailwind config wired to the token system
```

Each topic markdown file follows a consistent structure:

```
# Title
> **Category:** Some Category
---
(intro)
### Section
…
```ASCII architecture diagram```
…
### Key takeaway
the one-liner to remember
```

## 📚 What's inside

300 topics across **24 categories**, in a deliberate learning order — from fundamentals (CAP, scalability, latency) through networking, databases, caching, distributed systems, and observability, all the way to full design problems (Twitter, Uber, Kafka, DynamoDB) and low-level design.

Open [`000_list.md`](000_list.md) for the complete hyperlinked table of contents.

## 🔗 Repository

Hosted at: <https://github.com/sanketpatel32/System-Design>

---

_Happy learning!_ 🎯
