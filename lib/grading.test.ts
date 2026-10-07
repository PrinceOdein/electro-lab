import { describe, it, expect } from "vitest";
import { autoGrade, TargetCircuit } from "./grading";
import { simulateCircuit, CircuitGraph } from "./circuit";

function wire(id: string, a: string, b: string) {
  return { id, type: "wire" as const, props: {}, terminals: [a, b] as [string, string] };
}

const ohmsLawTarget: TargetCircuit = {
  topology: "series",
  tolerancePct: 5,
  minComponentCounts: { resistor: 1 },
};

const seriesTarget: TargetCircuit = {
  topology: "series",
  tolerancePct: 5,
  minComponentCounts: { resistor: 2 },
};

describe("autoGrade — topology-only bug this module fixes", () => {
  it("a single-resistor circuit gets full credit for Ohm's Law", () => {
    const graph: CircuitGraph = {
      components: [
        { id: "b1", type: "battery", props: { voltage: 9 }, terminals: ["b+", "b-"] },
        { id: "r1", type: "resistor", props: { resistance: 100 }, terminals: ["n1", "n2"] },
        wire("w1", "b+", "n1"),
        wire("w2", "n2", "b-"),
      ],
    };
    const result = simulateCircuit(graph);
    const grade = autoGrade(graph, result, ohmsLawTarget);
    expect(grade?.score).toBe(100);
  });

  it("the SAME single-resistor circuit does NOT get full credit for Series Circuits", () => {
    const graph: CircuitGraph = {
      components: [
        { id: "b1", type: "battery", props: { voltage: 9 }, terminals: ["b+", "b-"] },
        { id: "r1", type: "resistor", props: { resistance: 100 }, terminals: ["n1", "n2"] },
        wire("w1", "b+", "n1"),
        wire("w2", "n2", "b-"),
      ],
    };
    const result = simulateCircuit(graph);
    const grade = autoGrade(graph, result, seriesTarget);
    expect(grade?.score).toBeLessThan(100);
    expect(grade?.feedback).toMatch(/2\+ resistor/i);
  });

  it("a two-resistor series circuit gets full credit for Series Circuits", () => {
    const graph: CircuitGraph = {
      components: [
        { id: "b1", type: "battery", props: { voltage: 9 }, terminals: ["b+", "b-"] },
        { id: "r1", type: "resistor", props: { resistance: 100 }, terminals: ["n1", "n2"] },
        { id: "r2", type: "resistor", props: { resistance: 100 }, terminals: ["n2", "n3"] },
        wire("w1", "b+", "n1"),
        wire("w2", "n3", "b-"),
      ],
    };
    const result = simulateCircuit(graph);
    const grade = autoGrade(graph, result, seriesTarget);
    expect(grade?.score).toBe(100);
  });
});

describe("autoGrade — other cases", () => {
  it("returns null when the experiment has no target", () => {
    const graph: CircuitGraph = { components: [] };
    const result = simulateCircuit(graph);
    expect(autoGrade(graph, result, null)).toBeNull();
  });

  it("scores 0 with a descriptive message when the circuit doesn't simulate at all", () => {
    const graph: CircuitGraph = { components: [] };
    const result = simulateCircuit(graph);
    const grade = autoGrade(graph, result, ohmsLawTarget);
    expect(grade?.score).toBe(0);
    expect(grade?.feedback).toMatch(/battery/i);
  });

  it("scores low when topology itself doesn't match", () => {
    const graph: CircuitGraph = {
      components: [
        { id: "b1", type: "battery", props: { voltage: 9 }, terminals: ["b+", "b-"] },
        { id: "r1", type: "resistor", props: { resistance: 100 }, terminals: ["n1", "n2"] },
        { id: "r2", type: "resistor", props: { resistance: 100 }, terminals: ["n1", "n2"] },
        wire("w1", "b+", "n1"),
        wire("w2", "n2", "b-"),
      ],
    };
    const result = simulateCircuit(graph); // this is parallel
    const grade = autoGrade(graph, result, seriesTarget);
    expect(grade?.score).toBe(20);
  });
});
