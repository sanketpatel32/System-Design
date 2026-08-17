"use client";

/**
 * ArchitectureMap — the center panel (spec §5.5, §5.6).
 *
 * Uses a layered auto-layout (computeLayout) so nodes never get squished
 * regardless of panel width. The SVG viewBox is derived from the layout's
 * actual extents, and `preserveAspectRatio` lets it scale fluidly.
 *
 * Unknown (unrevealed) nodes render as redacted silhouettes in their correct
 * topological position, so the player sees the *shape* of the hidden system.
 */

import { useState } from "react";
import type {
  GameCaseDefinition,
  GameSession,
  NodeId,
  ArchitectureNode,
} from "@/lib/game/domain/types";
import type { Result, GameRuleError, GameCommand } from "@/lib/game/domain/types";
import { selectArchitectureView } from "@/lib/game/domain/state/game-selectors";
import { computeLayout, type LaidOutNode } from "@/lib/game/domain/graph/layout";
import { UnknownNode } from "./UnknownNode";
import { NodeCard } from "./NodeCard";
import { NodeInspector } from "./NodeInspector";
import { ActionTray } from "./ActionTray";

type Dispatch = (command: GameCommand) => Result<GameSession, GameRuleError>;

interface Props {
  caseDef: GameCaseDefinition;
  session: GameSession;
  dispatch: Dispatch;
}

// Layout constants in "layout units" (scaled to the viewBox).
const NODE_W = 60;
const NODE_H = 70;
const PAD_X = 40;
const PAD_Y = 30;
const COL_GAP = 130;
const ROW_GAP = 92;

export function ArchitectureMap({ caseDef, session, dispatch }: Props) {
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null);

  const { changedNodeIds } = selectArchitectureView(session, caseDef);
  const changedSet = new Set(changedNodeIds);

  // Compute the layout from the FULL graph (so hidden nodes occupy their slot).
  const layout = computeLayout(session.currentArchitecture);
  const revealed = new Set(session.revealedNodeIds);

  // Map layout units → viewBox coords. x per column, y centered per column.
  const positioned = layout.nodes.map((ln) => ({
    ...ln,
    vbX: PAD_X + ln.column * COL_GAP,
    vbY: PAD_Y + ln.y * 0.92, // rows are in 100-unit steps; compress slightly
  }));

  const maxCol = Math.max(0, ...layout.nodes.map((n) => n.column));
  const vbWidth = PAD_X * 2 + maxCol * COL_GAP + NODE_W;
  const vbHeight = PAD_Y * 2 + layout.maxRows * ROW_GAP;

  // Edges between revealed-or-silhouette nodes (we draw all edges whose both
  // endpoints exist in the layout).
  const nodeByNodeId = new Map(positioned.map((p) => [p.node.id, p]));
  const edges = session.currentArchitecture.edges.filter(
    (e) => nodeByNodeId.has(e.source) && nodeByNodeId.has(e.target)
  );

  const selectedNode = selectedNodeId
    ? session.currentArchitecture.nodes.find((n) => n.id === selectedNodeId)
    : undefined;

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-xl border border-rule/80 bg-paper-2/60 p-2 shadow-inner"
        style={{ aspectRatio: `${vbWidth} / ${vbHeight}`, maxHeight: "340px" }}
      >
        <svg
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className="h-full w-full select-none"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="System architecture diagram"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="rgb(var(--accent-rgb))" />
            </marker>
            <marker
              id="arrow-rule"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="rgb(var(--ink-3-rgb))" />
            </marker>
            <pattern id="mapgrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="rgb(var(--rule-rgb) / 0.25)"
                strokeWidth="0.5"
              />
              <circle cx="24" cy="24" r="0.75" fill="rgb(var(--ink-3-rgb) / 0.2)" />
            </pattern>
          </defs>

          <rect width={vbWidth} height={vbHeight} fill="url(#mapgrid)" aria-hidden />

          {/* Edges */}
          {edges.map((edge) => {
            const src = nodeByNodeId.get(edge.source)!;
            const tgt = nodeByNodeId.get(edge.target)!;
            const x1 = src.vbX + NODE_W;
            const y1 = src.vbY + NODE_H / 2;
            const x2 = tgt.vbX;
            const y2 = tgt.vbY + NODE_H / 2;
            const midX = (x1 + x2) / 2;
            const touchedChanged =
              changedSet.has(edge.source) || changedSet.has(edge.target);
            return (
              <g key={edge.id}>
                {/* Background glow path for changed edges */}
                {touchedChanged && (
                  <path
                    d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2 - 4} ${y2}`}
                    fill="none"
                    stroke="rgb(var(--accent-rgb) / 0.3)"
                    strokeWidth={4}
                  />
                )}
                <path
                  d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2 - 4} ${y2}`}
                  fill="none"
                  stroke={
                    touchedChanged
                      ? "rgb(var(--accent-rgb))"
                      : "rgb(var(--rule-rgb))"
                  }
                  strokeWidth={1.8}
                  className={touchedChanged ? "animate-edge-flow" : undefined}
                  markerEnd={touchedChanged ? "url(#arrow)" : "url(#arrow-rule)"}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {positioned.map(({ node, vbX, vbY }) => {
            const isRevealed = revealed.has(node.id);
            if (!isRevealed) {
              return (
                <UnknownNode
                  key={node.id}
                  node={node}
                  x={vbX}
                  y={vbY}
                  width={NODE_W}
                  height={NODE_H}
                />
              );
            }
            return (
              <NodeCard
                key={node.id}
                node={node}
                x={vbX}
                y={vbY}
                width={NODE_W}
                height={NODE_H}
                isSelected={selectedNodeId === node.id}
                isChanged={changedSet.has(node.id)}
                onSelect={() => setSelectedNodeId(node.id)}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend & hints */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-1 text-[11px] text-ink-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-3 rounded border border-dashed border-accent bg-accent/15" />
            modified component
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-3 rounded border border-dashed border-rule bg-paper-3/60" />
            unrevealed
          </span>
        </div>
        <span className="text-ink-3/80 font-medium">Click component to inspect</span>
      </div>

      {/* Screen-reader text alternative */}
      <ul className="sr-only">
        {positioned.map(({ node }) => (
          <li key={node.id}>
            {revealed.has(node.id) ? `${node.label}, ${node.type}` : `${node.label}, unknown`}
            {changedSet.has(node.id) ? ", modified" : ""}
          </li>
        ))}
      </ul>

      {/* Inspector + actions */}
      {selectedNode ? (
        <NodeInspector
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
        />
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-rule/80 bg-paper-2/40 px-3 py-2.5 text-center text-xs text-ink-3">
          Select a component in the topology to inspect specs &amp; configuration.
        </div>
      )}

      <ActionTray
        caseDef={caseDef}
        session={session}
        dispatch={dispatch}
        selectedNodeId={selectedNodeId}
      />
    </div>
  );
}

/** Narrow the ArchitectureNode type for the card (avoids import churn). */
export type { ArchitectureNode, LaidOutNode };
