"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, Layers, ShieldAlert, ArrowRight } from "lucide-react";
import { CLIENT_TOPICS } from "@/lib/client-topics-index";
import { getAllCases } from "@/lib/game/infrastructure/static-case-repository";

interface Props {
  open: boolean;
  onClose: () => void;
}

const RESULTS_ID = "atlas-command-results";
const optionId = (index: number) => `${RESULTS_ID}-option-${index}`;

export function CommandSearchModal({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const topics = CLIENT_TOPICS;
  const cases = useMemo(() => getAllCases(), []);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of CLIENT_TOPICS) {
      map.set(t.category, (map.get(t.category) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      count,
    }));
  }, []);


  // Filter items matching query
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default suggestions: recent/popular topics + cases
      return [
        ...cases.map((c) => ({
          id: `case-${c.id}`,
          type: "case" as const,
          title: c.title,
          subtitle: `Incident Lab · ${c.difficulty}`,
          href: `/game/${c.slug}`,
        })),
        ...topics.slice(0, 5).map((t) => ({
          id: `topic-${t.id}`,
          type: "topic" as const,
          title: t.title,
          subtitle: `${t.category} · #${String(t.id).padStart(3, "0")}`,
          href: `/topics/${t.slug}`,
        })),
      ];
    }

    const matchedTopics = topics
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.takeaway && t.takeaway.toLowerCase().includes(q))
      )
      .slice(0, 8)
      .map((t) => ({
        id: `topic-${t.id}`,
        type: "topic" as const,
        title: t.title,
        subtitle: `${t.category} · #${String(t.id).padStart(3, "0")}`,
        href: `/topics/${t.slug}`,
      }));

    const matchedCases = cases
      .filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
          c.briefing.narrative.toLowerCase().includes(q)
      )
      .map((c) => ({
        id: `case-${c.id}`,
        type: "case" as const,
        title: c.title,
        subtitle: `Incident Lab · ${c.difficulty}`,
        href: `/game/${c.slug}`,
      }));

    const matchedCategories = categories
      .filter((cat) => cat.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((cat) => ({
        id: `cat-${cat.slug}`,
        type: "category" as const,
        title: cat.name,
        subtitle: `Category · ${cat.count} topics`,
        href: `/library?cat=${cat.slug}`,
      }));

    return [...matchedCases, ...matchedTopics, ...matchedCategories];
  }, [query, topics, cases, categories]);

  // Auto-focus input when opened; restore focus to the trigger when closed.
  useEffect(() => {
    if (open) {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      restoreFocusRef.current?.focus?.();
      restoreFocusRef.current = null;
    }
  }, [open]);

  // Keep the active option visible as the selection moves.
  useEffect(() => {
    if (!open) return;
    document
      .getElementById(optionId(selectedIndex))
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, open]);

  // Handle keyboard navigation inside modal
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (results.length > 0 ? (i + 1) % results.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (results.length > 0 ? (i - 1 + results.length) % results.length : 0));
      } else if (e.key === "Enter" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (results[selectedIndex]) {
          router.push(results[selectedIndex].href);
          onClose();
        }
      } else if (e.key === "Tab") {
        // Trap focus inside the dialog while it is open.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, selectedIndex, router, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 sm:pt-24 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-rule/80 bg-paper elev-lg shadow-2xl animate-modal-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search Atlas"
      >
        {/* Search Header */}
        <div className="relative flex items-center border-b border-rule/80 px-4 py-3">
          <Search size={18} className="text-ink-3 shrink-0" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={RESULTS_ID}
            aria-autocomplete="list"
            aria-activedescendant={results.length > 0 ? optionId(selectedIndex) : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search 300+ topics, incident cases, categories... (Esc to close)"
            className="ml-3 w-full bg-transparent text-base text-ink placeholder:text-ink-3 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-ink-3 hover:text-ink rounded-md"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length > 0 ? (
            <ul id={RESULTS_ID} role="listbox" aria-label="Search results" className="space-y-1">
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li
                    key={item.id}
                    id={optionId(idx)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div
                      onClick={() => {
                        router.push(item.href);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-3 text-left transition-colors ${
                        isSelected
                          ? "bg-accent/10 text-ink font-semibold border border-accent/30"
                          : "text-ink-2 hover:bg-paper-3/50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          item.type === "case"
                            ? "bg-accent/15 text-accent"
                            : item.type === "category"
                            ? "bg-ok/15 text-ok"
                            : "bg-paper-3 text-ink-2"
                        }`}>
                          {item.type === "case" ? (
                            <ShieldAlert size={16} />
                          ) : item.type === "category" ? (
                            <Layers size={16} />
                          ) : (
                            <BookOpen size={16} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-ink font-semibold">{item.title}</p>
                          <p className="truncate text-xs text-ink-3 font-medium">{item.subtitle}</p>
                        </div>
                      </div>
                      <ArrowRight
                        size={15}
                        className={`shrink-0 transition-transform ${
                          isSelected ? "translate-x-1 text-accent" : "opacity-0"
                        }`}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-8 text-center text-sm text-ink-3">
              No results found for &ldquo;<span className="font-semibold text-ink">{query}</span>&rdquo;
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between border-t border-rule/80 bg-paper-2/60 px-4 py-2 text-[11px] text-ink-3">
          <div className="flex items-center gap-3">
            <span><kbd className="rounded border border-rule bg-paper px-1 font-mono">↑</kbd> <kbd className="rounded border border-rule bg-paper px-1 font-mono">↓</kbd> navigate</span>
            <span><kbd className="rounded border border-rule bg-paper px-1 font-mono">↵</kbd> select</span>
            <span><kbd className="rounded border border-rule bg-paper px-1 font-mono">esc</kbd> close</span>
          </div>
          <span className="font-medium text-accent">System Design Atlas</span>
        </div>
      </div>
    </div>
  );
}
