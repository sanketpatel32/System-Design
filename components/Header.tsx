"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-md">
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

        <nav aria-label="Primary" className="ml-auto flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink data-[active=true]:text-accent data-[active=true]:bg-accent/8"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
