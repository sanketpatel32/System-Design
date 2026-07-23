"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function DiagramBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      // silent success — no toast. Reset the icon after 1.5s.
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — fail quietly */
    }
  }

  return (
    <figure className="my-5 overflow-hidden rounded-xl border border-rule bg-paper-2 elev-sm">
      <figcaption className="flex items-center justify-between border-b border-rule bg-paper-3/50 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-3">
          diagram
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy diagram"}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs text-ink-3 transition-colors hover:text-accent data-[on=true]:text-ok"
          data-on={copied}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "copied" : "copy"}
        </button>
      </figcaption>
      <pre className="diagram p-4">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
