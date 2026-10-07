export type ComponentType = "battery" | "resistor" | "led" | "switch" | "wire";

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  props: {
    voltage?: number; // battery, volts
    resistance?: number; // resistor, ohms
    forwardVoltage?: number; // led, volts (default 2.0)
    closed?: boolean; // switch (default true)
  };
  terminals: [string, string]; // raw terminal IDs before node collapsing
}

export interface CircuitGraph {
  components: CircuitComponent[];
}

export type TopologyType =
  | "series"
  | "parallel"
  | "series-parallel"
  | "open"
  | "short"
  | "unsupported";

export interface ComponentReading {
  id: string;
  type: ComponentType;
  voltage: number; // volts across the component
  current: number; // amps through the component
  power: number; // watts dissipated/delivered
  state?: "on" | "off"; // for LED / switch
}

export interface SimulationResult {
  ok: boolean;
  topology?: TopologyType;
  totalVoltage?: number;
  totalCurrent?: number;
  totalResistance?: number;
  totalPower?: number;
  readings?: ComponentReading[];
  error?: string;
}

export const DEFAULT_LED_FORWARD_VOLTAGE = 2.0;
