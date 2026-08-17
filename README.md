# System Design Atlas

[![Topics](https://img.shields.io/badge/topics-300-7c4a2d?style=flat-square)](000_list.md)
[![Categories](https://img.shields.io/badge/categories-24-7c4a2d?style=flat-square)](000_list.md)
[![Next.js](https://img.shields.io/badge/Next.js-14-000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](#-license)

An **interactive study companion** to **300 system design topics** — search, read, track your progress, and drill yourself with flashcards. Built with Next.js, TypeScript, and Tailwind CSS, exported as a fast static site.

> Warm editorial theme · terracotta accent · Geist typography · light & dark mode.

---

## ✨ Features

- **🗂️ Library** — all 300 topics searchable by title/category, filterable by status and the 24 categories. Hit <kbd>/</kbd> anywhere to jump straight to search.
- **📖 Topic pages** — rendered Markdown with **ASCII architecture diagrams** (copy-to-clipboard), a sticky table of contents with scrollspy, and a per-topic reading-time estimate.
- **📊 Progress tracking** — mark topics **New / In progress / Done**, save favorites, and see your stats on the dashboard. Everything is stored locally in your browser (no account, no server).
- **🃏 Flashcards** — spaced repetition built from every topic's "Key takeaway." Flip with <kbd>Space</kbd>, rate with <kbd>←</kbd>/<kbd>→</kbd>, and missed cards resurface sooner.
- **📈 Dashboard** — overall completion ring, per-category progress bars, and recently viewed topics.
- **🎲 Surprise me** — jump to a random topic when you're not sure what to study next.
- **🔬 Incident Lab** — an interactive system-design detective game. Inherit a failing production system, uncover its hidden architecture from evidence, form a root-cause hypothesis, change the design, and run a deterministic simulation to see if your fix holds — or creates new failures. The first case, *Ghost Orders at Midnight*, teaches idempotency, retry semantics, and timeout ambiguity through play.
- **🌙 Dark mode** — respects system preference, with a manual toggle that persists across sessions.
- **⚡ Fully static** — `next build` exports the whole site to `out/`, hostable on GitHub Pages or any static host. No backend required.

## ⌨️ Keyboard shortcuts

| Shortcut       | Action                          |
| -------------- | ------------------------------- |
| <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> | Global search across all 300+ topics & incident cases |
| <kbd>/</kbd>   | Focus search input |
| <kbd>Space</kbd> | Flip flashcard |
| <kbd>←</kbd> / <kbd>→</kbd> | Rate flashcard as missed / known |
| <kbd>E</kbd> / <kbd>A</kbd> / <kbd>O</kbd> | Switch panels in Incident Lab (Evidence / Architecture Map / Ops Console) |

## 🚀 Quick start

### One-Click Windows Launcher Scripts
- Double-click **`dev.cmd`** to launch the local development server (`http://localhost:3000`).
- Double-click **`build.cmd`** to run all typechecks, test suite, and build the static production output.

### Command Line
```bash
npm run dev        # Launch local dev server at http://localhost:3000
npm run check      # Run TypeScript typechecks + full unit test suite
npm run build      # Build static production bundle
npm run preview    # Build and start local preview server
```

## 🌐 Hosting & Deployment Options

### 1. Vercel (Recommended — Free & 1-Click)
Vercel is built by the creators of Next.js and provides zero-config automatic deployments:
1. Push your repository to GitHub / GitLab.
2. Import the project on [Vercel](https://vercel.com).
3. Vercel automatically detects Next.js, runs `npm run build`, and deploys your site to a global CDN.

### 2. GitHub Pages (Free Static Hosting)
1. Run `npm run build` to generate the production static bundle.
2. Deploy the `out/` directory to your repository's `gh-pages` branch.
3. Enable GitHub Pages in Repository Settings pointing to `gh-pages`.

### 3. Netlify / Cloudflare Pages / Render
- **Build Command**: `npm run build`
- **Publish Directory**: `out` (or `.next` if using Node server mode)

## 🧱 Tech stack

| Area        | Choice                                    |
| ----------- | ----------------------------------------- |
| Framework   | Next.js 14 (App Router, static export)    |
| Language    | TypeScript                                |
| Styling     | Tailwind CSS + CSS custom-property tokens |
| Markdown    | react-markdown + remark-gfm               |
| Icons       | lucide-react                              |
| Fonts       | Geist Sans & Geist Mono                   |
| Persistence | `localStorage` (no backend)               |

## 🗂️ Project structure

```
topics/                 # 300 markdown source files (001_*.md … 300_*.md)
000_list.md             # category-ordered index of every topic
app/                    # Next.js App Router pages
├─ page.tsx             #   home (hero, stats, roadmap)
├─ library/page.tsx     #   searchable/filterable topic browser
├─ dashboard/page.tsx   #   progress ring + category bars
├─ flashcards/page.tsx  #   spaced-repetition deck
└─ topics/[slug]/       #   rendered topic page
components/             # UI components (TopicCard, FlashcardDeck, DashboardView, …)
lib/
├─ content.ts           # parses topics/*.md into structured data
└─ progress.ts          # localStorage-backed progress store (cross-tab sync)
tokens.css              # design tokens (color, type, spacing, motion)
tailwind.config.ts      # Tailwind config wired to the token system
```

Each topic markdown file follows a consistent structure:

````markdown
# Title
> **Category:** Some Category
---
(intro)
### Section
…
```text
ASCII architecture diagram
```
…
### Key takeaway
the one-liner to remember
````

## 📚 What's inside

300 topics across **24 categories**, in a deliberate learning order — from fundamentals (CAP, scalability, latency) through networking, databases, caching, distributed systems, and observability, all the way to full design problems (Twitter, Uber, Kafka, DynamoDB) and low-level design.

Open [`000_list.md`](000_list.md) for the complete hyperlinked table of contents.

### Category roadmap

1. System Design Basics
2. Back-of-the-Envelope Estimation
3. Networking Basics
4. … through databases, caching, messaging, observability, design problems, and LLD.

See the full 24-category breakdown on the [home page roadmap](app/page.tsx) or in [`000_list.md`](000_list.md).

## 🌐 Deploy to GitHub Pages

Because the site is a static export, GitHub Pages is a natural host:

1. Run `npm run build` to generate the `out/` directory.
2. Push the contents of `out/` to a `gh-pages` branch (or use a GitHub Action that runs the build and deploys automatically).
3. Enable Pages in your repo settings, pointing at the `gh-pages` branch.

> **Note:** since `next.config.mjs` sets `trailingSlash: true`, all routes resolve cleanly under GitHub Pages' project subpath.

## 🤝 Contributing

Found a typo or want to improve a topic? PRs are welcome.

1. Fork the repo and create a branch (`git checkout -b improve/xyz`).
2. Make your changes — topic edits live in `topics/*.md`.
3. Run `npm run lint` and `npm run build` to make sure everything still works.
4. Open a pull request describing what you changed.

## 📄 License

Released under the **MIT License**. See the repo for details.

## 🔗 Repository

Hosted at: <https://github.com/sanketpatel32/System-Design>

---

_Happy learning!_ 🎯
