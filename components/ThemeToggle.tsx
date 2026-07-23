"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Preference = "light" | "dark" | "system";

const KEY = "atlas:theme";

function resolve(pref: Preference): "light" | "dark" {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return pref;
}

function apply(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [pref, setPref] = useState<Preference>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as Preference | null) ?? "system";
    setPref(stored);
    setMounted(true);
  }, []);

  // Keep the DOM in sync with the resolved preference.
  useEffect(() => {
    if (!mounted) return;
    apply(resolve(pref));
    localStorage.setItem(KEY, pref);
  }, [pref, mounted]);

  // When following the system, react to OS theme changes live.
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => apply(resolve("system"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [pref]);

  // Cycle: system → light → dark → system.
  const next: Record<Preference, Preference> = {
    system: "light",
    light: "dark",
    dark: "system",
  };
  const label: Record<Preference, string> = {
    system: "Follow system theme",
    light: "Light theme",
    dark: "Dark theme",
  };
  const Icon = pref === "light" ? Sun : pref === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={() => setPref((p) => next[p])}
      aria-label={label[pref]}
      title={label[pref]}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink"
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch. */}
      {mounted ? <Icon size={17} /> : <Sun size={17} />}
    </button>
  );
}
