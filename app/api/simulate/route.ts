import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { simulateCircuit } from "@/lib/circuit";
import type { CircuitGraph } from "@/lib/circuit";

const componentSchema = z.object({
  id: z.string(),
  type: z.enum(["battery", "resistor", "led", "switch", "wire"]),
  props: z.object({
    voltage: z.number().optional(),
    resistance: z.number().optional(),
    forwardVoltage: z.number().optional(),
    closed: z.boolean().optional(),
  }),
  terminals: z.tuple([z.string(), z.string()]),
});

const requestSchema = z.object({
  components: z.array(componentSchema),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid circuit payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const graph: CircuitGraph = { components: parsed.data.components };
  const result = simulateCircuit(graph);

  return NextResponse.json(result, { status: result.ok ? 200 : 200 });
  // Note: simulation failures (open circuit, unsupported topology, etc.) are
  // expected user states, not server errors — always 200 with ok:false, so
  // the client can render feedback without treating it as a network fault.
}
