import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-28 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        404
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-4 text-lg text-ink-2">
        The topic you&apos;re looking for may have moved or never existed.
      </p>
      <Link
        href="/library"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-[rgb(var(--accent-ink-rgb))] transition-colors hover:bg-accent-2"
      >
        Back to the library
      </Link>
    </div>
  );
}
