"use client";

import { CircuitCanvas } from "@/components/canvas/CircuitCanvas";

// No database required — lets you sanity-check the canvas UI immediately
// after `npm install && npm run dev`, before Postgres/Prisma are set up.
export default function DemoPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="mb-4 text-xl font-bold text-slate-100">ElectroLab — canvas demo</h1>
      <p className="mb-4 max-w-2xl text-sm text-slate-400">
        Drag parts onto the board, drag between the small dots to wire them, drag a
        placed part to move it, click a part to edit its value, click a switch to
        toggle it.
      </p>
      <CircuitCanvas allowedParts={["battery", "resistor", "led", "switch"]} />
    </main>
  );
}
