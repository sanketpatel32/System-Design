import Link from "next/link";

const SECTIONS: { heading: string; links: { href: string; label: string }[] }[] =
  [
    {
      heading: "Study",
      links: [
        { href: "/library", label: "Library" },
        { href: "/flashcards", label: "Flashcards" },
        { href: "/dashboard", label: "Dashboard" },
      ],
    },
    {
      heading: "More",
      links: [
        { href: "/game", label: "Incident Lab" },
        { href: "https://github.com/sanketpatel32/System-Design", label: "GitHub" },
      ],
    },
  ];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-rule bg-paper-2/50">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Wordmark + blurb */}
          <div className="max-w-xs">
            <Link
              href="/"
              className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink"
              aria-label="Atlas — home"
            >
              Atlas
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                aria-hidden
              />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-ink-3">
              An interactive companion to 300 system design topics — read,
              track, drill, and debug production incidents in the lab.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            {SECTIONS.map((section) => (
              <nav key={section.heading} aria-label={section.heading}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
                  {section.heading}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-ink-2 transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-rule/60 pt-6 text-xs text-ink-3 sm:flex-row sm:items-center">
          <p>Progress saves to your browser — no account, no server.</p>
          <p className="flex items-center gap-2">
            <kbd className="kbd">/</kbd> search
            <span aria-hidden>·</span>
            <kbd className="kbd">⌘K</kbd> jump anywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
