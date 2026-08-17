"use client";

/**
 * NodeCard — a single revealed node rendered as an SVG group (spec §5.6).
 *
 * Rendered as an architecture chip with SVG component glyphs, state halos,
 * type badge, and modified indicator star. Visual state (selected / changed)
 * is conveyed by border weight + status indicators.
 */

import type { ArchitectureNode, ComponentType } from "@/lib/game/domain/types";

interface Props {
  node: ArchitectureNode;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  isChanged: boolean;
  onSelect: () => void;
}

export function NodeCard({
  node,
  x,
  y,
  width,
  height,
  isSelected,
  isChanged,
  onSelect,
}: Props) {
  const fill = isChanged
    ? "rgb(var(--accent-rgb) / 0.12)"
    : isSelected
    ? "rgb(var(--paper-rgb))"
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
      className="cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
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
      {/* Outer Glow / Halo when selected */}
      {isSelected && (
        <rect
          x={-5}
          y={-5}
          width={width + 10}
          height={height + 10}
          rx={14}
          fill="none"
          stroke="rgb(var(--accent-rgb) / 0.35)"
          strokeWidth={5}
          className="animate-pulse-slow"
          aria-hidden
        />
      )}

      {/* Main Node Card background */}
      <rect
        width={width}
        height={height}
        rx={10}
        fill={fill}
        stroke={stroke}
        strokeWidth={isSelected ? 2.2 : 1.4}
        strokeDasharray={isChanged ? "5 3" : undefined}
        className="transition-colors duration-150"
      />

      {/* Header Badge Circle */}
      <circle
        cx={width / 2}
        cy={20}
        r={12}
        fill={isSelected ? "rgb(var(--accent-rgb))" : "rgb(var(--accent-rgb) / 0.15)"}
        aria-hidden
      />

      {/* SVG Glyph inside badge circle */}
      <g transform={`translate(${width / 2 - 7}, 13)`} aria-hidden>
        <ComponentGlyph type={node.type} isSelected={isSelected} />
      </g>

      {/* Node Label */}
      <text
        x={width / 2}
        y={45}
        textAnchor="middle"
        fontSize={9.5}
        fontWeight={700}
        letterSpacing="-0.01em"
        fill="rgb(var(--ink-rgb))"
      >
        {truncate(node.label, 11)}
      </text>

      {/* Type Subtitle */}
      <text
        x={width / 2}
        y={58}
        textAnchor="middle"
        fontSize={7.5}
        fontWeight={500}
        fill="rgb(var(--ink-3-rgb))"
      >
        {truncate(node.type, 13)}
      </text>

      {/* Modified Star Badge */}
      {isChanged && (
        <g aria-hidden transform={`translate(${width - 8}, 4)`}>
          <circle cx={4} cy={4} r={6} fill="rgb(var(--accent-rgb))" />
          <text
            x={4}
            y={6.5}
            textAnchor="middle"
            fontSize={7}
            fontWeight={800}
            fill="rgb(var(--accent-ink-rgb))"
          >
            ★
          </text>
        </g>
      )}

      {/* Active Healthy Indicator Dot (Top Left) */}
      <circle
        cx={8}
        cy={8}
        r={3}
        fill={isChanged ? "rgb(var(--accent-2-rgb))" : "rgb(var(--ok-rgb))"}
        aria-hidden
      />
    </g>
  );
}

function ComponentGlyph({ type, isSelected }: { type: ComponentType; isSelected: boolean }) {
  const iconColor = isSelected ? "rgb(var(--accent-ink-rgb))" : "rgb(var(--accent-rgb))";

  switch (type) {
    case "client":
      return (
        <path
          d="M2 3h10v6H2z M1 11h12v1H1z"
          fill="none"
          stroke={iconColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case "database":
      return (
        <path
          d="M2 3c0-1.1 2.2-2 5-2s5 .9 5 2v8c0 1.1-2.2 2-5 2s-5-.9-5-2V3z M2 7c0 1.1 2.2 2 5 2s5-.9 5-2"
          fill="none"
          stroke={iconColor}
          strokeWidth="1.2"
        />
      );
    case "api-gateway":
      return (
        <path
          d="M7 1L13 4.5V11.5L7 15L1 11.5V4.5L7 1Z"
          fill="none"
          stroke={iconColor}
          strokeWidth="1.2"
        />
      );
    case "cache":
      return (
        <path
          d="M7 1L13 7L7 13L1 7Z M7 4v6"
          fill="none"
          stroke={iconColor}
          strokeWidth="1.2"
        />
      );
    case "queue":
      return (
        <path
          d="M1 4h12M1 8h12M1 12h12M10 2l3 2-3 2 M4 14l-3-2 3-2"
          fill="none"
          stroke={iconColor}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      );
    case "worker":
      return (
        <path
          d="M7 2a5 5 0 100 10 5 5 0 000-10z M7 5v4M5 7h4"
          fill="none"
          stroke={iconColor}
          strokeWidth="1.2"
        />
      );
    case "cdn":
      return (
        <path
          d="M7 1a6 6 0 100 12A6 6 0 007 1z M1 7h12 M7 1c2 2 2 10 0 12"
          fill="none"
          stroke={iconColor}
          strokeWidth="1.2"
        />
      );
    case "load-balancer":
      return (
        <path
          d="M2 3h10M7 3v8M3 13l4-2 4 2"
          fill="none"
          stroke={iconColor}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      );
    case "external-api":
      return (
        <path
          d="M3 10a3.5 3.5 0 01.7-6.9A4.5 4.5 0 0112 5a3 3 0 01.5 6H3z"
          fill="none"
          stroke={iconColor}
          strokeWidth="1.2"
        />
      );
    case "idempotency-store":
      return (
        <path
          d="M5 7a2 2 0 100-4 2 2 0 000 4z M5 7v6h4v-2h-2V7"
          fill="none"
          stroke={iconColor}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      );
    default:
      return (
        <circle
          cx={7}
          cy={7}
          r={5}
          fill="none"
          stroke={iconColor}
          strokeWidth="1.2"
        />
      );
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

