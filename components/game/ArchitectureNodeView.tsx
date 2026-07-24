"use client";

/**
 * ArchitectureNodeView — a single revealed node in the SVG graph.
 *
 * Visual state (spec §5.6) is conveyed by shape/border/icon + text label, with
 * color as reinforcement only. `changed` nodes get a dashed accent border;
 * `selected` nodes get a ring.
 */

import type { ArchitectureNode } from "@/lib/game/domain/types";

const TYPE_GLYPH: Record<string, string> = {
  client: "▢",
  cdn: "◷",
  "api-gateway": "⬢",
  service: "◯",
  database: "▤",
  cache: " ◇",
  queue: "⇄",
  worker: "⚙",
  "external-api": "☁",
  "idempotency-store": "🔑",
  "load-balancer": "⇋",
};

interface Props {
  node: ArchitectureNode;
  x: number;
  y: number;
  isSelected: boolean;
  isChanged: boolean;
  onSelect: () => void;
}

export function ArchitectureNodeView({
  node,
  x,
  y,
  isSelected,
  isChanged,
  onSelect,
}: Props) {
  const accent = node.config.kind;
  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onSelect}
      className="cursor-pointer"
      role="button"
      aria-label={`${node.label}, ${node.type}${isChanged ? ", modified" : ""}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <rect
        width={120}
        height={44}
        rx={8}
        fill="rgb(var(--paper-2-rgb))"
        stroke={
          isSelected
            ? "rgb(var(--accent-rgb))"
            : isChanged
            ? "rgb(var(--accent-2-rgb))"
            : "rgb(var(--rule-rgb))"
        }
        strokeWidth={isSelected ? 2 : 1.5}
        strokeDasharray={isChanged ? "4 2" : undefined}
      />
      <text x={8} y={18} fontSize={11} fill="rgb(var(--ink-3-rgb))" aria-hidden>
        {TYPE_GLYPH[node.type] ?? "◯"}
      </text>
      <text
        x={22}
        y={27}
        fontSize={12}
        fontWeight={600}
        fill="rgb(var(--ink-rgb))"
      >
        {node.label.length > 16 ? node.label.slice(0, 15) + "…" : node.label}
      </text>
      {isChanged && (
        <circle cx={112} cy={8} r={3} fill="rgb(var(--accent-2-rgb))" aria-hidden />
      )}
      <data value={accent} />
    </g>
  );
}
