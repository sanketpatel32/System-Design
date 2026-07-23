# Design — System Design Atlas

A locked design system for this app. Every page reads this file before
emitting code. Warm editorial register — a well-made study guide, not a
corporate SaaS dashboard and not a terminal cosplay.

## Genre
modern-minimal (warm editorial variant)

## Macrostructure family
- Home:      clean editorial dashboard — hero + stat row + roadmap list
- Library:   filterable grid, content-led
- Topic:     Long Document — reading-first, generous measure, diagram panels inline
- Flashcards: single-focus card stage
- Dashboard: stat grid + per-category bars

Pages within a family share the family's shape; they vary only in component
archetypes. No "hacker" theming anywhere.

## Theme (warm editorial — light canvas)
```
--color-paper     oklch(98% 0.008 75)   warm off-white, like aged paper
--color-paper-2   oklch(96% 0.010 75)   slightly deeper, for cards
--color-paper-3   oklch(93% 0.012 75)   hover / inset surfaces
--color-ink       oklch(28% 0.015 60)   warm near-black (NOT pure black)
--color-ink-2     oklch(48% 0.012 60)   secondary text
--color-ink-3     oklch(62% 0.010 60)   muted / captions
--color-rule      oklch(90% 0.010 75)   hairline borders
--color-accent    oklch(60% 0.140 42)   terracotta — the warm signal
--color-accent-2  oklch(52% 0.130 42)   terracotta hover
--color-accent-ink oklch(99% 0.010 75)  text-on-accent (near-white)
--color-focus     oklch(60% 0.140 42)
--color-warn      oklch(62% 0.120 65)   amber, for "in progress"
--color-ok        oklch(58% 0.110 150)  sage green, for "done"
```
Accent placement: throughout — primary buttons, active nav, links, progress
bars, category tags, section markers, focus rings, icons. The terracotta IS
the personality. Keep backgrounds warm-neutral; never flood a surface with it.

## Typography
- Display: Geist Sans, weight 600–700, tracking -0.02em, roman (never italic)
- Body:    Geist Sans, weight 400, line-height 1.65
- Mono:    Geist Mono, weight 400 — ONLY for ASCII diagrams and code blocks,
           never for headings or nav
- Type scale anchor: --text-display = clamp(2.5rem, 6vw, 4rem)

## Spacing
4-point named scale in tokens.css. Pages use named tokens, never raw values.

## Motion
- Easings: --ease-out cubic-bezier(0.16,1,0.3,1); never browser `ease`
- Reveal: none — the page is composed, not animated in
- Transitions: color/opacity/border-color only, ≤200ms
- Reduced-motion: opacity-only, ≤150ms

## Microinteractions stance
- Silent success (copy-to-clipboard shows a checkmark, no toast)
- Hover transitions on color only
- No celebratory animations

## CTA voice
- Primary: filled terracotta, near-white text, 8px radius, weight 600
- Secondary: outlined (1px ink-3 border), ink text, transparent fill

## What pages MUST share
- The wordmark: "Atlas" with a small terracotta dot
- Terracotta accent + warm paper canvas
- Geist Sans throughout, Geist Mono only in code/diagrams
- CTA voice (terracotta-fill primary, outlined secondary)
- Section rhythm: small uppercase label → display heading → body

## What pages MAY differ on
- Layout within the family (home dashboard vs library grid vs topic document)
- Which accent treatment a card uses (terracotta tag vs terracotta left-border)

## Exports
See tokens.css at project root for the canonical values.
