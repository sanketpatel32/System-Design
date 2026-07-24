"use client";

/**
 * ArchitectureNodeView — a single revealed node in the SVG graph.
 *
 * Visual state (spec §5.6) is conveyed by border style + icon + label, with
 * color as reinforcement only. `changed` nodes get a dashed accent border and
 * a dot marker; `selected` nodes get a ring. Each component type has a
 * distinct glyph so nodes are distinguishable beyond color.
 */

import type { ArchitectureNode } from "@/lib/game/domain/types";

const TYPE_GLYPH: Record<string, string> = {
  client: "▣",
  cdn: "◷",
  "api-gateway": "⬢",
  service: "◯",
  database: "▦",
  cache: "◇",
  queue: "⇄",
  worker: "⚙",
  "external-api": "☁",
  "idempotency-store": "⚿",
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
  const fill = isChanged
    ? "rgb(var(--accent-rgb) / 0.08)"
    : "rgb(var(--paper-2-rgb))";
  const stroke = isSelected
    ? "rgb(var(--accent-rgb))"
    : isChanged
    ? "rgb(var(--accent-2-rgb))"
    : "rgb(var(--rule-rgb))";

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
      {/* Selection ring (rendered behind the rect so it peeks out) */}
      {isSelected && (
        <rect
          x={-3}
          y={-3}
          width={126}
          height={50}
          rx={10}
          fill="none"
          stroke="rgb(var(--accent-rgb) / 0.25)"
          strokeWidth={6}
          aria-hidden
        />
      )}
      <rect
        width={120}
        height={44}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={isSelected ? 2 : 1.5}
        strokeDasharray={isChanged ? "5 3" : undefined}
      />
      <text x={9} y={19} fontSize={12} fill="rgb(var(--accent-2-rgb))" aria-hidden>
        {TYPE_GLYPH[node.type] ?? "◯"}
      </text>
      <text
        x={26}
        y={20}
        fontSize={10}
        fill="rgb(var(--ink-3-rgb))"
      >
        {node.type}
      </text>
      <text
        x={26}
        y={33}
        fontSize={12}
        fontWeight={600}
        fill="rgb(var(--ink-rgb))"
      >
        {truncate(node.label, 14)}
      </text>
      {isChanged && (
        <>
          <circle cx={110} cy={8} r={3.5} fill="rgb(var(--accent-2-rgb))" aria-hidden />
          <text x={110} y={11} fontSize={7} fill="rgb(var(--accent-ink-rgb))" textAnchor="middle" aria-hidden>
            ★
          </text>
        </>
      )}
    </g>
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
