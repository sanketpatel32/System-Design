import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="hero-texture mx-auto flex max-w-2xl flex-col items-center px-5 py-28 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-accent">
        Error 404
      </div>
      <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-4 text-lg text-ink-2">
        The topic you&apos;re looking for may have moved or never existed.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/library"
          className="lift inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-[rgb(var(--accent-ink-rgb))] elev-sm hover:elev-md"
        >
          Back to the library <ArrowRight size={16} />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-ink-3/30 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <Search size={15} /> Search from home
        </Link>
      </div>
    </div>
  );
}
