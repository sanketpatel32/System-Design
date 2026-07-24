"use client";

/**
 * UnknownNode — a redacted silhouette for nodes the player hasn't revealed
 * (spec §4.5: "represented as intentional silhouettes with labels such as
 * 'Unknown external dependency' rather than missing UI").
 */

import type { ArchitectureNode } from "@/lib/game/domain/types";

interface Props {
  node: ArchitectureNode;
  x: number;
  y: number;
}

export function UnknownNode({ node, x, y }: Props) {
  return (
    <g transform={`translate(${x}, ${y})`} aria-hidden>
      <rect
        width={120}
        height={44}
        rx={8}
        fill="rgb(var(--paper-3-rgb) / 0.6)"
        stroke="rgb(var(--rule-rgb))"
        strokeWidth={1.5}
        strokeDasharray="2 3"
      />
      <text
        x={60}
        y={20}
        textAnchor="middle"
        fontSize={10}
        fill="rgb(var(--ink-3-rgb))"
      >
        ?
      </text>
      <text
        x={60}
        y={34}
        textAnchor="middle"
        fontSize={9}
        fill="rgb(var(--ink-3-rgb))"
      >
        unknown
      </text>
    </g>
  );
}
