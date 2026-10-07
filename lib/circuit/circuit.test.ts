import { describe, it, expect } from "vitest";
import { simulateCircuit } from "./solve";
import { CircuitGraph } from "./types";

function wire(id: string, a: string, b: string) {
  return { id, type: "wire" as const, props: {}, terminals: [a, b] as [string, string] };
}

describe("Ohm's Law — single resistor", () => {
  it("computes I = V/R for a 9V battery and 100 ohm resistor", () => {
    const graph: CircuitGraph = {
      components: [
        { id: "b1", type: "battery", props: { voltage: 9 }, terminals: ["b+", "b-"] },
        { id: "r1", type: "resistor", props: { resistance: 100 }, terminals: ["n1", "n2"] },
        wire("w1", "b+", "n1"),
        wire("w2", "n2", "b-"),
      ],
    };
    const result = simulateCircuit(graph);
    expect(result.ok).toBe(true);
    expect(result.topology).toBe("series");
    expect(result.totalCurrent).toBeCloseTo(0.09, 5); // 9/100
    expect(result.totalResistance).toBe(100);
    expect(result.totalPower).toBeCloseTo(0.81, 5); // V*I
  });
});

describe("Series circuit", () => {
  it("sums resistances and keeps current equal through every resistor", () => {
    const graph: CircuitGraph = {
      components: [
        { id: "b1", type: "battery", props: { voltage: 12 }, terminals: ["b+", "b-"] },
        { id: "r1", type: "resistor", props: { resistance: 100 }, terminals: ["n1", "n2"] },
        { id: "r2", type: "resistor", props: { resistance: 200 }, terminals: ["n2", "n3"] },
        wire("w1", "b+", "n1"),
        wire("w2", "n3", "b-"),
      ],
    };
    const result = simulateCircuit(graph);
    expect(result.ok).toBe(true);
    expect(result.topology).toBe("series");
    expect(result.totalResistance).toBe(300);
    expect(result.totalCurrent).toBeCloseTo(12 / 300, 5);
    const r1 = result.readings!.find((r) => r.id === "r1")!;
    const r2 = result.readings!.find((r) => r.id === "r2")!;
    expect(r1.current).toBeCloseTo(r2.current, 5); // same current through series
    expect(r1.voltage).toBeCloseTo(4, 5); // I*100
    expect(r2.voltage).toBeCloseTo(8, 5); // I*200
  });
});

describe("Parallel circuit", () => {
  it("keeps voltage equal across branches and sums branch currents", () => {
    const graph: CircuitGraph = {
      components: [
        { id: "b1", type: "battery", props: { voltage: 6 }, terminals: ["b+", "b-"] },
        { id: "r1", type: "resistor", props: { resistance: 100 }, terminals: ["n1", "n2"] },
        { id: "r2", type: "resistor", props: { resistance: 200 }, terminals: ["n1", "n2"] },
        wire("w1", "b+", "n1"),
        wire("w2", "n2", "b-"),
      ],
    };
    const result = simulateCircuit(graph);
    expect(result.ok).toBe(true);
    expect(result.topology).toBe("parallel");
    const r1 = result.readings!.find((r) => r.id === "r1")!;
    const r2 = result.readings!.find((r) => r.id === "r2")!;
    expect(r1.voltage).toBeCloseTo(6, 5);
    expect(r2.voltage).toBeCloseTo(6, 5);
    expect(r1.current).toBeCloseTo(0.06, 5); // 6/100
    expect(r2.current).toBeCloseTo(0.03, 5); // 6/200
    expect(result.totalCurrent).toBeCloseTo(0.09, 5);
    expect(result.totalResistance).toBeCloseTo(1 / (1 / 100 + 1 / 200), 5); // ~66.67
  });
});

describe("Basic LED circuit", () => {
  it("drops the LED forward voltage and limits current via the resistor", () => {
    const graph: CircuitGraph = {
      components: [
        { id: "b1", type: "battery", props: { voltage: 9 }, terminals: ["b+", "b-"] },
        { id: "r1", type: "resistor", props: { resistance: 470 }, terminals: ["n1", "n2"] },
        { id: "led1", type: "led", props: { forwardVoltage: 2 }, terminals: ["n2", "n3"] },
        wire("w1", "b+", "n1"),
        wire("w2", "n3", "b-"),
      ],
    };
    const result = simulateCircuit(graph);
    expect(result.ok).toBe(true);
    const expectedI = (9 - 2) / 470;
    expect(result.totalCurrent).toBeCloseTo(expectedI, 5);
    const led = result.readings!.find((r) => r.id === "led1")!;
    expect(led.state).toBe("on");
    expect(led.voltage).toBeCloseTo(2, 5);
  });

  it("rejects an LED with no current-limiting resistor", () => {
    const graph: CircuitGraph = {
      components: [
        { id: "b1", type: "battery", props: { voltage: 9 }, terminals: ["b+", "b-"] },
        { id: "led1", type: "led", props: { forwardVoltage: 2 }, terminals: ["n1", "n2"] },
        wire("w1", "b+", "n1"),
        wire("w2", "n2", "b-"),
      ],
    };
    const result = simulateCircuit(graph);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/current-limiting resistor/i);
  });
});

describe("Fault conditions", () => {
  it("flags an open circuit (switch open)", () => {
    const graph: CircuitGraph = {
      components: [
        { id: "b1", type: "battery", props: { voltage: 9 }, terminals: ["b+", "b-"] },
        { id: "r1", type: "resistor", props: { resistance: 100 }, terminals: ["n1", "n2"] },
        { id: "s1", type: "switch", props: { closed: false }, terminals: ["n2", "n3"] },
        wire("w1", "b+", "n1"),
        wire("w2", "n3", "b-"),
      ],
    };
    const result = simulateCircuit(graph);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/open/i);
  });

  it("flags a circuit with no battery", () => {
    const graph: CircuitGraph = {
      components: [{ id: "r1", type: "resistor", props: { resistance: 100 }, terminals: ["n1", "n2"] }],
    };
    const result = simulateCircuit(graph);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/battery/i);
  });

  it("flags a mixed series-parallel topology as out of MVP scope", () => {
    const graph: CircuitGraph = {
      components: [
        { id: "b1", type: "battery", props: { voltage: 9 }, terminals: ["b+", "b-"] },
        { id: "r1", type: "resistor", props: { resistance: 100 }, terminals: ["n1", "n2"] },
        { id: "r2", type: "resistor", props: { resistance: 100 }, terminals: ["n2", "n3"] },
        { id: "r3", type: "resistor", props: { resistance: 100 }, terminals: ["n2", "n3"] },
        wire("w1", "b+", "n1"),
        wire("w2", "n3", "b-"),
      ],
    };
    const result = simulateCircuit(graph);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/series and parallel/i);
  });
});
