import { CircuitGraph, ComponentType, SimulationResult, activeComponents } from "@/lib/circuit";

export interface TargetCircuit {
  topology: "series" | "parallel";
  tolerancePct: number;
  /**
   * Minimum count required of each component type for the circuit to count
   * as actually demonstrating this experiment — not just happening to
   * share the same topology. Without this, "Ohm's Law" (1 resistor) and
   * "Series Circuits" (2+ resistors) both simulate to topology "series"
   * and would be indistinguishable to the grader. Missing keys mean "no
   * minimum" for that type.
   */
  minComponentCounts?: Partial<Record<Exclude<ComponentType, "wire">, number>>;
}

export interface GradeResult {
  score: number;
  feedback: string;
}

function tallyByType(graph: CircuitGraph): Partial<Record<Exclude<ComponentType, "wire">, number>> {
  const counts: Partial<Record<Exclude<ComponentType, "wire">, number>> = {};
  for (const c of activeComponents(graph)) {
    const type = c.type as Exclude<ComponentType, "wire">;
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}

/**
 * MVP auto-grading. This is a first pass, not a substitute for instructor
 * review — it gives partial credit for partial correctness so a student
 * gets useful feedback immediately on submit, and an instructor can still
 * override via the grading form (which is authoritative once used).
 */
export function autoGrade(graph: CircuitGraph, measurements: SimulationResult, target: TargetCircuit | null): GradeResult | null {
  if (!target) return null;

  if (!measurements.ok) {
    return { score: 0, feedback: `Circuit doesn't work yet: ${measurements.error}` };
  }

  if (measurements.topology !== target.topology) {
    return {
      score: 20,
      feedback: `This experiment expects a ${target.topology} circuit, but what you built simulates as ${measurements.topology}.`,
    };
  }

  const counts = tallyByType(graph);
  const missing: string[] = [];
  for (const [type, min] of Object.entries(target.minComponentCounts ?? {})) {
    const have = counts[type as Exclude<ComponentType, "wire">] ?? 0;
    if (have < (min as number)) {
      missing.push(`${min}+ ${type}${(min as number) > 1 ? "s" : ""} (you have ${have})`);
    }
  }
  if (missing.length > 0) {
    return {
      score: 50,
      feedback: `Correct topology, but this experiment needs: ${missing.join(", ")}.`,
    };
  }

  return { score: 100, feedback: "Circuit matches this experiment's requirements." };
}
