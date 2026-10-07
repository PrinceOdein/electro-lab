import { CircuitComponent, CircuitGraph, ComponentType } from "@/lib/circuit";

export interface PlacedComponent {
  id: string;
  type: Exclude<ComponentType, "wire">;
  x: number; // px, top-left of the component's bounding box
  y: number;
  props: CircuitComponent["props"];
}

export interface PlacedWire {
  id: string;
  /** terminal ref, e.g. "c1:a" */
  from: string;
  to: string;
}

export const COMPONENT_BOX = { width: 100, height: 64 };
export const TERMINAL_OFFSET = { a: { x: 4, y: 32 }, b: { x: 96, y: 32 } };

export function terminalId(componentId: string, terminal: "a" | "b") {
  return `${componentId}:${terminal}`;
}

export function terminalPosition(pc: PlacedComponent, terminal: "a" | "b") {
  const offset = TERMINAL_OFFSET[terminal];
  return { x: pc.x + offset.x, y: pc.y + offset.y };
}

export function defaultPropsFor(type: PlacedComponent["type"]): CircuitComponent["props"] {
  switch (type) {
    case "battery":
      return { voltage: 9 };
    case "resistor":
      return { resistance: 220 };
    case "led":
      return { forwardVoltage: 2 };
    case "switch":
      return { closed: true };
  }
}

export function buildGraph(components: PlacedComponent[], wires: PlacedWire[]): CircuitGraph {
  const componentEdges: CircuitComponent[] = components.map((pc) => ({
    id: pc.id,
    type: pc.type,
    props: pc.props,
    terminals: [terminalId(pc.id, "a"), terminalId(pc.id, "b")],
  }));
  const wireEdges: CircuitComponent[] = wires.map((w) => ({
    id: w.id,
    type: "wire",
    props: {},
    terminals: [w.from, w.to],
  }));
  return { components: [...componentEdges, ...wireEdges] };
}

export function genId(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}
