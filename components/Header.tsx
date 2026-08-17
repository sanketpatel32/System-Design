"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { CommandSearchModal } from "./CommandSearchModal";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/game", label: "Incident Lab" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-rule bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink"
            aria-label="Atlas — home"
          >
            <span className="flex items-center gap-1.5">
              Atlas
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                aria-hidden
              />
            </span>
          </Link>

          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ml-2 hidden items-center gap-2 rounded-xl border border-rule/80 bg-paper-2/70 px-3 py-1.5 text-xs text-ink-3 transition-colors hover:border-accent/40 hover:text-ink sm:flex"
            aria-label="Search Atlas (Cmd+K)"
          >
            <Search size={14} className="text-ink-3" />
            <span>Search 300+ topics &amp; cases...</span>
            <kbd className="ml-2 rounded border border-rule bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
              ⌘K
            </kbd>
          </button>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(item.href)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink data-[active=true]:text-accent data-[active=true]:bg-accent/10"
              >
                {item.label}
              </Link>
            ))}
            <div className="mx-1 h-5 w-px bg-rule" aria-hidden />
            <ThemeToggle />
          </nav>

          {/* Mobile controls */}
          <div className="ml-auto flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink"
            >
              <Search size={18} />
            </button>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <nav
            id="mobile-menu"
            aria-label="Mobile"
            className="border-t border-rule bg-paper md:hidden"
          >
            <ul className="mx-auto max-w-6xl px-5 py-2 sm:px-8">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-active={isActive(item.href)}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink data-[active=true]:text-accent data-[active=true]:bg-accent/10"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* Global Command Search Modal */}
      <CommandSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
