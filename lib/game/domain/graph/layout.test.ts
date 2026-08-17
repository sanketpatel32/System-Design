import { describe, it, expect } from "vitest";
import { computeLayout } from "./layout";
import type { ArchitectureGraph } from "../types";

function node(id: string): ArchitectureGraph["nodes"][number] {
  return {
    id,
    type: "service",
    label: id,
    position: { x: 0, y: 0 },
    visibility: "revealed",
    ownership: "baseline",
    config: { kind: "generic" },
    capacity: { healthMultiplier: 1 },
    cost: { runtime: 0, oneOff: 0 },
    tags: [],
  };
}

function edge(id: string, source: string, target: string): ArchitectureGraph["edges"][number] {
  return { id, source, target, protocol: "http", visibility: "revealed", tags: [] };
}

describe("computeLayout", () => {
  it("assigns roots to column 0", () => {
    const g: ArchitectureGraph = {
      nodes: [node("a"), node("b")],
      edges: [edge("e1", "a", "b")],
    };
    const layout = computeLayout(g);
    const a = layout.nodes.find((n) => n.node.id === "a")!;
    const b = layout.nodes.find((n) => n.node.id === "b")!;
    expect(a.column).toBe(0);
    expect(b.column).toBe(1);
  });

  it("computes the correct column count for a linear chain", () => {
    const g: ArchitectureGraph = {
      nodes: [node("a"), node("b"), node("c"), node("d")],
      edges: [edge("e1", "a", "b"), edge("e2", "b", "c"), edge("e3", "c", "d")],
    };
    expect(computeLayout(g).columns).toBe(4);
  });

  it("places parallel nodes in the same column", () => {
    const g: ArchitectureGraph = {
      nodes: [node("gateway"), node("svcA"), node("svcB"), node("db")],
      edges: [
        edge("e1", "gateway", "svcA"),
        edge("e2", "gateway", "svcB"),
        edge("e3", "svcA", "db"),
        edge("e4", "svcB", "db"),
      ],
    };
    const layout = computeLayout(g);
    expect(layout.columns).toBe(3); // gateway | svcA,svcB | db
    const svcA = layout.nodes.find((n) => n.node.id === "svcA")!;
    const svcB = layout.nodes.find((n) => n.node.id === "svcB")!;
    expect(svcA.column).toBe(svcB.column);
    expect(svcA.column).toBe(1);
  });

  it("is deterministic — same graph yields same layout", () => {
    const g: ArchitectureGraph = {
      nodes: [node("a"), node("b"), node("c")],
      edges: [edge("e1", "a", "b"), edge("e2", "b", "c")],
    };
    const l1 = computeLayout(g);
    const l2 = computeLayout(g);
    expect(l1.nodes.map((n) => [n.x, n.y])).toEqual(l2.nodes.map((n) => [n.x, n.y]));
  });

  it("guards against cycles without infinite looping", () => {
    const g: ArchitectureGraph = {
      nodes: [node("a"), node("b")],
      edges: [edge("e1", "a", "b"), edge("e2", "b", "a")],
    };
    expect(() => computeLayout(g)).not.toThrow();
  });
});
