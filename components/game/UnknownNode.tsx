"use client";

/**
 * UnknownNode — a redacted silhouette for nodes the player hasn't revealed (spec §4.5).
 * Rendered with subtle pulse hatch pattern and mystery icon badge.
 */

import type { ArchitectureNode } from "@/lib/game/domain/types";

interface Props {
  node: ArchitectureNode;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function UnknownNode({ node, x, y, width, height }: Props) {
  void node;
  return (
    <g transform={`translate(${x}, ${y})`} aria-hidden className="opacity-80 transition-opacity hover:opacity-100">
      <rect
        width={width}
        height={height}
        rx={10}
        fill="rgb(var(--paper-3-rgb) / 0.4)"
        stroke="rgb(var(--rule-rgb))"
        strokeWidth={1.4}
        strokeDasharray="4 4"
      />
      <circle
        cx={width / 2}
        cy={height / 2 - 6}
        r={11}
        fill="rgb(var(--paper-3-rgb))"
        stroke="rgb(var(--rule-rgb))"
        strokeWidth={1}
      />
      <text
        x={width / 2}
        y={height / 2 - 2}
        textAnchor="middle"
        fontSize={13}
        fontWeight={800}
        fill="rgb(var(--ink-3-rgb))"
      >
        ?
      </text>
      <text
        x={width / 2}
        y={height / 2 + 15}
        textAnchor="middle"
        fontSize={7.5}
        fontWeight={600}
        letterSpacing="0.05em"
        fill="rgb(var(--ink-3-rgb))"
      >
        UNKNOWN
      </text>
    </g>
  );
}

