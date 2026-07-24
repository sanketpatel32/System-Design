import { describe, it, expect } from "vitest";
import {
  hashArchitecture,
  diffGraphs,
  withNode,
  withEdge,
  withoutNode,
  withoutEdge,
  findNode,
  nodeExists,
  edgesTouching,
} from "./graph-utils";
import type { ArchitectureGraph, ArchitectureNode, ArchitectureEdge } from "../types";

function sampleNode(id: string, label = id): ArchitectureNode {
  return {
    id,
    type: "service",
    label,
    position: { x: 0, y: 0 },
    visibility: "revealed",
    ownership: "baseline",
    config: {
      kind: "service",
      replicas: 3,
      baseCapacityRpsPerReplica: 80,
      baseLatencyMs: 40,
      timeoutMs: 2000,
      supportsIdempotency: false,
      idempotencyKeySource: "none",
    },
    capacity: { healthMultiplier: 1 },
    cost: { runtime: 1, oneOff: 0 },
    tags: ["a", "b"],
  };
}

function sampleEdge(id: string, source: string, target: string): ArchitectureEdge {
  return {
    id,
    source,
    target,
    protocol: "http",
    visibility: "revealed",
    tags: [],
  };
}

const baseGraph: ArchitectureGraph = {
  nodes: [sampleNode("a"), sampleNode("b")],
  edges: [sampleEdge("e1", "a", "b")],
};

describe("graph lookups", () => {
  it("finds a node by id", () => {
    expect(findNode(baseGraph, "a")?.label).toBe("a");
    expect(findNode(baseGraph, "missing")).toBeUndefined();
  });

  it("reports node existence", () => {
    expect(nodeExists(baseGraph, "a")).toBe(true);
    expect(nodeExists(baseGraph, "z")).toBe(false);
  });

  it("finds touching edges", () => {
    expect(edgesTouching(baseGraph, "a")).toHaveLength(1);
    expect(edgesTouching(baseGraph, "b")).toHaveLength(1);
    expect(edgesTouching(baseGraph, "c")).toHaveLength(0);
  });
});

describe("graph mutations are immutable", () => {
  it("withNode adds without mutating the original", () => {
    const next = withNode(baseGraph, sampleNode("c"));
    expect(next.nodes).toHaveLength(3);
    expect(baseGraph.nodes).toHaveLength(2);
  });

  it("withEdge adds without mutating the original", () => {
    const next = withEdge(baseGraph, sampleEdge("e2", "b", "a"));
    expect(next.edges).toHaveLength(2);
    expect(baseGraph.edges).toHaveLength(1);
  });

  it("withoutNode also drops touching edges", () => {
    const next = withoutNode(baseGraph, "a");
    expect(next.nodes.map((n) => n.id)).toEqual(["b"]);
    // edge e1 touched "a", so it must be gone
    expect(next.edges).toHaveLength(0);
  });

  it("withoutEdge removes only that edge", () => {
    const next = withoutEdge(baseGraph, "e1");
    expect(next.edges).toHaveLength(0);
    expect(next.nodes).toHaveLength(2);
  });
});

describe("hashArchitecture is stable and order-independent", () => {
  it("produces the same hash regardless of array order (spec §28 invariant 9)", () => {
    const g1: ArchitectureGraph = {
      nodes: [sampleNode("a"), sampleNode("b"), sampleNode("c")],
      edges: [
        sampleEdge("e1", "a", "b"),
        sampleEdge("e2", "b", "c"),
      ],
    };
    // Same content, different order.
    const g2: ArchitectureGraph = {
      nodes: [sampleNode("c"), sampleNode("a"), sampleNode("b")],
      edges: [
        sampleEdge("e2", "b", "c"),
        sampleEdge("e1", "a", "b"),
      ],
    };
    expect(hashArchitecture(g1)).toBe(hashArchitecture(g2));
  });

  it("changes hash when config changes", () => {
    const node = sampleNode("a"); // service config with replicas: 3
    const g1: ArchitectureGraph = { nodes: [node], edges: [] };
    const changed: ArchitectureNode = {
      ...node,
      config: {
        kind: "service",
        replicas: 5, // changed from 3
        baseCapacityRpsPerReplica: 80,
        baseLatencyMs: 40,
        timeoutMs: 2000,
        supportsIdempotency: false,
        idempotencyKeySource: "none",
      },
    };
    const g2: ArchitectureGraph = { nodes: [changed], edges: [] };
    expect(hashArchitecture(g1)).not.toBe(hashArchitecture(g2));
  });

  it("is key-order independent inside config objects", () => {
    // Two configs with the same values but different key insertion order.
    const nodeA = sampleNode("a");
    const nodeB: ArchitectureNode = {
      ...sampleNode("a"),
      config: {
        idempotencyKeySource: "none",
        supportsIdempotency: false,
        replicas: 3,
        baseCapacityRpsPerReplica: 80,
        baseLatencyMs: 40,
        timeoutMs: 2000,
        kind: "service",
      },
    };
    const g1: ArchitectureGraph = { nodes: [nodeA], edges: [] };
    const g2: ArchitectureGraph = { nodes: [nodeB], edges: [] };
    expect(hashArchitecture(g1)).toBe(hashArchitecture(g2));
  });
});

describe("diffGraphs", () => {
  it("reports added, removed, and changed nodes", () => {
    const current = {
      nodes: [
        sampleNode("a"),
        { ...sampleNode("b"), label: "changed" }, // changed
        sampleNode("c"), // added
      ],
      edges: [sampleEdge("e1", "a", "b")],
    };
    const diff = diffGraphs(baseGraph, current);
    expect(diff.addedNodeIds).toEqual(["c"]);
    expect(diff.changedNodeIds).toEqual(["b"]);
    expect(diff.removedNodeIds).toEqual([]);
  });

  it("reports removed nodes", () => {
    const current = { nodes: [sampleNode("a")], edges: [] };
    const diff = diffGraphs(baseGraph, current);
    expect(diff.removedNodeIds).toEqual(["b"]);
    expect(diff.removedEdgeIds).toEqual(["e1"]);
  });
});
