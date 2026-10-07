import { CircuitComponent, CircuitGraph, ComponentReading, DEFAULT_LED_FORWARD_VOLTAGE, SimulationResult } from "./types";
import { analyzeTopology } from "./topology";

function resistanceOf(c: CircuitComponent): number {
  if (c.type === "resistor") return c.props.resistance ?? 0;
  if (c.type === "switch") return 0; // ideal closed switch
  return 0;
}

function ledForwardVoltage(c: CircuitComponent): number {
  return c.props.forwardVoltage ?? DEFAULT_LED_FORWARD_VOLTAGE;
}

function solveSeries(battery: CircuitComponent, conducting: CircuitComponent[]): SimulationResult {
  const V = battery.props.voltage ?? 0;
  const leds = conducting.filter((c) => c.type === "led");
  const resistors = conducting.filter((c) => c.type === "resistor" || c.type === "switch");

  const totalR = resistors.reduce((sum, c) => sum + resistanceOf(c), 0);
  const totalLedDrop = leds.reduce((sum, c) => sum + ledForwardVoltage(c), 0);

  const availableV = V - totalLedDrop;

  if (leds.length > 0 && totalR === 0) {
    return {
      ok: false,
      error:
        "LED has no current-limiting resistor in series. Add a resistor to protect the LED from excess current.",
    };
  }

  if (availableV <= 0) {
    // not enough voltage to forward-bias the LED(s) — LED(s) stay off, no current flows
    const readings: ComponentReading[] = conducting.map((c) => ({
      id: c.id,
      type: c.type,
      voltage: 0,
      current: 0,
      power: 0,
      state: c.type === "led" ? "off" : undefined,
    }));
    return {
      ok: true,
      topology: "series",
      totalVoltage: V,
      totalCurrent: 0,
      totalResistance: totalR,
      totalPower: 0,
      readings,
    };
  }

  const I = totalR > 0 ? availableV / totalR : 0;
  const totalPower = V * I;

  const readings: ComponentReading[] = conducting.map((c) => {
    if (c.type === "led") {
      return {
        id: c.id,
        type: c.type,
        voltage: ledForwardVoltage(c),
        current: I,
        power: ledForwardVoltage(c) * I,
        state: I > 0 ? "on" : "off",
      };
    }
    const r = resistanceOf(c);
    const v = I * r;
    return {
      id: c.id,
      type: c.type,
      voltage: v,
      current: I,
      power: v * I,
    };
  });

  return {
    ok: true,
    topology: "series",
    totalVoltage: V,
    totalCurrent: I,
    totalResistance: totalR,
    totalPower,
    readings,
  };
}

function solveParallel(battery: CircuitComponent, conducting: CircuitComponent[]): SimulationResult {
  const V = battery.props.voltage ?? 0;

  // any bare LED branch (no resistor in that same branch) is unsafe in this
  // simplified two-terminal model — flag it rather than dividing by zero
  const bareLed = conducting.find((c) => c.type === "led");
  if (bareLed) {
    return {
      ok: false,
      error:
        "An LED branch has no current-limiting resistor. In parallel, each LED needs its own series resistor — this simple model can't safely compute that branch as drawn.",
    };
  }

  const readings: ComponentReading[] = conducting.map((c) => {
    const r = resistanceOf(c);
    const i = r > 0 ? V / r : 0;
    return {
      id: c.id,
      type: c.type,
      voltage: V,
      current: i,
      power: V * i,
    };
  });

  const totalCurrent = readings.reduce((sum, r) => sum + r.current, 0);
  const totalResistance = totalCurrent > 0 ? V / totalCurrent : Infinity;
  const totalPower = V * totalCurrent;

  return {
    ok: true,
    topology: "parallel",
    totalVoltage: V,
    totalCurrent,
    totalResistance,
    totalPower,
    readings,
  };
}

export function simulateCircuit(graph: CircuitGraph): SimulationResult {
  const topo = analyzeTopology(graph);
  if (!topo.ok || !topo.battery || !topo.topology) {
    return { ok: false, error: topo.reason ?? "Unable to analyze circuit." };
  }

  if (topo.topology === "series") return solveSeries(topo.battery, topo.conducting);
  if (topo.topology === "parallel") return solveParallel(topo.battery, topo.conducting);

  return { ok: false, error: topo.reason ?? "Unsupported topology." };
}
