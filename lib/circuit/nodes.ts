import { CircuitGraph } from "./types";

/**
 * Simple disjoint-set (union-find). Every "wire" component merges its two
 * terminals into the same electrical node. Non-wire components keep their
 * terminals distinct unless a wire (or chain of wires) ties them together.
 */
class UnionFind {
  private parent = new Map<string, string>();

  find(x: string): string {
    if (!this.parent.has(x)) this.parent.set(x, x);
    let root = x;
    while (this.parent.get(root) !== root) root = this.parent.get(root)!;
    // path compression
    let cur = x;
    while (this.parent.get(cur) !== root) {
      const next = this.parent.get(cur)!;
      this.parent.set(cur, root);
      cur = next;
    }
    return root;
  }

  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

export interface NodeMap {
  /** raw terminal ID -> collapsed electrical node ID */
  terminalToNode: Map<string, string>;
  /** all distinct electrical node IDs */
  nodes: string[];
}

export function buildElectricalNodes(graph: CircuitGraph): NodeMap {
  const uf = new UnionFind();

  // touch every terminal so isolated ones still get a node
  for (const c of graph.components) {
    uf.find(c.terminals[0]);
    uf.find(c.terminals[1]);
  }

  // wires merge their two terminals
  for (const c of graph.components) {
    if (c.type === "wire") {
      uf.union(c.terminals[0], c.terminals[1]);
    }
  }

  const terminalToNode = new Map<string, string>();
  const nodeSet = new Set<string>();
  for (const c of graph.components) {
    for (const t of c.terminals) {
      const root = uf.find(t);
      terminalToNode.set(t, root);
      nodeSet.add(root);
    }
  }

  return { terminalToNode, nodes: [...nodeSet] };
}

/** Non-wire components only — wires disappear once collapsed into nodes. */
export function activeComponents(graph: CircuitGraph) {
  return graph.components.filter((c) => c.type !== "wire");
}
