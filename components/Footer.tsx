import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-rule">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="flex items-center gap-1.5">
          Atlas
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
            aria-hidden
          />
          <span className="text-ink-2">
            an interactive companion to 300 system design topics
          </span>
        </p>
        <p>
          progress saves to your browser ·{" "}
          <Link href="/library" className="underline underline-offset-2">
            browse all
          </Link>
        </p>
      </div>
    </footer>
  );
}
