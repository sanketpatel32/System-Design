/**
 * Action-effect applier. Interprets a declarative `ArchitectureMutation[]`
 * into concrete graph changes. Pure: returns a new graph, never mutates input.
 *
 * Spec reference: §8.8 (`ArchitectureMutation`), §12.2 (atomic apply).
 *
 * The reducer delegates to this so the mutation logic is testable in isolation
 * and the reducer stays focused on flow + resource accounting.
 */

import type {
  ArchitectureEdge,
  ArchitectureGraph,
  ArchitectureMutation,
  ArchitectureNode,
  ComponentConfig,
  DatabaseConfig,
  UniqueConstraint,
} from "../types";
import {
  cloneGraph,
  findNode,
  withEdge,
  withNode,
  withoutEdge,
  withoutNode,
} from "../graph/graph-utils";

let _edgeCounter = 0;
/** Stable id generator for edges added by actions (player-added edges). */
function nextEdgeId(): string {
  _edgeCounter += 1;
  return `pe_${Date.now().toString(36)}_${_edgeCounter}`;
}

/**
 * Apply a list of mutations to a graph. Throws if a mutation references a
 * missing node — the case validator should have caught this at load time, so
 * reaching this point means a bug in the case content or the action catalogue.
 */
export function applyMutations(
  graph: ArchitectureGraph,
  mutations: ArchitectureMutation[]
): ArchitectureGraph {
  let next = cloneGraph(graph);
  for (const mutation of mutations) {
    next = applyOne(next, mutation);
  }
  return next;
}

function applyOne(
  graph: ArchitectureGraph,
  mutation: ArchitectureMutation
): ArchitectureGraph {
  switch (mutation.type) {
    case "set-config": {
      const node = requireNode(graph, mutation.nodeId);
      const newConfig = setPath(node.config, mutation.path, mutation.value);
      const newNode: ArchitectureNode = { ...node, config: newConfig };
      return replaceNode(graph, newNode);
    }

    case "add-node": {
      const fullNode: ArchitectureNode = {
        ...mutation.node,
        ownership: "player-added",
      };
      return withNode(graph, fullNode);
    }

    case "remove-node":
      return withoutNode(graph, mutation.nodeId);

    case "add-edge": {
      const edge: ArchitectureEdge = {
        ...mutation.edge,
        id: nextEdgeId(),
      };
      return withEdge(graph, edge);
    }

    case "remove-edge":
      return withoutEdge(graph, mutation.edgeId);

    case "add-unique-constraint": {
      const node = requireNode(graph, mutation.nodeId);
      if (node.config.kind !== "database") {
        throw new Error(
          `add-unique-constraint targeted non-database node "${mutation.nodeId}" (kind=${node.config.kind})`
        );
      }
      const dbConfig: DatabaseConfig = {
        ...node.config,
        uniqueConstraints: [
          ...node.config.uniqueConstraints,
          { ...mutation.constraint, enabled: true },
        ],
      };
      return replaceNode(graph, { ...node, config: dbConfig });
    }

    case "enable-unique-constraint": {
      const node = requireNode(graph, mutation.nodeId);
      if (node.config.kind !== "database") {
        throw new Error(
          `enable-unique-constraint targeted non-database node "${mutation.nodeId}"`
        );
      }
      const dbConfig: DatabaseConfig = {
        ...node.config,
        uniqueConstraints: node.config.uniqueConstraints.map((uc) =>
          uc.id === mutation.constraintId ? { ...uc, enabled: true } : uc
        ),
      };
      return replaceNode(graph, { ...node, config: dbConfig });
    }
  }
}

/** Set a value at a dotted path inside a config object (immutable). */
function setPath<T extends ComponentConfig>(
  config: T,
  path: string[],
  value: unknown
): T {
  if (path.length === 0) return config;
  const [head, ...rest] = path;
  const current = (config as Record<string, unknown>)[head];
  const nextValue =
    rest.length === 0 ? value : setPathRecord(current, rest, value);
  return { ...config, [head]: nextValue } as T;
}

function setPathRecord(
  current: unknown,
  path: string[],
  value: unknown
): unknown {
  const [head, ...rest] = path;
  const obj = (typeof current === "object" && current !== null
    ? current
    : {}) as Record<string, unknown>;
  const nextValue =
    rest.length === 0 ? value : setPathRecord(obj[head], rest, value);
  return { ...obj, [head]: nextValue };
}

function replaceNode(
  graph: ArchitectureGraph,
  node: ArchitectureNode
): ArchitectureGraph {
  return {
    ...graph,
    nodes: graph.nodes.map((n) => (n.id === node.id ? node : n)),
  };
}

function requireNode(
  graph: ArchitectureGraph,
  id: string
): ArchitectureNode {
  const node = findNode(graph, id);
  if (!node) {
    throw new Error(`mutation references missing node "${id}"`);
  }
  return node;
}

/** Read the unique constraints on a database node (helper for the simulation). */
export function getUniqueConstraints(
  graph: ArchitectureGraph,
  nodeId: string
): UniqueConstraint[] {
  const node = findNode(graph, nodeId);
  if (!node || node.config.kind !== "database") return [];
  return node.config.uniqueConstraints.filter((uc) => uc.enabled);
}
