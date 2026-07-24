"use client";

/**
 * ArchitectureMap — the center panel (spec §5.5, §5.6).
 *
 * Renders the system graph as a fixed SVG layout (no React Flow; the tutorial
 * topology is known). Nodes carry visual states via shape + text + color (never
 * color alone — spec §5.6). Unknown nodes appear as redacted silhouettes.
 *
 * During simulation playback, request pulses animate along edges; the map only
 * reads precomputed frames, never recalculates (spec §15.4).
 */

import { useState } from "react";
import type {
  GameCaseDefinition,
  GameSession,
  NodeId,
} from "@/lib/game/domain/types";
import type { Result, GameRuleError, GameCommand } from "@/lib/game/domain/types";
import { selectArchitectureView } from "@/lib/game/domain/state/game-selectors";
import { UnknownNode } from "./UnknownNode";
import { ArchitectureNodeView } from "./ArchitectureNodeView";
import { NodeInspector } from "./NodeInspector";
import { ActionTray } from "./ActionTray";

type Dispatch = (command: GameCommand) => Result<GameSession, GameRuleError>;

interface Props {
  caseDef: GameCaseDefinition;
  session: GameSession;
  dispatch: Dispatch;
}

export function ArchitectureMap({ caseDef, session, dispatch }: Props) {
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null);
  const { nodes, changedNodeIds } = selectArchitectureView(session, caseDef);
  const changedSet = new Set(changedNodeIds);

  const edges = session.currentArchitecture.edges.filter(
    (e) =>
      session.revealedNodeIds.includes(e.source) &&
      session.revealedNodeIds.includes(e.target)
  );
  const nodeIndex = new Map(nodes.map((n) => [n.id, n]));
  const selectedNode = selectedNodeId
    ? session.currentArchitecture.nodes.find((n) => n.id === selectedNodeId)
    : undefined;

  return (
    <div>
      <svg
        viewBox="0 0 1080 200"
        className="w-full"
        style={{ minHeight: "180px" }}
        role="img"
        aria-label="System architecture diagram"
      >
        {/* Edges */}
        {edges.map((edge) => {
          const src = nodeIndex.get(edge.source);
          const tgt = nodeIndex.get(edge.target);
          if (!src || !tgt) return null;
          return (
            <line
              key={edge.id}
              x1={src.x + 40}
              y1={src.y + 20}
              x2={tgt.x}
              y2={tgt.y + 20}
              stroke="rgb(var(--rule-rgb))"
              strokeWidth={1.5}
              markerEnd="url(#arrow)"
            />
          );
        })}

        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(var(--ink-3-rgb))" />
          </marker>
        </defs>

        {/* Nodes */}
        {nodes.map((n) => {
          const caseNode = session.currentArchitecture.nodes.find((x) => x.id === n.id)!;
          const isHidden =
            n.visibility === "hidden" ||
            (n.visibility === "silhouette" && !session.revealedNodeIds.includes(n.id));
          if (isHidden) {
            return (
              <UnknownNode
                key={n.id}
                node={caseNode}
                x={caseNode.position.x}
                y={caseNode.position.y}
              />
            );
          }
          return (
            <ArchitectureNodeView
              key={n.id}
              node={caseNode}
              x={caseNode.position.x}
              y={caseNode.position.y}
              isSelected={selectedNodeId === n.id}
              isChanged={changedSet.has(n.id)}
              onSelect={() => setSelectedNodeId(n.id)}
            />
          );
        })}
      </svg>

      {/* Text alternative for screen readers (spec §16) */}
      <ul className="sr-only">
        {nodes.map((n) => (
          <li key={n.id}>
            {n.label} — {n.visibility === "revealed" ? n.type : "unknown"}
            {changedSet.has(n.id) ? " (changed)" : ""}
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
        <div className="mt-2 rounded-lg border border-dashed border-rule bg-paper/40 px-3 py-2 text-center text-xs text-ink-3">
          Select a node to inspect it, or choose an action below.
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
