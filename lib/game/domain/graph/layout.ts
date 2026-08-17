/**
 * Layered graph layout for the architecture map.
 *
 * The case data ships fixed `position` coordinates, but those assumed a wide
 * canvas and get squished when the panel is narrow. This computes a clean
 * left-to-right flow from the graph topology instead: nodes are grouped into
 * "columns" by their longest path from a root (a node with no incoming edges),
 * then vertically centered within their column. The result scales to whatever
 * width the container gives us.
 *
 * Pure: same graph in → same layout out. No DOM access.
 */

import type { ArchitectureGraph, ArchitectureNode, NodeId } from "../types";

export interface LaidOutNode {
  node: ArchitectureNode;
  /** Column index (0 = leftmost, the entry point). */
  column: number;
  /** Vertical slot within the column (0 = top). */
  row: number;
  /** Computed position in layout units (caller scales to pixels). */
  x: number;
  y: number;
}

export interface GraphLayout {
  nodes: LaidOutNode[];
  /** Number of columns. */
  columns: number;
  /** Max rows in any column (for vertical centering). */
  maxRows: number;
}

/**
 * Compute a layered layout. Layout units are arbitrary; the renderer scales
 * them to the available width/height. x advances by COLUMN_UNIT per column,
 * y by ROW_UNIT per row, with vertical centering applied per column.
 */
export function computeLayout(graph: ArchitectureGraph): GraphLayout {
  const incoming = new Map<NodeId, NodeId[]>();
  const outgoing = new Map<NodeId, NodeId[]>();
  for (const n of graph.nodes) {
    incoming.set(n.id, []);
    outgoing.set(n.id, []);
  }
  for (const e of graph.edges) {
    if (!incoming.has(e.target) || !outgoing.has(e.source)) continue;
    incoming.get(e.target)!.push(e.source);
    outgoing.get(e.source)!.push(e.target);
  }

  // Longest path from any root → column index. Roots (no incoming) are col 0.
  const columnOf = new Map<NodeId, number>();
  const visiting = new Set<NodeId>();

  function depth(id: NodeId): number {
    if (columnOf.has(id)) return columnOf.get(id)!;
    if (visiting.has(id)) return 0; // cycle guard
    visiting.add(id);
    const preds = incoming.get(id) ?? [];
    const col = preds.length === 0 ? 0 : Math.max(...preds.map(depth)) + 1;
    visiting.delete(id);
    columnOf.set(id, col);
    return col;
  }
  for (const n of graph.nodes) depth(n.id);

  // Group nodes by column, preserving case order within a column.
  const byColumn = new Map<number, ArchitectureNode[]>();
  let columns = 0;
  for (const n of graph.nodes) {
    const c = columnOf.get(n.id) ?? 0;
    columns = Math.max(columns, c + 1);
    const arr = byColumn.get(c) ?? [];
    arr.push(n);
    byColumn.set(c, arr);
  }

  const maxRows = Math.max(1, ...[...byColumn.values()].map((a) => a.length));

  const COLUMN_UNIT = 100;
  const ROW_UNIT = 100;

  const laidOut: LaidOutNode[] = [];
  for (const [col, nodes] of byColumn) {
    // Vertically center this column's nodes around the middle.
    const rowCount = nodes.length;
    const centerOffset = (maxRows - rowCount) / 2;
    nodes.forEach((node, i) => {
      laidOut.push({
        node,
        column: col,
        row: i,
        x: col * COLUMN_UNIT,
        y: (i + centerOffset) * ROW_UNIT,
      });
    });
  }

  return { nodes: laidOut, columns, maxRows };
}
