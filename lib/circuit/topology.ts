import { CircuitComponent, CircuitGraph, TopologyType } from "./types";
import { NodeMap, activeComponents, buildElectricalNodes } from "./nodes";

export interface TopologyResult {
  ok: boolean;
  reason?: string;
  battery?: CircuitComponent;
  batteryNodes?: [string, string];
  /** non-battery, non-wire components that actually conduct (switch closed) */
  conducting: CircuitComponent[];
  nodeMap: NodeMap;
  topology?: TopologyType;
}

/**
 * MVP scope note: ElectroLab intentionally only classifies pure-series and
 * pure-parallel topologies, because those are the only two the four MVP
 * experiments (Ohm's Law, Series, Parallel, Basic LED) require. A single
 * resistor is the trivial series case (n=1). Bridge / mixed series-parallel
 * networks are out of scope for MVP — the component palette and grid size
 * are deliberately constrained so students can't accidentally build one.
 */
export function analyzeTopology(graph: CircuitGraph): TopologyResult {
  const nodeMap = buildElectricalNodes(graph);
  const active = activeComponents(graph);

  const batteries = active.filter((c) => c.type === "battery");
  if (batteries.length === 0) {
    return { ok: false, reason: "Add a battery to power the circuit.", conducting: [], nodeMap };
  }
  if (batteries.length > 1) {
    return {
      ok: false,
      reason: "Only one battery is supported in MVP circuits.",
      conducting: [],
      nodeMap,
    };
  }
  const battery = batteries[0];
  const [bA, bB] = battery.terminals.map((t) => nodeMap.terminalToNode.get(t)!);
  if (bA === bB) {
    return { ok: false, reason: "Battery terminals are shorted together.", conducting: [], nodeMap };
  }

  // components that actually conduct current right now
  const conducting = active.filter((c) => {
    if (c.type === "battery") return false;
    if (c.type === "switch") return c.props.closed !== false; // default true
    return true;
  });

  if (conducting.length === 0) {
    return {
      ok: false,
      reason: "Circuit is open — no closed path for current (check your switch).",
      conducting: [],
      nodeMap,
      battery,
      batteryNodes: [bA, bB],
    };
  }

  // detect a direct short: a bare wire (already collapsed) or zero-resistance
  // path between battery terminals with nothing else in the loop
  const directShort = conducting.some((c) => {
    const [t1, t2] = c.terminals.map((t) => nodeMap.terminalToNode.get(t)!);
    const isZeroR = c.type === "switch"; // ideal closed switch has 0 resistance
    return isZeroR && ((t1 === bA && t2 === bB) || (t1 === bB && t2 === bA));
  });
  if (directShort) {
    return {
      ok: false,
      reason: "Battery terminals are directly shorted through a closed switch with no load.",
      conducting: [],
      nodeMap,
      battery,
      batteryNodes: [bA, bB],
    };
  }

  // connectivity check between battery terminals using conducting edges
  const adj = new Map<string, string[]>();
  for (const c of conducting) {
    const [t1, t2] = c.terminals.map((t) => nodeMap.terminalToNode.get(t)!);
    if (!adj.has(t1)) adj.set(t1, []);
    if (!adj.has(t2)) adj.set(t2, []);
    adj.get(t1)!.push(t2);
    adj.get(t2)!.push(t1);
  }
  const seen = new Set<string>([bA]);
  const stack = [bA];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const next of adj.get(cur) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  if (!seen.has(bB)) {
    return {
      ok: false,
      reason: "Circuit is open — no closed path for current.",
      conducting: [],
      nodeMap,
      battery,
      batteryNodes: [bA, bB],
    };
  }

  // a single component in the loop is the trivial series case (Ohm's Law
  // experiment: one battery, one resistor) — classify before the parallel
  // check, since a lone component technically also "bridges" the battery
  if (conducting.length === 1) {
    return {
      ok: true,
      battery,
      batteryNodes: [bA, bB],
      conducting,
      nodeMap,
      topology: "series",
    };
  }

  // classify: parallel if EVERY conducting component bridges exactly [bA,bB]
  const allBridgeBattery = conducting.every((c) => {
    const [t1, t2] = c.terminals.map((t) => nodeMap.terminalToNode.get(t)!);
    return (t1 === bA && t2 === bB) || (t1 === bB && t2 === bA);
  });
  if (allBridgeBattery) {
    return {
      ok: true,
      battery,
      batteryNodes: [bA, bB],
      conducting,
      nodeMap,
      topology: "parallel",
    };
  }

  // series: every node in the conducting subgraph has degree exactly 2,
  // except the two battery nodes which have degree 1 (endpoints of the path)
  const degree = new Map<string, number>();
  for (const [node, neighbors] of adj) degree.set(node, neighbors.length);
  const isSeries =
    degree.get(bA) === 1 &&
    degree.get(bB) === 1 &&
    [...degree.entries()].every(([node, d]) => node === bA || node === bB || d === 2) &&
    conducting.length === [...seen].length - 1; // path has (nodeCount - 1) edges

  if (isSeries) {
    return {
      ok: true,
      battery,
      batteryNodes: [bA, bB],
      conducting,
      nodeMap,
      topology: "series",
    };
  }

  return {
    ok: false,
    reason:
      "This circuit mixes series and parallel connections. ElectroLab's MVP only supports pure series or pure parallel circuits — try simplifying.",
    conducting,
    nodeMap,
    battery,
    batteryNodes: [bA, bB],
  };
}
