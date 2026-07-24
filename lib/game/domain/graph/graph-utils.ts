/**
 * Architecture-graph helpers: pure lookups, mutations, diffing, and stable
 * hashing. No mutation touches its input — every function returns a new graph.
 *
 * Spec reference: §5.5 (architecture map), §28 invariants 9 & 12 (stable hash,
 * idempotent replay / unique-constraint semantics live in the simulation, but
 * the graph operations they depend on live here).
 */

import type {
  ArchitectureEdge,
  ArchitectureGraph,
  ArchitectureNode,
  NodeId,
  EdgeId,
} from "../types";

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function findNode(
  graph: ArchitectureGraph,
  id: NodeId
): ArchitectureNode | undefined {
  return graph.nodes.find((n) => n.id === id);
}

export function findEdge(
  graph: ArchitectureGraph,
  id: EdgeId
): ArchitectureEdge | undefined {
  return graph.edges.find((e) => e.id === id);
}

export function nodeExists(graph: ArchitectureGraph, id: NodeId): boolean {
  return graph.nodes.some((n) => n.id === id);
}

/** Edges whose source or target equals `id`. */
export function edgesTouching(
  graph: ArchitectureGraph,
  id: NodeId
): ArchitectureEdge[] {
  return graph.edges.filter((e) => e.source === id || e.target === id);
}

export function edgesOutOf(
  graph: ArchitectureGraph,
  id: NodeId
): ArchitectureEdge[] {
  return graph.edges.filter((e) => e.source === id);
}

export function edgesInto(
  graph: ArchitectureGraph,
  id: NodeId
): ArchitectureEdge[] {
  return graph.edges.filter((e) => e.target === id);
}

// ---------------------------------------------------------------------------
// Mutations (immutable — return new graphs)
// ---------------------------------------------------------------------------

export function withNode(
  graph: ArchitectureGraph,
  node: ArchitectureNode
): ArchitectureGraph {
  return { ...graph, nodes: [...graph.nodes, node] };
}

export function withEdge(
  graph: ArchitectureGraph,
  edge: ArchitectureEdge
): ArchitectureGraph {
  return { ...graph, edges: [...graph.edges, edge] };
}

export function withoutNode(
  graph: ArchitectureGraph,
  id: NodeId
): ArchitectureGraph {
  return {
    nodes: graph.nodes.filter((n) => n.id !== id),
    // Dropping a node also drops its edges — no dangling references.
    edges: graph.edges.filter((e) => e.source !== id && e.target !== id),
  };
}

export function withoutEdge(
  graph: ArchitectureGraph,
  id: EdgeId
): ArchitectureGraph {
  return { ...graph, edges: graph.edges.filter((e) => e.id !== id) };
}

/** Return a new node object with `config` replaced. */
export function replaceNodeConfig(
  node: ArchitectureNode,
  config: ArchitectureNode["config"]
): ArchitectureNode {
  return { ...node, config };
}

/** Deep clone a graph (mutations never leak back to the source). */
export function cloneGraph(graph: ArchitectureGraph): ArchitectureGraph {
  return structuredClone(graph);
}

// ---------------------------------------------------------------------------
// Diff (for "changed from baseline" highlighting)
// ---------------------------------------------------------------------------

export interface GraphDiff {
  addedNodeIds: NodeId[];
  removedNodeIds: NodeId[];
  changedNodeIds: NodeId[];
  addedEdgeIds: EdgeId[];
  removedEdgeIds: EdgeId[];
}

/**
 * Compare two graphs by id + serialized config. Used to highlight the player's
 * edits relative to the baseline. Node order is ignored.
 */
export function diffGraphs(
  baseline: ArchitectureGraph,
  current: ArchitectureGraph
): GraphDiff {
  const baseNodes = new Map(baseline.nodes.map((n) => [n.id, n]));
  const curNodes = new Map(current.nodes.map((n) => [n.id, n]));

  const addedNodeIds: NodeId[] = [];
  const removedNodeIds: NodeId[] = [];
  const changedNodeIds: NodeId[] = [];

  for (const [id, node] of curNodes) {
    const base = baseNodes.get(id);
    if (!base) {
      addedNodeIds.push(id);
    } else if (serializeNode(base) !== serializeNode(node)) {
      changedNodeIds.push(id);
    }
  }
  for (const id of baseNodes.keys()) {
    if (!curNodes.has(id)) removedNodeIds.push(id);
  }

  const baseEdges = new Set(baseline.edges.map((e) => e.id));
  const curEdges = new Set(current.edges.map((e) => e.id));
  const addedEdgeIds = [...curEdges].filter((id) => !baseEdges.has(id));
  const removedEdgeIds = [...baseEdges].filter((id) => !curEdges.has(id));

  return {
    addedNodeIds,
    removedNodeIds,
    changedNodeIds,
    addedEdgeIds,
    removedEdgeIds,
  };
}

// ---------------------------------------------------------------------------
// Stable hashing — key-order independent (spec §28 invariant 9)
// ---------------------------------------------------------------------------

/**
 * Produce a deterministic hash for an architecture graph. Two graphs that
 * describe the same system — even if their arrays are in different orders —
 * must hash identically. This is what makes simulation seeds deterministic
 * across save/reload and React re-renders.
 *
 * Implementation: canonical JSON (keys sorted, arrays sorted by stable key)
 * fed through FNV-1a 32-bit. FNV-1a is non-cryptographic but well-distributed
 * and dependency-free.
 */
export function hashArchitecture(graph: ArchitectureGraph): string {
  const canonical = JSON.stringify({
    nodes: graph.nodes
      .map(canonicalNode)
      .sort((a, b) => (a.__id < b.__id ? -1 : a.__id > b.__id ? 1 : 0)),
    edges: graph.edges
      .map(canonicalEdge)
      .sort((a, b) => (a.__id < b.__id ? -1 : a.__id > b.__id ? 1 : 0)),
  });
  return fnv1a(canonical);
}

/** Serialize a node into a key-sorted object tagged by id for stable ordering. */
function canonicalNode(node: ArchitectureNode): Record<string, unknown> & {
  __id: string;
} {
  return {
    __id: node.id,
    config: sortKeys(node.config),
    cost: sortKeys(node.cost),
    capacity: sortKeys(node.capacity),
    type: node.type,
    label: node.label,
    visibility: node.visibility,
    ownership: node.ownership,
    tags: [...node.tags].sort(),
    position: sortKeys(node.position),
  };
}

function canonicalEdge(edge: ArchitectureEdge): Record<string, unknown> & {
  __id: string;
} {
  return {
    __id: edge.id,
    source: edge.source,
    target: edge.target,
    protocol: edge.protocol,
    semantics: edge.semantics,
    timeoutMs: edge.timeoutMs,
    retryPolicy: edge.retryPolicy ? sortKeys(edge.retryPolicy) : undefined,
    visibility: edge.visibility,
    tags: [...edge.tags].sort(),
  };
}

/** Recursively sort object keys so JSON.stringify is deterministic. */
function sortKeys<T>(value: T): T {
  if (Array.isArray(value)) return value.map(sortKeys) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      out[k] = sortKeys((value as Record<string, unknown>)[k]);
    }
    return out as unknown as T;
  }
  return value;
}

function serializeNode(node: ArchitectureNode): string {
  return JSON.stringify(canonicalNode(node));
}

/** FNV-1a 32-bit, base36. Stable, dependency-free, good distribution. */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // FNV prime multiplication mod 2^32.
    hash = Math.imul(hash, 0x01000193);
  }
  // Force unsigned 32-bit, then base36.
  return (hash >>> 0).toString(36);
}
